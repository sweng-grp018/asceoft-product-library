# Lensistry QA Plan

> Section 4.3 defines the target permissions. Section 6.2 lists the automated browser suites. The dedicated API integration suite in section 6.1 is planned.

- **Owner:** QA, DLSU STSWENG Group 18
- **Applies to:** the `development` branch and `release/*` candidates
- **Last updated:** 2026-11-28

## 1. Purpose and scope

QA verifies real sign-in, PostgreSQL persistence, private photo storage and the unavailable state when the analysis service is disconnected. Section 4.3 defines the target permissions for this cycle. Differences between the application and that matrix are QA findings.

In scope:

- Authentication, sessions and role-based access control (PUBLIC / STAFF / ADMIN).
- Product catalog CRUD, search, pagination and validation.
- Photo upload, validation and storage for shelf and reference photos.
- Staff management and password reset.
- Public browsing.
- AI-disabled behavior and AI plumbing with a stub service.
- Cross-cutting UI behavior: empty, loading and error states; responsive layout; keyboard basics.

Out of scope for this cycle:

- Detector or SKU-identification accuracy, mAP, precision/recall and threshold calibration.
- Hosted deployment, TLS, bucket CORS and production hardening.
- Load, soak and penetration testing.
- Email-based password recovery (not implemented).

## 2. Baseline before browser automation

This table records the starting point so later coverage claims can be checked.

| Item                                             | Status                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| CI                                               | Lint, formatting, typecheck, API unit tests, web build and a gate job. No database-backed or browser tests.   |
| Automated tests with assertions                  | Existing API unit tests include `src/api/lib/ai.test.ts` and `src/api/modules/auth/input.test.ts`.            |
| `playwright.config.ts` and `tests/e2e/*.spec.ts` | Empty stubs; `@playwright/test` is not installed.                                                             |
| Placeholder modules                              | 22 zero-byte files under `src/modules/` and `src/lib/`. They are not imported.                                |
| QA environment                                   | None. A single root `.env` points at the developer database.                                                  |
| Seed data                                        | `db:seed-groceries` adds 18 fictional products, idempotent by product code.                                   |
| Default list page size                           | 25. Eighteen seeded products cannot exercise page 2.                                                          |
| Rate limits                                      | Hard-coded: login 10 per 15 minutes per IP, registration 5 per hour, image search 6 per minute per user.      |
| AI service                                       | Disabled unless `AI_SERVICE_URL` is set. Indexing and analysis return 503; the UI shows an unavailable state. |

## 3. QA environment

### 3.1 Topology

QA is local-only. Each tester runs the same Docker Compose stack used for development, but
against a **separate database** so a reset never destroys developer data.

| Component      | QA choice                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------- |
| PostgreSQL     | Compose service `postgres` (pgvector image) on `127.0.0.1:5433`, database `lensistry_qa`. |
| Object storage | Compose MinIO on `127.0.0.1:9000` (preferred for parity with the Compose setup).          |
| Express API    | `http://localhost:4000`, health at `GET /health`.                                         |
| Web            | `http://localhost:3000`.                                                                  |
| AI service     | Unset by default. A stub is started only for plumbing tests.                              |

Standardize on `bun run dev:docker` for manual QA. The filesystem storage service used by
`bun run dev:local` is acceptable for quick checks but differs from the CI setup.

### 3.2 Configuration

QA uses the root `.env` for non-secret defaults, with the QA database URL supplied by the
shell. `dotenv` does not override variables that already exist in the environment, so an
exported value wins.

```bash
# bash
export DATABASE_URL="postgresql://lensistry:lensistry@localhost:5433/lensistry_qa?schema=public"
```

```powershell
# PowerShell
$env:DATABASE_URL = "postgresql://lensistry:lensistry@localhost:5433/lensistry_qa?schema=public"
```

Requirements:

- Dedicated `AUTH_SECRET` and `JWT_SECRET` for QA; never reuse hosted values.
- `S3_BUCKET=lensistry-qa` (or a dedicated prefix) so QA objects are identifiable.
- `AI_SERVICE_URL` unset unless a stub is deliberately running.
- QA passwords live in the team vault, not in GitHub Issues or the repository.

### 3.3 Accounts and fixtures

Create accounts through the reset script or a seed, **not** through `/register`, because
registration is limited to 5 attempts per hour.

| Account                   | Role   | Purpose                                                                                        |
| ------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| `qa-manager@example.test` | ADMIN  | Admin-only actions and all inherited Staff and Public journeys.                                |
| `qa-staff@example.test`   | STAFF  | Internal catalog, product creation, shelf photos, AI search and results, plus public browsing. |
| `qa-browser@example.test` | PUBLIC | Public product browsing and catalog AI search; redirected away from `/dashboard`.              |

Passwords must be at least 12 characters and at most 72 UTF-8 bytes.

### 3.4 Reset procedure

Run before every cycle and whenever a run leaves inconsistent data.

```bash
# 1. Start dependencies and create the QA database once
docker compose up -d
docker compose exec postgres createdb -U lensistry lensistry_qa   # skip if it exists

# 2. Export the QA DATABASE_URL (see 3.2), then apply reviewed migrations
bun run --cwd src/api db:deploy

# 3. Manager account
ADMIN_EMAIL="qa-manager@example.test" \
ADMIN_PASSWORD="<12+ character vault password>" \
ADMIN_NAME="QA Manager" \
bun run db:seed-admin

# 4. Baseline catalog
bun run db:seed-groceries
```

Notes:

- Use `db:deploy` for QA. Do **not** use `db:migrate` (`prisma migrate dev`) on a shared or
  retained database.
- Clear `ADMIN_PASSWORD` from the shell afterwards.
- The staff and browser accounts plus edge-case fixtures are created by the QA fixture seed
  described in section 4.4.
- Never point QA commands at the database in the committed `.env`.

### 3.5 Build identification

Every test result records the commit under test:

```bash
git rev-parse --short HEAD
```

An environment/build value looks like `QA-local · a1b2c3d · 2026-11-28`.

## 4. Test strategy

### 4.1 Layers and coverage weight

| Layer              | Tool                                                | What it carries                                                                 |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| API integration    | `node:test` against the exported Express app        | RBAC matrix, validation boundaries, uploads, 503 paths. **Primary automation.** |
| Browser end-to-end | Playwright, Chromium only                           | The feature suites in section 6.2.                                              |
| Unit               | `node:test`                                         | Pure logic and Zod schemas. Extend where a bug is cheap to reproduce.           |
| Manual             | Completed plan pass; defects filed as GitHub Issues | Exploration, UI/UX, accessibility, responsive behavior, edge combinations.      |

A passing build or unit test does not establish readiness. Automated coverage is evidenced by
CI on the commit under test; manual coverage is evidenced by a completed pass over section 4.2,
with every failure filed as an issue.

### 4.2 Execution order

Test by risk, not by screen order. If a P0 layer fails, stop and report instead of
continuing.

| Order | Area                        | Why first                                                                             |
| ----- | --------------------------- | ------------------------------------------------------------------------------------- |
| 1     | Auth, sessions, RBAC        | Security and data exposure; every route trusts the token and a database role recheck. |
| 2     | Uploads and storage         | Magic-byte checks, size limits and presigned URLs fail silently.                      |
| 3     | Catalog CRUD and validation | Core value; product-code immutability, duplicate handling, limits, pagination.        |
| 4     | Staff management            | Account creation, reset, and token invalidation.                                      |
| 5     | Public browsing             | Unauthenticated access and no leakage of staff-only data.                             |
| 6     | AI-disabled behavior        | 503 paths and the unavailable UI must be honest and stable.                           |
| 7     | Cross-cutting               | Empty/loading/error states, 8-hour expiry, keyboard shortcuts, responsive layout.     |

### 4.3 RBAC matrix

Each column represents a signed-in account. Staff inherits every Public permission. Admin inherits every Staff permission.

| Action                                                           | Public | Staff | Admin |
| ---------------------------------------------------------------- | ------ | ----- | ----- |
| Sign in                                                          | Allow  | Allow | Allow |
| Search and view public product information                       | Allow  | Allow | Allow |
| Run AI search with a product photo                               | Allow  | Allow | Allow |
| Open the internal catalog and add products                       | Deny   | Allow | Allow |
| Upload shelf photos and view saved shelf-analysis results        | Deny   | Allow | Allow |
| Open the dashboard                                               | Deny   | Deny  | Allow |
| Edit and permanently delete products                             | Deny   | Deny  | Allow |
| Manage reference images and prepare photos for search (indexing) | Deny   | Deny  | Allow |
| Correct matches                                                  | Deny   | Deny  | Allow |

Exercise each action for all three roles in the UI and at its Express boundary, including inherited permissions. For example, valid product creation should return `201` for Staff and Admin. Staff should receive `403` when correcting even their own search result. Only Admin may read the dashboard summary. Test against the target matrix and report mismatches.

Signed-out visitors can browse public information. Catalog AI search requires sign-in. Public, Staff and Admin can see the public product matches from their own query. Analyzing a saved shelf photo and viewing its internal results require Staff or Admin. Protected API requests require a valid token (`401` for missing, expired or malformed credentials). An authenticated account with insufficient permissions receives `403`. Recheck access after changing the database role. After a denied write, verify the stored record is unchanged.

Additional regression checks:

- Admin product deletion returns `204` and permanently removes the database row. The detail endpoint then returns `404` and catalog search excludes the product. Staff and Public attempts return `403` and preserve the row and its visibility.
- A password reset invalidates the previous token and session.
- `PATCH /products/:id` with a changed `sku` returns `400` ("product code cannot be changed").
- Duplicate product code or email returns `409` with the friendly message.
- A `.png` renamed to `.jpg` is rejected with `422`.
- A saved photo over 10 MiB is rejected; a search image over 3 MB is rejected.
- With `AI_SERVICE_URL` unset, indexing, analysis and image search do not read image bytes
  and return `503`; `/products/image-search/status` reports `enabled: false`.

### 4.4 Test data

Baseline: the 18 fictional groceries from `db:seed-groceries`.

Fixtures required beyond the baseline:

- **Pagination:** at least 30 products, or a temporary `pageSize` of 5 in the request, so
  next/previous and boundary pages are exercised.
- **Field boundaries:** 200-character name, 100-character product code, accented text
  (`Piña`), apostrophes, empty optional fields.
- **Index states:** a product with no photo, one `INDEXED`, one `FAILED` with an error message.
- **Photos:** valid JPG/PNG/WebP; wrong-extension file; 0-byte file; exactly 10 MiB and
  10 MiB + 1 byte; a search image of 3 MB + 1 byte.
- **Accounts:** manager, staff and browser accounts as in section 3.3.

Fixtures live in `tests/fixtures/` and are versioned. Image fixtures must be small; do not
commit large binaries.

### 4.5 Environment-specific checks

- Confirm the API loads the same `DATABASE_URL` reported on screen; the reset is pointless
  otherwise.
- Confirm uploads land in the QA bucket/prefix and deletion removes the object.
- Run one pass with the app stopped to verify user-facing error messages, not stack traces.
- Include the OS, browser and storage backend in the issue when a defect is filed.

### 4.6 Out of scope

Do not claim AI accuracy, browser inference, email recovery or deployed-service verification.
AI plumbing is tested only with a stub that returns fixed embeddings and detections.

## 5. Entry and exit criteria

### Entry (smoke gate, about 30 minutes)

Run when a build arrives. If any item fails, return the build instead of starting a full pass.

1. `GET /health` returns `200` with `{"status":"ok"}`.
2. Manager, staff and browser accounts can sign in.
3. Public `/search` loads without signing in.
4. Staff creates a product, reloads the catalog and finds it in search.
5. A shelf photo uploads and is listed.
6. `/products/image-search/status` returns `enabled: false`.
7. No uncaught error appears in the API console during the checks above.

### Exit (cycle sign-off)

- The entry smoke gate passes on the release commit.
- All P0 automated checks are green, including `api-integration` and `e2e`.
- Every manual area in section 4.2 has been exercised on the release commit.
- No open Critical or High severity issues.
- Every issue fixed during the cycle has retest evidence and is closed or reopened accordingly.

## 6. Automation

### 6.1 API integration tests

**Placement:** `tests/api/*.test.ts` at the repository root. Keeping them outside
`src/api` avoids the existing unit glob (`**/*.test.ts`), which would otherwise pick them up.

**Approach:**

- Import `src/api/app.ts` and listen on port `0`.
- Obtain tokens through `POST /auth/login` for each identity instead of forging JWTs.
- Reset database state between specs by truncating application tables or recreating the
  schema; cases must not depend on order.
- Point `S3_*` at the local storage service, or stub presigning, so upload cases run offline.
- Use `TEST_DATABASE_URL`; refuse to run if it equals the development database name.

**Coverage required:**

1. RBAC matrix for every protected route (section 4.3).
2. Validation: product code normalization, immutable code, field limits, malformed JSON.
3. Duplicate product code and duplicate email return `409`.
4. Upload presign shape (`method`, `expiresIn`, `maxBytes`), magic-byte rejection, oversized files.
5. AI-disabled `503` behavior and `/image-search/status`.
6. Rate-limit responses at their configured thresholds.
7. Password reset invalidates an existing token.
8. Search filter and pagination boundaries.

Proposed script: `"test:api:integration": "node --import tsx --test \"tests/api/**/*.test.ts\""`.

### 6.2 Playwright feature suites

Paths below are relative to `tests/e2e/`.

| Feature                               | Spec                                                           | What to verify                                                                                                                                                                                                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create account                        | `auth.spec.ts`                                                 | Register a unique account, sign in as Public and verify browsing access. Check invalid input and duplicate email.                                                                                                                                                                                                          |
| Sign in and sign out                  | `sign-in.spec.mts`                                             | Sign in through the form as Public, Staff and Admin. Check invalid credentials and loss of protected access after sign-out.                                                                                                                                                                                                |
| Public product search                 | `search.spec.mts`                                              | As a visitor and each role, search by name, brand and product code, open public details, and check empty results and pagination.                                                                                                                                                                                           |
| Role permissions and dashboard        | `rbac.spec.mts`                                                | Check navigation and direct page access for the matrix in section 4.3. Only Admin sees dashboard totals. Pair with direct API assertions for denied reads and writes.                                                                                                                                                      |
| Internal catalog and products         | `assigned/catalog.spec.mts`                                    | Staff and Admin can list and add products that survive reload. Check duplicate codes. Only Admin can edit and permanently delete. Check the database row, detail endpoint and search after allowed and denied deletions.                                                                                                   |
| Shelf photo uploads                   | `assigned/photos.spec.mts`                                     | Staff and Admin upload a valid photo and see it after reload. Check invalid file rejection and Public denial.                                                                                                                                                                                                              |
| AI search, results and corrections    | `assigned/search-ai.spec.mts`, `assigned/ai-disabled.spec.mts` | With the service disabled, check the unavailable state. With a deterministic stub, Public, Staff and Admin find matching public products by photo. Guests must sign in. Staff and Admin can also analyze a saved shelf photo and view its results. Only Admin can save a match correction. Reopen the result to verify it. |
| Reference images and indexing         | `assigned/indexing.spec.mts`                                   | Only Admin can attach reference images and use “Prepare photos for search”. Check the resulting status with the stub and the unavailable state without it.                                                                                                                                                                 |
| Existing staff account administration | `assigned/staff.spec.mts`                                      | Retain regression coverage for Admin provisioning a Staff account and resetting its password. Verify the new login works and the old credentials lose access.                                                                                                                                                              |

Use role-specific NextAuth browser sessions for feature tests and fresh browser contexts for account and sign-in tests. Use accessible role or label locators, web-first assertions and unique test records. For the complete local run, follow the [three Playwright commands in the README](../README.md#playwright-browser-tests). The runner starts the QA website and combines all feature results in one report.

### 6.3 CI

The **Playwright QA** job exercises the feature suites against a temporary QA database. Download the `playwright-report` artifact within seven days to inspect individual results. During the report-first rollout, CI Gate requires lint, formatting, typechecks, API unit tests and the build.

### 6.4 Conventions

- Label issues by area: `area:auth`, `area:rbac`, `area:catalog`, `area:uploads`,
  `area:public`, `area:ai`, `area:ui`. Issues are the unit of record; there are no numbered
  test cases to maintain.
- A bug fix is done when it has a fix, a regression test where practical, retest evidence from
  a second QA member, and a closed issue.

## 7. Tracking and defect reporting

CI records automated results for the tested commit. The team uses this plan for manual testing and logs defects directly in GitHub Issues.

### 7.1 Automated results

- Review the Playwright QA result for the commit under test. Record the role and failed assertion when filing a defect.
- A flaky test is noted in the pull request and fixed; it is not treated as a pass.

### 7.2 Manual findings

Use sections 4.2 and 4.3 during manual testing. When a tester finds a bug, open a GitHub Issue immediately or add evidence to an existing issue for the same defect. Record intermittent bugs with the observations available at discovery.

### 7.3 Bug report

Include the role, commit, environment, steps taken, expected and actual results, and any relevant screenshot or API response. Give each defect a descriptive title such as `[Catalog] Staff cannot add a product`. Use the team's area and severity labels for triage.

### 7.4 Triage and verification

- Critical and High issues are triaged the day they are filed and block release.
- A fix is verified by a QA member other than the reporter.
- Close only after a `Verified on <commit>` comment with evidence, or mark `Won't Fix` with a
  reason and sign-off.
- Reopen an issue instead of filing a second one when a verified fix regresses.

### 7.5 Reporting

Use GitHub issue filters to review open defects.

```bash
gh issue list --state open --label bug
gh issue list --state open --label severity:critical
gh issue list --state open --label needs-retest
```

Report per cycle: open defects by severity, blocked areas with reasons, and automation status
from CI. Do not report a pass rate; manual pass coverage is not individually recorded.

## 8. Roles

The QA lead owns the environment, the reset procedure, triage and reporting. The remaining QA
members split areas, run independent passes and file findings directly. Developers do not mark their own fixes as verified.

## 9. Open items for the developers

| Item                                            | Impact on QA                                                 | Proposed action                                      |
| ----------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| Rate limits are hard-coded                      | Repeated suites lock testers out (login 10/15 min per IP).   | Make limits configurable outside production.         |
| Default page size 25 vs 18 seed products        | Pagination cannot be exercised through the UI.               | Add 30+ fixtures or allow a smaller page size in QA. |
| 8-hour NextAuth session holds a fixed API token | After expiry the UI can look signed in while API calls fail. | Confirm intended behavior and add a test case.       |

## 10. Limitations

- The dedicated API integration suite is planned. Playwright exercises browser flows and selected API boundaries.
- Results are only reproducible on the recorded commit, database and storage backend.
- Manual pass coverage is not individually recorded; only defects are tracked, so a clean cycle
  means no issues were filed, not exhaustive proof.
- AI behavior is validated for plumbing only. Accuracy requires an annotated, SKU-stratified
  shelf-photo dataset and a separate evaluation.
- A green CI run does not establish deployment readiness or model quality.
