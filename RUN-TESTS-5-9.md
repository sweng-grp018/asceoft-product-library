# Playwright tests 5–9
Extract these files at the project root beside package.json, preserving their folder structure. Five specs are in tests/e2e/assigned. No replacements of existing specs are required.

## First-time local setup (Windows PowerShell)
Use a local QA checkout with Bun, Node, Docker Desktop and the repository dependencies. Run commands from the repository root. The fixture logs in three temporary accounts normally and reuses their sessions across the suite.

1. Configure the root .env from the local .env.example. Set independent AUTH_SECRET and JWT_SECRET values of at least 32 characters. Use the local S3RVER credentials from the example, WEB_ORIGIN=http://localhost:3000, API_URL=http://localhost:4000, and S3_BUCKET=lensistry-qa. The tests can leave small uploaded objects in this local QA bucket.
2. Set these two additional root .env values. The app and tests must point to the same dedicated QA database. Use a fresh QA database so the mock vector has a unique match.

       DATABASE_URL="postgresql://lensistry:lensistry@127.0.0.1:5433/lensistry_qa"
       AI_SERVICE_URL="http://127.0.0.1:18080"

3. Start the supplied Compose PostgreSQL service. Run createdb once after Postgres is healthy. If lensistry_qa already exists, use it only after confirming it is your disposable QA database. Verify there is no shell DATABASE_URL overriding the QA setting before deploying migrations.

       docker compose up -d postgres
       docker compose exec postgres createdb -U lensistry lensistry_qa
       bun install --frozen-lockfile
       bun run db:generate
       bun run --cwd src/api db:deploy
       bunx playwright install chromium

## Run from three terminals
1. Mock AI service: node tests/support/mock-ai.mjs
2. Web app, Express and local photo storage: bun run dev:local
3. After the web app opens: bunx playwright test --config=playwright.assigned.config.mts

To run just Catalog in a visible browser:

    bunx playwright test --config=playwright.assigned.config.mts catalog.spec.mts --headed

Use this config for the assigned suite. It runs one worker and shares QA sessions to avoid repeated logins. If running simple commands repeatedly hits the app's login rate limit, allow its 15-minute window to expire. A clean run uses six login attempts. Screenshots of test failures appear under .local/assigned-results. Stop the mock and local app with Ctrl+C after the run.

## Interpret the results
Catalog tests use the web create form and Playwright API requests for edits, deletion and duplicate codes (the UI generates codes). A soft delete must keep the row and hide it in ordinary catalog results. Photo tests use real browser file inputs and local storage. AI tests use a fixed 512-number embedding, one shelf detection and a distinct red PNG to simulate an unavailable service. Indexing checks the displayed initial and persisted final status. Staff management checks fresh browser sessions before and after the password reset. The suite assumes the permissions in the assignment.

Check the first failing assertion and the app logs. Setup errors or missing test coverage are different from confirmed product bugs. Search existing GitHub Issues first; for a confirmed mismatch record the test name, role, steps, expected and observed result, and screenshot. Source review suggests Staff creation, hard deletion and Staff correction controls differ from the assignment.
