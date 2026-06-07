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

function collectTests(result) {
  if (Array.isArray(result.tests) && result.tests.length) {
    return result.tests.map((test) => ({
      ...test,
      state: getTestState(result, test.fullTitle),
    }));
  }

  const tests = [];

  function walkSuite(suite, titlePath = []) {
    const currentPath = suite.title ? [...titlePath, suite.title] : titlePath;

    if (Array.isArray(suite.tests)) {
      suite.tests.forEach((test) => {
        tests.push({
          ...test,
          fullTitle: [...currentPath, test.title].join(" "),
        });
      });
    }

    if (Array.isArray(suite.suites)) {
      suite.suites.forEach((childSuite) => walkSuite(childSuite, currentPath));
    }
  }

  if (Array.isArray(result.results)) {
    result.results.forEach((suite) => walkSuite(suite));
  }

  return tests;
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
  const rowsHtml = rows
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cypress Execution Results</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; margin: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 10px; vertical-align: top; }
    th { background: #f3f3f3; text-align: left; }
    tr:nth-child(even) { background: #fafafa; }
    code { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>Cypress Execution Results</h1>
  <p>Generated from manual test case files in <code>cypress/manual-testing</code> and Cypress run output.</p>
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
      ${rowsHtml}
    </tbody>
  </table>
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
    };
  });
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
