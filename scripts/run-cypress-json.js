const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const reportDir = path.join(root, "cypress", "results");
const reportPath = path.join(reportDir, "cypress-results.json");

fs.mkdirSync(reportDir, { recursive: true });

const child = spawn("npx", ["cypress", "run", "--reporter", "json"], {
  shell: true,
  cwd: root,
});

let stdout = "";
child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  stdout += text;
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk.toString());
});

child.on("close", (code) => {
  // Extract all JSON objects from output (one per spec)
  const jsonRegex = /\{[\s\S]*?"stats"[\s\S]*?\n\}/g;
  const matches = stdout.match(jsonRegex);

  if (!matches || matches.length === 0) {
    console.error("Unable to extract JSON report from Cypress output.");
    process.exit(code || 1);
  }

  try {
    // Parse each JSON object and aggregate
    const results = matches.map((match) => JSON.parse(match));

    // Aggregate results from all specs
    const aggregated = aggregateResults(results);

    const jsonText = JSON.stringify(aggregated, null, 2);
    fs.writeFileSync(reportPath, jsonText, "utf8");
    console.log(`\nCypress JSON report written to ${reportPath}`);
    process.exit(code);
  } catch (error) {
    console.error("Error parsing or aggregating reports:", error.message);
    process.exit(1);
  }
});

function aggregateResults(resultsList) {
  if (resultsList.length === 0) {
    return { stats: {}, tests: [], passes: [], failures: [], pending: [] };
  }

  if (resultsList.length === 1) {
    return resultsList[0];
  }

  // Aggregate multiple specs
  const aggregated = {
    stats: {
      suites: 0,
      tests: 0,
      passes: 0,
      pending: 0,
      failures: 0,
      start: resultsList[0].stats.start,
      end: resultsList[resultsList.length - 1].stats.end,
      duration: 0,
    },
    tests: [],
    passes: [],
    failures: [],
    pending: [],
    results: resultsList, // Include individual results
  };

  let totalDuration = 0;

  resultsList.forEach((result) => {
    aggregated.stats.suites += result.stats.suites;
    aggregated.stats.tests += result.stats.tests;
    aggregated.stats.passes += result.stats.passes;
    aggregated.stats.pending += result.stats.pending;
    aggregated.stats.failures += result.stats.failures;
    totalDuration += result.stats.duration;

    if (result.tests) aggregated.tests.push(...result.tests);
    if (result.passes) aggregated.passes.push(...result.passes);
    if (result.failures) aggregated.failures.push(...result.failures);
    if (result.pending) aggregated.pending.push(...result.pending);
  });

  aggregated.stats.duration = totalDuration;

  return aggregated;
}
