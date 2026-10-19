# Dependency Security Exceptions

## `braces <= 3.0.3` — temporary upstream no-fix exception

- **Advisory:** [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- **Recorded:** 2026-10-19
- **Why it is accepted:** the advisory marks the range `<= 3.0.3` as high severity and lists no patched version. It arrives through tooling dependencies (ESLint/Next lint integration), not as an intended application runtime API.
- **Mitigations:** lint tooling is kept in workspace development dependencies; the production-only audit remains a hard gate; the full-tree audit only permits this exact advisory, version range, severity and no-fix state.
- **Exit criteria:** remove this exception as soon as a patched release is available or the upstream advisory is withdrawn. If the audited package range, source advisory, fix availability, or severity changes, CI must fail rather than automatically accepting the changed finding.
- **Policy:** all other high and critical vulnerabilities fail CI. Moderate findings remain visible in the uploaded audit report and should be triaged.

This exception is not a claim that the affected dependency is risk-free. It documents a constrained response to an upstream advisory without a patched release at the time recorded.
