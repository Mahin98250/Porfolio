import { readFileSync } from "node:fs";

const reportPath = process.argv[2] ?? "npm-audit.json";
let report;
try {
  report = JSON.parse(readFileSync(reportPath, "utf8"));
} catch (error) {
  console.error(`Could not read a valid npm audit JSON report at ${reportPath}.`);
  console.error(error instanceof Error ? error.message : "Unknown report parsing error.");
  process.exit(1);
}

const vulnerabilities = Object.entries(report.vulnerabilities ?? {});
const severe = vulnerabilities.filter(([, vulnerability]) =>
  vulnerability.severity === "high" || vulnerability.severity === "critical"
);

function isDocumentedNoFixBracesException(name, vulnerability) {
  return (
    name === "braces" &&
    vulnerability.severity === "high" &&
    vulnerability.fixAvailable === false &&
    vulnerability.isDirect === false &&
    vulnerability.range === "<=3.0.3" &&
    Array.isArray(vulnerability.via) &&
    vulnerability.via.some(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.url === "string" &&
        item.url.includes("GHSA-vfj7-8cjw-p6xm"),
    )
  );
}

const blockers = severe.filter(
  ([name, vulnerability]) => !isDocumentedNoFixBracesException(name, vulnerability),
);
const exceptions = severe.filter(
  ([name, vulnerability]) => isDocumentedNoFixBracesException(name, vulnerability),
);

console.log(`npm audit reports ${vulnerabilities.length} vulnerable package entries.`);
for (const [name, vulnerability] of exceptions) {
  console.warn(
    `Accepted documented upstream no-fix exception: ${name} ${vulnerability.range} (${vulnerability.severity}); see docs/security-exceptions.md.`,
  );
}

if (blockers.length > 0) {
  console.error("Unaccepted high/critical dependency vulnerabilities remain:");
  for (const [name, vulnerability] of blockers) {
    console.error(`- ${name}: severity=${vulnerability.severity}, range=${vulnerability.range}`);
  }
  process.exit(1);
}

console.log("Full dependency audit passed the repository's high/critical vulnerability policy.");
