# Learner's Guide security status

**Status: not production-ready for real accounts or student records.** This note is intentionally explicit so a successful frontend build is not mistaken for an authentication/security review.

## Fixed in the monorepo

- Removed the built-in administrator account and its hard-coded password from the seed data.
- New installs no longer create a shared default administrator.

## Release blockers

- The legacy account flow still queries the application `users` table using a plaintext password field and has a local-storage fallback. Do not use this flow with real credentials or student data.
- The legacy session object and local user cache need to be migrated away from storing passwords.
- Authentication should use Supabase Auth (or another reviewed identity provider), with role authorization enforced by database policies/server-side checks. A role supplied by a browser must not grant administrative access.
- Review and migrate the existing `users.pass` schema and all legacy accounts before enabling the new auth flow. Do not make an unverified schema change against the live project.
- A credential previously committed in the public repository should be treated as exposed and rotated if it was ever used. Removing it from the current source does not erase Git history.

## Before production

1. Implement Supabase Auth sign-up/sign-in/sign-out and password reset.
2. Use a profile table keyed by the authenticated user ID; remove plaintext password columns and local password-based authentication.
3. Verify row-level security for every student, parent, teacher, and administrator operation, including cross-account negative tests.
4. Add automated auth/authorization tests and test with non-production accounts.
5. Complete a live Supabase schema review before deploying the migration.

No legal, privacy, or security compliance certification is implied by this checklist.
