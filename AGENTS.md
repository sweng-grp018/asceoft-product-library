# AGENTS.md — Lensistry (STSWENG Group 18)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Scope and source of truth

These instructions cover the whole repo. Before editing, read README.md, inspect the actual files, git status and relevant nested AGENTS.md files. The current client-approved Skaffld stack supersedes the earlier Drizzle/Better Auth/Base UI proposals. Preserve pre-existing work and avoid describing scaffold files as functional.

Lensistry is a standalone product/SKU library POC. Future Skaffld CORE integration needs an explicit versioned API and SKU/user mapping; do not add direct coupling yet.

## Repo and architecture

- `src/app/`: Next.js App Router entry points, NextAuth CMS and server actions.
- `src/modules/`: client/web vertical slices (auth, catalog, indexing, repository, search); some files are placeholders.
- `src/components/ui/`: shared shadcn/ui on Radix.
- `src/api/`: Express service entry points, package configuration and admin seed script.
- `src/api/modules/`: Express 5 API routes by capability.
- `src/api/lib/`: generic Prisma, S3, signed JWT and Python service clients.
- `src/api/prisma/`: Prisma 7 schema and PostgreSQL migrations; generated client output is `src/api/generated/`.
- `services/app/`: optional standalone FastAPI, PyTorch, YOLO and OpenCLIP prototype; excluded from the web deployment and normal web startup. Training/export is an independent workflow; browser inference using the team's exported model is planned.
- `docker-compose.yml`: local Postgres and MinIO.
- `.github/workflows/ci.yml`: web and API quality gates.
- `.github/workflows/ai-tools.yml`: separate, path-filtered Python tooling checks, also runnable manually.

Keep cohesive business vertical slices and thin framework entry points. Apply SOLID, DRY, KISS, YAGNI and separation of concerns pragmatically. Keep business calculations pure when possible; move database, networking and storage side effects to clear boundaries. Do not create new infrastructure without a demonstrated need.

Keep web and Express application code under the root `src/` folder. For every code file, use the simplest direct implementation that does the job. Keep functions focused, names clear and code short without sacrificing readability, validation or authorization. Add helpers, layers or dependencies only when they solve a current need.

The `/products` catalog screen uses fixture rows and local-only create, edit and delete actions; changes reset on reload, and its create drawer does not upload staged photos. Separate product routes and Express CRUD endpoints exist. The dashboard displays placeholder statistics and activity. The `/detection` screen uses simulated results; do not describe these screens as live integrations. Deployment configuration separates web services from AI tooling, but deployment and full database/S3 flows need verification.

## Stack requirements

1. This is **Next.js 16** with new conventions: read relevant installed docs under `node_modules/next/dist/docs/` before Next.js changes. Keep the generator-managed block above.
2. Use React 19, TypeScript 7, Tailwind CSS 4 and **Radix**-backed shadcn components. Read `.agents/skills/shadcn/SKILL.md` before editing shared UI. Prefer Server Components and accessible form controls.
3. **Express on Node.js** is the authoritative business API; Server Actions and NextAuth are its browser interface. Validate API inputs using Zod and enforce role checks server-side. No privileged operation may rely on a hidden UI element for security.
4. Use PostgreSQL via **Prisma ORM** and reviewed migrations. No Drizzle. Check `DATABASE_URL` before any migration or seeding command.
5. **JWT** issuer, audience and expiry validation plus database role rechecks are required. NextAuth manages CMS sessions; Express enforces ADMIN/STAFF/PUBLIC RBAC. Protect catalog modifications, staff provisioning, analysis and search history appropriately.
6. Store private images in **S3-compatible object storage**, not database bytes. Validate media signatures and sizes, generate short-lived presigned upload URLs and keep credentials server-side.
7. Train/fine-tune **YOLO11** independently of the web app. The target is inference on the user's device directly in the browser using an exported model and a versioned class-to-SKU manifest. This browser runtime is not implemented yet. The optional legacy Python prototype uses **OpenCLIP** embeddings; indexing is not model training. Never equate cosine similarity with a calibrated probability.
8. The web app must start and deploy without Python, model weights or an inference server. Legacy synchronous server inference is enabled only by an explicit `AI_SERVICE_URL`; keep it disabled by default. Training and durable queues are not implemented in the web app.
9. The standalone catalog, database, auth and object storage should not require Skaffld CORE to run.

## Tests and commands

Inspect package.json, bun.lock, src/api/package.json and services/pyproject.toml to select actual commands. From root: `bun run lint`, `bun run format:check`, `bun --bun next typegen`, `bun run typecheck`, `bun run typecheck:api`, `bun run test:api` and `bun run build`. Use `bun run db:generate` for Prisma client generation; apply `db:migrate` or `db:seed-admin` only to a verified database.

For AI use Python 3.11-3.13 and uv: `cd services && uv sync --extra dev`, `uv run pytest -q` and `uv run ruff check .`. Web CI does not run Python; the separate AI workflow uses lightweight test dependencies and runs for matching paths on its configured branches and pull requests or by manual dispatch. Report absent local runtimes, unreachable registries or unexecuted checks candidly. No AI accuracy claims until evaluated on representative held-out product photos.

Use local skill instructions from `.agents/skills/` when relevant: shadcn, security-audit, zod, git-commit and other applicable domains. Legacy Drizzle/Better Auth skills are not applicable to the new client-approved stack. Commit changes in focused steps and keep docs, migrations, environment examples and tests consistent.

## Gitflow and completion

Start feature work from `development` using `feature/*`. Open pull requests to `development`, require CI, QA and at least one reviewer approval; never push directly to protected branches. Inspect the diff and untracked files before committing. Summarize code changes, results and limitations; do not claim a deployed service, applied migration, model accuracy or created PR without a verified result.
