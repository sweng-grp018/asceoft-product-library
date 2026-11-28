# Run Playwright tests 5�?"9

From the repository root, start Docker Desktop. Start the QA PostgreSQL service and wait for its health check:

```powershell
docker compose up -d --wait postgres
```

## First checkout or database schema update

Create the database once if it does not already exist:

```powershell
docker compose exec postgres createdb -U lensistry lensistry_qa
```

Install dependencies, generate Prisma, and deploy reviewed migrations to the explicitly named local QA database. The database override below applies only to the migration process.

```powershell
bun install --frozen-lockfile
bun run db:generate
bunx playwright install chromium
bun run test:qa:migrate
```

## Daily run

Stop any existing local app or mock on ports 3000, 4000, 9000 and 18080. With QA Postgres running, use one terminal:

```powershell
bun run test:qa
```

Playwright starts the mock AI, local storage, API and website with QA settings and stops those processes after the run. It uses the local QA database and bucket independently of your normal Neon and AI settings. Python is unnecessary for these mocked tests.

- Watch Chromium: `bun run test:qa --headed`.
- Run one feature: `bun run test:qa staff.spec.mts`.
- Open the last HTML report: `bun run test:qa:report`.
- Check the website and API with AI disabled: `bun run test:qa:offline`. Open this report with `bunx playwright show-report .local/ai-disabled-report`.
- List cases without starting services: `bun run test:qa --list`.

The suite runs one worker and signs in three disposable role accounts once per run. Catalog and authorization failures should be evaluated against the QA plan. The mock checks integration behavior; model accuracy requires separate evaluation.
