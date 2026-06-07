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
  const statsMatch = stdout.match(/\{\s*"stats":/);
  if (!statsMatch) {
    console.error("Unable to extract JSON report from Cypress output.");
    process.exit(code || 1);
  }

  const startIndex = statsMatch.index;
  const endIndex = stdout.lastIndexOf("}");
  if (endIndex === -1 || endIndex <= startIndex) {
    console.error("Unable to extract JSON report from Cypress output.");
    process.exit(code || 1);
  }

  const jsonText = stdout.slice(startIndex, endIndex + 1);
  try {
    JSON.parse(jsonText);
  } catch (error) {
    console.error("Extracted report is not valid JSON:", error.message);
    process.exit(1);
  }

  fs.writeFileSync(reportPath, jsonText, "utf8");
  console.log(`\nCypress JSON report written to ${reportPath}`);
  process.exit(code);
});
