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
- `src/modules/`: client/web vertical slices (auth, catalog, indexing, repository, search).
- `src/components/ui/`: shared shadcn/ui on Radix.
- `api/src/modules/`: Express 5 API routes by capability.
- `api/src/lib/`: generic Prisma, S3, signed JWT and Python service clients.
- `api/prisma/`: Prisma 7 schema and PostgreSQL migrations.
- `services/app/`: separate FastAPI, PyTorch, YOLO and OpenCLIP runtime.
- `docker-compose.yml`: local Postgres and MinIO.
- `.github/workflows/ci.yml`: quality gates.

Keep cohesive business vertical slices and thin framework entry points. Apply SOLID, DRY, KISS, YAGNI and separation of concerns pragmatically. Keep business calculations pure when possible; move database, networking and storage side effects to clear boundaries. Do not create new infrastructure without a demonstrated need.

## Stack requirements

1. This is **Next.js 16** with new conventions: read relevant installed docs under `node_modules/next/dist/docs/` before Next.js changes. Keep the generator-managed block above.
2. Use React 19, TypeScript 7, Tailwind CSS 4 and **Radix**-backed shadcn components. Read `.agents/skills/shadcn/SKILL.md` before editing shared UI. Prefer Server Components and accessible form controls.
3. **Express on Node.js** is the authoritative business API; Server Actions and NextAuth are its browser interface. Validate API inputs using Zod and enforce role checks server-side. No privileged operation may rely on a hidden UI element for security.
4. Use PostgreSQL via **Prisma ORM** and reviewed migrations. No Drizzle. Check `DATABASE_URL` before any migration or seeding command.
5. **JWT** issuer, audience and expiry validation plus database role rechecks are required. NextAuth manages CMS sessions; Express enforces ADMIN/STAFF/PUBLIC RBAC. Protect catalog modifications, staff provisioning, analysis and search history appropriately.
6. Store private images in **S3-compatible object storage**, not database bytes. Validate media signatures and sizes, generate short-lived presigned upload URLs and keep credentials server-side.
7. **YOLO11** finds candidate objects; **OpenCLIP** embeds crops and reference images. Indexing is not model training. Version embeddings, reject incompatible model IDs, support unknown matches and manual correction. Never equate cosine similarity with a calibrated probability.
8. Synchronous inference is intentional for the POC. Training and durable queues are not implemented. Assess queue needs using real measurements before adding Celery or Redis.
9. The standalone catalog, database, auth and object storage should not require Skaffld CORE to run.

## Tests and commands

Inspect package.json, bun.lock, api/package.json and services/pyproject.toml to select actual commands. From root: `bun run lint`, `bun run format:check`, `bun --bun next typegen`, `bun run typecheck`, `bun run typecheck:api`, `bun run test:api` and `bun run build`. Use `bun run db:generate` for Prisma client generation; apply `db:migrate` or `db:seed-admin` only to a verified database.

For AI use Python 3.11-3.13 and uv: `cd services && uv sync --extra dev`, `uv run pytest -q` and `uv run ruff check .`. Report absent local runtimes, unreachable registries or unexecuted checks candidly. No AI accuracy claims until evaluated on representative held-out product photos.

Use local skill instructions from `.agents/skills/` when relevant: shadcn, security-audit, zod, git-commit and other applicable domains. Legacy Drizzle/Better Auth skills are not applicable to the new client-approved stack. Commit changes in focused steps and keep docs, migrations, environment examples and tests consistent.

## Gitflow and completion

Start feature work from `development` using `feature/*`. Open pull requests to `development`, require CI, QA and at least one reviewer approval; never push directly to protected branches. Inspect the diff and untracked files before committing. Summarize code changes, results and limitations; do not claim a deployed service, applied migration, model accuracy or created PR without a verified result.
