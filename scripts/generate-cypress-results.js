const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const manualTestingDir = path.join(root, "cypress", "manual-testing");
const reportDir = path.join(root, "cypress", "results");
const screenshotDir = path.join(root, "cypress", "screenshots");
const outputPath = path.join(
  root,
  "cypress",
  "manual-testing",
  "cypress-results.html",
);

function getTestCaseFiles(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Manual testing directory not found: ${directory}`);
  }

  return findFilesRecursively(directory, (filePath) =>
    /test-cases.*\.md$/i.test(path.basename(filePath)),
  );
}

function parseAllTestCases() {
  const files = getTestCaseFiles(manualTestingDir);
  if (!files.length) {
    throw new Error(`No manual test case files found in ${manualTestingDir}`);
  }

  return files.flatMap((filePath) => {
    const rawMd = fs.readFileSync(filePath, "utf8");
    return parseTestCasesFromMarkdown(rawMd);
  });
}

function parseTestCasesFromMarkdown(md) {
  if (/^###\s+Scenario\s+\d+: /m.test(md)) {
    return parseTestCases(md);
  }

  return parseTreezStyleTestCases(md);
}

function parseTreezStyleTestCases(md) {
  const cases = [];
  const sectionRegex =
    /Test Case ID:\s*(.+)\r?\nScenario:\s*(.+)\r?\n([\s\S]*?)(?=^---|\z)/gim;
  let match;

  while ((match = sectionRegex.exec(md)) !== null) {
    const id = match[1].trim();
    const scenario = match[2].trim();
    const body = match[3];
    const steps = extractField(body, "Steps");
    const expected = extractField(body, "Expected Result");

    cases.push({
      id,
      title: `${id} ${scenario}`,
      scenario,
      steps,
      expected,
    });
  }

  return cases;
}

function parseTestCases(md) {
  const cases = [];
  const sectionRegex =
    /^###\s+Scenario\s+\d+:\s+(.+)\r?\n([\s\S]*?)(?=^###\s+Scenario\s+\d+:|\z)/gm;
  let match;

  while ((match = sectionRegex.exec(md)) !== null) {
    const title = match[1].trim();
    const body = match[2];
    const steps = extractField(body, "Steps");
    const expected = extractField(body, "Expected");

    cases.push({
      title,
      steps,
      expected,
    });
  }

  return cases;
}

function extractField(body, fieldName) {
  const regex = new RegExp(
    `${fieldName}:\r?\n([\s\S]*?)(?=^\s*[-A-Za-z0-9 ]+?:|\z)`,
    "m",
  );
  const match = body.match(regex);
  if (!match) {
    return "";
  }

  const fieldText = match[1].trim();
  return fieldText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("<br />");
}

function getLatestReportFile(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Report directory not found: ${directory}`);
  }

  const allFiles = findFilesRecursively(directory, (filePath) =>
    filePath.endsWith(".json"),
  );
  if (!allFiles.length) {
    throw new Error(`No report JSON files found in ${directory}`);
  }

  return allFiles
    .sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs)
    .pop();
}

function collectTests(report) {
  const tests = [];

  // Handle aggregated results from multiple specs
  if (Array.isArray(report.results) && report.results.length > 0) {
    report.results.forEach((specResult, specIndex) => {
      const specFile = extractSpecFileFromResult(specResult, specIndex);

      if (Array.isArray(specResult.tests)) {
        specResult.tests.forEach((test) => {
          tests.push({
            ...test,
            state: getTestStateFromResult(specResult, test.fullTitle),
            spec: specFile,
          });
        });
      }
    });
  } else if (Array.isArray(report.tests) && report.tests.length) {
    // Single spec result
    return report.tests.map((test) => ({
      ...test,
      state: getTestState(report, test.fullTitle),
      spec: "unknown",
    }));
  }

  // If no tests found in above, walk the suite structure
  if (tests.length === 0) {
    function walkSuite(suite, titlePath = [], specFile = "unknown") {
      const currentPath = suite.title ? [...titlePath, suite.title] : titlePath;

      if (Array.isArray(suite.tests)) {
        suite.tests.forEach((test) => {
          tests.push({
            ...test,
            fullTitle: [...currentPath, test.title].join(" "),
            spec: specFile,
            state: "unknown",
          });
        });
      }

      if (Array.isArray(suite.suites)) {
        suite.suites.forEach((childSuite) =>
          walkSuite(childSuite, currentPath, specFile),
        );
      }
    }

    if (Array.isArray(report.results)) {
      report.results.forEach((result, idx) => {
        const specFile = extractSpecFileFromResult(result, idx);
        if (Array.isArray(result.results)) {
          result.results.forEach((suite) => walkSuite(suite, [], specFile));
        }
      });
    }
  }

  return tests;
}

function extractSpecFileFromResult(result, index) {
  // Try to find spec name from the result object
  if (result.config && result.config.specPattern) {
    return result.config.specPattern;
  }

  // Fallback: try to infer from test titles
  if (result.tests && result.tests.length > 0) {
    const firstTest = result.tests[0];
    if (firstTest.file) return firstTest.file;

    // Try to extract from fullTitle
    const match = firstTest.fullTitle.match(/(login|treez)/i);
    if (match) {
      return match[0].toLowerCase() === "treez"
        ? "treez-login.cy.js"
        : "login.cy.js";
    }
  }

  return `spec-${index}.cy.js`;
}

function getTestStateFromResult(result, fullTitle) {
  if (
    Array.isArray(result.passes) &&
    result.passes.some((test) => test.fullTitle === fullTitle)
  ) {
    return "passed";
  }
  if (
    Array.isArray(result.failures) &&
    result.failures.some((test) => test.fullTitle === fullTitle)
  ) {
    return "failed";
  }
  if (
    Array.isArray(result.pending) &&
    result.pending.some((test) => test.fullTitle === fullTitle)
  ) {
    return "pending";
  }
  return "unknown";
}

function getTestState(result, fullTitle) {
  if (
    Array.isArray(result.passes) &&
    result.passes.some((test) => test.fullTitle === fullTitle)
  ) {
    return "passed";
  }
  if (
    Array.isArray(result.failures) &&
    result.failures.some((test) => test.fullTitle === fullTitle)
  ) {
    return "failed";
  }
  return "unknown";
}

function findScreenshot(testTitle) {
  if (!fs.existsSync(screenshotDir)) {
    return null;
  }

  const normalized = normalizePath(testTitle);
  const screenshotFiles = findFilesRecursively(screenshotDir, (filePath) =>
    filePath.endsWith(".png"),
  );
  const candidate = screenshotFiles.find((filePath) =>
    normalizePath(filePath).includes(normalized),
  );
  return candidate || null;
}

function findFilesRecursively(directory, filter) {
  const results = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFilesRecursively(entryPath, filter));
    } else if (filter(entryPath)) {
      results.push(entryPath);
    }
  }

  return results;
}

function normalizePath(value) {
  return value.replace(/\\/g, "/").toLowerCase();
}

function createHtml(rows) {
  // Group rows by spec file
  const rowsBySpec = {};
  rows.forEach((row) => {
    const spec = row.spec || "unknown";
    if (!rowsBySpec[spec]) {
      rowsBySpec[spec] = [];
    }
    rowsBySpec[spec].push(row);
  });

  // Generate spec summary
  const specSummary = Object.entries(rowsBySpec)
    .map(([spec, specRows]) => {
      const passed = specRows.filter((r) => r.status === "Passed").length;
      const failed = specRows.filter((r) => r.status === "Failed").length;
      const total = specRows.length;
      return `
        <tr>
          <td><strong>${escapeHtml(spec)}</strong></td>
          <td>${total}</td>
          <td style="color: green;">${passed}</td>
          <td style="color: red;">${failed}</td>
        </tr>`;
    })
    .join("\n");

  // Generate detailed rows for each spec
  const detailedRowsHtml = Object.entries(rowsBySpec)
    .map(([spec, specRows]) => {
      const specRows_html = specRows
        .map((row) => {
          const screenshotTag = row.screenshot
            ? `<a href="${row.relativeScreenshotPath}" target="_blank"><img src="${row.relativeScreenshotPath}" alt="Screenshot" style="max-width:300px; max-height:200px; display:block; margin-top:0.5rem; border:1px solid #ddd;" /></a>`
            : "";

          return `
        <tr>
          <td>${escapeHtml(row.scenario)}</td>
          <td>${row.steps}</td>
          <td>${row.expected}</td>
          <td>${escapeHtml(row.actual)}</td>
          <td>${escapeHtml(row.status)}</td>
          <td>${screenshotTag}</td>
        </tr>`;
        })
        .join("\n");

      return `
      <h2>${escapeHtml(spec)}</h2>
      <table>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Steps</th>
            <th>Expected</th>
            <th>Actual</th>
            <th>Status</th>
            <th>Screenshot</th>
          </tr>
        </thead>
        <tbody>
          ${specRows_html}
        </tbody>
      </table>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cypress Execution Results</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; margin: 24px; background-color: #f9f9f9; }
    h1 { color: #333; }
    h2 { color: #0066cc; margin-top: 2rem; border-bottom: 2px solid #0066cc; padding-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; background: white; }
    th, td { border: 1px solid #ccc; padding: 12px; vertical-align: top; text-align: left; }
    th { background: #e8f0ff; color: #333; font-weight: bold; }
    tr:nth-child(even) { background: #fafafa; }
    tr:hover { background: #f0f0f0; }
    code { white-space: pre-wrap; font-family: monospace; }
    .summary-table td { text-align: center; }
    .summary-table td:first-child { text-align: left; }
  </style>
</head>
<body>
  <h1>Cypress Execution Results</h1>
  <p>Generated from manual test case files in <code>cypress/manual-testing</code> and Cypress run output.</p>
  
  <h2>Execution Summary</h2>
  <table class="summary-table">
    <thead>
      <tr>
        <th>Spec File</th>
        <th>Total Tests</th>
        <th style="color: green;">Passed</th>
        <th style="color: red;">Failed</th>
      </tr>
    </thead>
    <tbody>
      ${specSummary}
    </tbody>
  </table>

  <h2>Detailed Results</h2>
  ${detailedRowsHtml}
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function findBestCaseInfo(test, testCases) {
  const exactMatch = testCases.find((item) => item.title === test.title);
  if (exactMatch) {
    return exactMatch;
  }

  const idMatch = test.title.match(/(TC-[A-Z0-9_-]+)/i);
  if (idMatch) {
    const caseById = testCases.find(
      (item) => item.id && item.id.toLowerCase() === idMatch[1].toLowerCase(),
    );
    if (caseById) {
      return caseById;
    }
  }

  const normalizedTestTitle = normalizeText(test.title);
  const fuzzyMatch = testCases.find((item) => {
    const normalizedCaseTitle = normalizeText(item.title);
    const normalizedScenario = normalizeText(item.scenario || item.title);
    return (
      normalizedCaseTitle === normalizedTestTitle ||
      normalizedCaseTitle.includes(normalizedTestTitle) ||
      normalizedTestTitle.includes(normalizedCaseTitle) ||
      normalizedScenario.includes(normalizedTestTitle) ||
      normalizedTestTitle.includes(normalizedScenario)
    );
  });

  return fuzzyMatch || null;
}

function normalizeText(value) {
  return String(value).replace(/\s+/g, " ").trim().toLowerCase();
}

function buildRows(testCases, tests) {
  return tests.map((test) => {
    const caseInfo = findBestCaseInfo(test, testCases) || {
      steps: "",
      expected: "",
    };
    const actual =
      test.state === "passed" ? "Passed" : test.err?.message || "Failed";
    const screenshotAbsolute =
      test.state === "failed" ? findScreenshot(test.fullTitle) : null;
    const relativeScreenshotPath = screenshotAbsolute
      ? normalizePath(
          path.relative(path.dirname(outputPath), screenshotAbsolute),
        )
      : "";

    return {
      scenario: test.title,
      steps: caseInfo.steps || "",
      expected: caseInfo.expected || "",
      actual,
      status: test.state === "passed" ? "Passed" : "Failed",
      screenshot: Boolean(screenshotAbsolute),
      relativeScreenshotPath,
      spec: extractSpecFileName(test.spec || test.fullTitle),
    };
  });
}

function extractSpecFileName(fullPath) {
  // Extract spec file name from full path or title
  const match = fullPath.match(/([^\/\\]+\.cy\.js)/);
  return match ? match[1] : "unknown";
}

function main() {
  const testCases = parseAllTestCases();
  fs.mkdirSync(reportDir, { recursive: true });

  const jsonReportPath = path.join(reportDir, "cypress-results.json");
  const reportPath = fs.existsSync(jsonReportPath)
    ? jsonReportPath
    : getLatestReportFile(reportDir);
  const rawReportText = fs.readFileSync(reportPath, "utf8");
  const jsonStart = rawReportText.indexOf("{");
  const jsonEnd = rawReportText.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`Unable to parse JSON from report file: ${reportPath}`);
  }

  const report = JSON.parse(rawReportText.slice(jsonStart, jsonEnd + 1));
  const tests = collectTests(report);
  const rows = buildRows(testCases, tests);

  fs.writeFileSync(outputPath, createHtml(rows), "utf8");
  console.log(`Generated Cypress results at ${outputPath}`);
}

main();
