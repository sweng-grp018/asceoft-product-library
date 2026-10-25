# AGENTS.md — Lensistry (STSWENG Group 18)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Purpose and Scope

These instructions apply to the **whole repository**, including the Next.js app, Python AI service, database, workers, tests, infrastructure, and docs. Read [README.md](README.md) first for the product vision and team workflow, then inspect the actual files before changing anything.

**Lensistry** is an **AI-powered Product Library** for product/SKU records and identification using text queries, reference images, and store/shelf photos. Its _planned_ scope includes multiple products per image, AI indexing/training status, source metadata, product matching, and search history. The README describes target behavior, **not proof of implemented features**.

Primary users are **company administrators**, **employees/warehouse staff**, and **public users**. Their permissions differ; never treat a visible UI control as an authorization boundary.

### Current repository map and maturity

| Path                                                     | Role / present state                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/`                                               | Next.js App Router: auth, workspace, products, repository, training, history, search, and API route entry points. Many route files are placeholders.                                                                                                                                 |
| `src/modules/{auth,catalog,indexing,repository,search}/` | Existing **business modules**. Features belong in their module's `features/` subfolders, with module-local `db/`, `server/`, and `components/` as needed. Most files are presently empty.                                                                                            |
| `src/components/ui/`, `src/components/layout/`           | Shared shadcn/ui components and app shell; the configured UI base is **Base UI** (`base-nova`), not Radix.                                                                                                                                                                           |
| `src/lib/`, `src/hooks/`                                 | Shared infrastructure/utilities (AI, database, environment, storage) and generic hooks; many adapters are stubs.                                                                                                                                                                     |
| `services/`                                              | Current working path for Python AI service (`app/api`, `detection`, `embeddings`, `training`, `workers`, `tests`). `services/pyproject.toml` and `app/main.py` are presently empty. A previous tracked path was `ai-service/`; inspect Git status before touching this ongoing move. |
| `drizzle/`, `tests/e2e/`, `.github/workflows/`           | Migration, browser-test, and CI scaffolding; configurations/tests/workflow are currently empty.                                                                                                                                                                                      |
| `.agents/skills/`                                        | Installed, project-local agent skills; see [Skill selection](#skill-selection).                                                                                                                                                                                                      |

Many files exist only as empty stubs. **Do not describe a scaffolded route, database schema, auth flow, AI model, job queue, or CI check as functional until its implementation is verified.** Preserve pre-existing and uncommitted changes; review `git status` and relevant diffs before editing.

## 1. Start With Repository Context

1. **Read [README.md](README.md) before making changes**, plus adjacent code, any applicable nested `AGENTS.md`, and relevant docs under `node_modules/next/dist/docs/` for Next.js changes.
2. Inspect `package.json`, `bun.lock`, `services/pyproject.toml` and any future `uv.lock`, existing scripts, schema, and CI workflow before choosing commands, versions, or patterns. Check whether a file actually contains code; several are zero bytes.
3. Treat checked-in code, configuration, and lockfiles as the source of truth for the **current implementation**. Treat the README and approved project specifications as the source of truth for **intended behavior**; explicitly identify conflicts rather than silently guessing.
4. Respect more specific nested `AGENTS.md` instructions for their applicable directories, unless they conflict with higher-priority instructions.
5. Prefer focused, incremental changes. Do not reorganize the repository, replace a technology, or introduce a new architectural pattern merely because it is fashionable.
6. Read the relevant linked [local skills](#skill-selection) before changes in their domain. If required context or a skill is unavailable, state what is missing; do not claim to have read, used, or validated it.

## 2. Non-Negotiable Engineering Principles

Apply these **pragmatically**, not as a reason to add boilerplate:

- **SOLID:** Give modules and functions cohesive responsibilities; introduce interfaces or dependency inversion only where they meaningfully reduce coupling.
- **DRY:** Centralize duplicated business rules and authoritative knowledge, not superficially similar code.
- **KISS:** Choose the simplest clear implementation that satisfies the requirement.
- **YAGNI:** Do not build hypothetical features, extension points, or infrastructure.
- **Separation of Concerns (SoC):** Keep UI, application coordination, domain rules, validation, authorization, and persistence distinct.
- **High Cohesion, Low Coupling:** Place related behavior within its feature and expose small, explicit cross-feature interfaces.
- **Composition over Inheritance:** Compose functions, React components, and modules; avoid inheritance-heavy hierarchies.
- **Explicit over Implicit:** Make ownership, side effects, dependencies, error cases, and state transitions obvious.
- **Fail Fast:** Validate untrusted input at boundaries and reject invalid states before side effects.
- **Principle of Least Astonishment:** Keep APIs, naming, status handling, and UI behavior predictable.
- **Single Source of Truth:** Maintain one authoritative definition for business invariants, schemas, permissions, and state transitions where practical.
- **Encapsulation:** Hide implementation details and export the smallest useful public API.

Always prioritize **correctness, security, simplicity, readability, maintainability, accessibility, and testability** over cleverness.

## 3. Required Architecture: Vertical Slice + Modular Monolith

The **Next.js application MUST maintain a Vertical Slice architecture inside a Modular Monolith**.

- Organize application-specific code by **business capability**, not by a single repository-wide `components/`, `services/`, or `repositories/` layer.
- Each feature owns the code it needs: UI, actions/handlers, application orchestration, domain logic, validation, persistence adapters, and tests **as applicable**. Do not create every layer or directory unless needed.
- Keep boundaries clear. Import from a feature's deliberate public API rather than reaching into another feature's internals. Prevent circular feature dependencies.
- Put truly reusable primitives in `shared`/`lib` only when they are domain-agnostic; do not turn shared modules into a dumping ground for feature logic.
- Keep business rules in a **functional core** (pure, deterministic functions where practical), and isolate I/O in an **imperative shell** (database, object storage, network requests, queues, framework entry points).
- Keep route files, Server Actions, and API handlers thin: authenticate, authorize, validate, call the feature use case, and return a well-defined result.
- Prefer a modular monolith over additional TypeScript microservices. The **FastAPI AI service is an intentional separate runtime** for Python model training/inference; keep its integration contract explicit instead of treating it as another in-process module.
- Introduce new shared abstractions only after concrete reuse or a clear boundary requirement. Favor incremental refactoring over broad rewrites.

Use the **existing** module layout; add feature-local code incrementally:

```text
src/
  app/                       # Thin Next.js entry points
  modules/
    auth/                    # Sessions, identity, permission checks
    catalog/                 # Product records and reference images
    indexing/                # Indexing/training and job states
    repository/              # Shelf/store images and metadata
    search/                  # Text/image search, detection, history
  components/                # Cross-module shadcn/ui and app shell
  lib/                       # Generic, shared infrastructure
services/                    # Separate Python AI service (scaffold)
```

Keep domain operations inside `src/modules/<module>/features/<feature>/` and stable server interfaces in that module's `server/` where needed. Existing `src/components/ui/` and `src/lib/` are intentional shared infrastructure, not permission to put business logic there. Avoid premature mass moves, including renaming the current module tree to `src/features/`.

## 4. Technology Choices and Actual Commands

The README describes the **selected target stack**. The table distinguishes installed dependencies/configuration from pieces still proposed; inspect `bun.lock` for resolved versions.

| Area                    | Repository evidence / target                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Web                     | **Next.js 16.4.3**, **React 19.3.0**, **TypeScript 7.0.2** (pinned in `package.json`), strict TS, App Router                                                                                                                                                                                                                                     |
| Runtime and scripts     | `packageManager: bun@1.4.3`; **existing `dev`, `build`, `start` use `bun --bun next ...`**, which explicitly selects the Bun runtime. The README plans Node.js for production. **This is an unresolved documentation/script conflict**; do not claim the current scripts run under Node or change the runtime without resolving the requirement. |
| UI                      | shadcn/ui (`components.json`: `base-nova`, RSC), **Base UI**, Tailwind CSS 4, Lucide icons                                                                                                                                                                                                                                                       |
| Validation              | **Zod 4** is installed; most domain validation is not yet implemented                                                                                                                                                                                                                                                                            |
| Data                    | **Neon PostgreSQL**, **pgvector**, **Drizzle ORM** selected; database files and `drizzle.config.ts` are empty scaffolds                                                                                                                                                                                                                          |
| Authentication          | **Better Auth** installed; auth/server routes and permission logic are placeholders                                                                                                                                                                                                                                                              |
| Python AI               | Python 3, **FastAPI + Pydantic**, **PyTorch + Ultralytics YOLO**, **OpenCLIP**, **CVAT** planned; Python service and `pyproject.toml` are not yet configured                                                                                                                                                                                     |
| Object storage and jobs | **Cloudflare R2**, **Celery + Redis** planned; R2 adapter, workers, and Docker Compose config not yet implemented                                                                                                                                                                                                                                |
| Tests                   | **Vitest + React Testing Library**, **pytest + HTTPX**, **Playwright** selected; test configurations/specs are stubs and the JS manifest has no test script                                                                                                                                                                                      |
| Quality / CI            | **Oxlint**, **Oxfmt** installed; **Ruff** planned for Python; `.github/workflows/ci.yml` is empty                                                                                                                                                                                                                                                |
| Service contracts       | **OpenAPI** planned for TypeScript–Python API integration                                                                                                                                                                                                                                                                                        |

Use the versions and commands that actually exist. Keep the selected stack unless the project requirements change; do not substitute Prisma, Biome, another auth system, or additional microservices casually.

### Available JavaScript scripts (check `package.json` for changes)

`bun run dev`, `bun run build`, `bun run start`, `bun run typecheck` (`tsrs --noEmit`), `bun run lint` (Oxlint), `bun run lint:fix`, `bun run format` (writes files), `bun run format:check`, `bun run db:generate`, `bun run db:migrate`, `bun run db:push`, and `bun run db:studio`.

**Migration and push scripts exist, but `drizzle.config.ts` is empty**; do not run them against real data until configured and reviewed. There is currently no `bun run test`, `uv` environment/lockfile, Python lint/test command, or functioning CI pipeline to assume.

## Skill Selection

The project-local skill directory is [`.agents/skills/`](.agents/skills/). **Open the relevant `SKILL.md` and follow its workflow before doing the associated work**; apply multiple skills when work spans domains. Skill files are project guidance, not evidence that a feature is implemented. Links below point to the actual local entry points.

| Work                                  | Installed skills                                                                                                                                                                                                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI, shadcn components, forms, styling | **[shadcn](.agents/skills/shadcn/SKILL.md)** — mandatory whenever creating or modifying UI components; inspect `components.json` and existing `src/components/ui/` first                                                                                                                             |
| Drizzle schema, queries, migrations   | **[drizzle-orm](.agents/skills/drizzle-orm/SKILL.md)** (mandatory for Drizzle changes); [postgres-best-practices](.agents/skills/postgres-best-practices/SKILL.md) for SQL, pgvector, indexing, performance, and schema choices                                                                      |
| Request/form validation               | [zod](.agents/skills/zod/SKILL.md) for Zod 4 boundary parsing, errors, and schema design                                                                                                                                                                                                             |
| Better Auth configuration and flows   | [better-auth-best-practices](.agents/skills/better-auth-best-practices/SKILL.md), [create-auth](.agents/skills/create-auth/SKILL.md), [email-and-password-best-practices](.agents/skills/email-and-password-best-practices/SKILL.md)                                                                 |
| Auth roles, tenancy, hardening        | [organization-best-practices](.agents/skills/organization-best-practices/SKILL.md), [two-factor-authentication-best-practices](.agents/skills/two-factor-authentication-best-practices/SKILL.md), [better-auth-security-best-practices](.agents/skills/better-auth-security-best-practices/SKILL.md) |
| Security review                       | [security-audit](.agents/skills/security-audit/SKILL.md) — match the skill's review scope to the actual request; a full audit requires explicit audit intent                                                                                                                                         |
| Base UI migration                     | [migrate-radix-to-base](.agents/skills/migrate-radix-to-base/SKILL.md) **only** when migrating Radix code; this repository already uses Base UI                                                                                                                                                      |
| Skill authoring; Git commits          | [skill-creator](.agents/skills/skill-creator/SKILL.md) for new/revised skills; [git-commit](.agents/skills/git-commit/SKILL.md) when explicitly asked to create a commit                                                                                                                             |

For Next.js API changes, **also** consult the checked-in package docs in `node_modules/next/dist/docs/`. Read a skill's supporting references only as relevant, and never treat examples as automatically compatible with the installed versions.

## 5. UI/UX: Mandatory shadcn Skill

- **ALWAYS read and apply the local [shadcn skill](.agents/skills/shadcn/SKILL.md) when creating or modifying UI components.** Use its workflow and the installed shadcn/ui components wherever an appropriate component exists. With this project's Base UI setup, use Base UI composition APIs rather than assuming Radix's `asChild` works.
- Inspect existing components and the shadcn configuration before adding new ones. Reuse and compose components instead of recreating buttons, dialogs, forms, tables, dropdowns, or other primitives from scratch.
- Extend shadcn primitives through documented customization and Tailwind utilities; preserve accessibility and consistency. Do not edit vendored/generated component code unnecessarily.
- Prefer Server Components. Add `"use client"` only for stateful interactivity or required browser APIs, and keep the client boundary narrow.
- Use semantic HTML, correct labels and descriptions, keyboard navigation, visible focus states, and accessible validation/error feedback. Support loading, empty, error, and success states.
- Keep forms responsive and usable for catalog management, image uploads, indexing status, and AI search. Show scores and training states clearly without presenting uncertain AI matches as facts.
- Follow approved designs and existing UI conventions when available; do not invent a second design system.
- If the shadcn skill is inaccessible in the coding environment, disclose that limitation rather than claiming it was used.

## 6. TypeScript, React, and Next.js

- Enable and respect **strict TypeScript**; avoid `any`, unsafe assertions, unchecked non-null assertions, and broad type suppression. Use `unknown` plus narrowing for untrusted values.
- Prefer inferred types when obvious; define explicit types for stable public contracts and ambiguous boundaries. Use discriminated unions for domain states and typed results.
- Validate runtime inputs with **Zod** at server entry points and other untrusted boundaries; TypeScript alone does not validate network payloads, session claims, or files.
- Keep Server Components and server-side data access as the default. Use Client Components only for interactivity; avoid unnecessary effects, duplicated fetched state, and client-side secrets.
- Keep components focused and rendering pure. Use server-side operations for privileged actions, database access, object-storage credentials, and AI service credentials.
- Use Server Actions for appropriate mutations and Route Handlers for HTTP/API integrations, according to existing conventions. **Both must independently authenticate, authorize, and validate.**
- Handle expected failures with typed, user-safe errors; preserve server-side diagnostics without leaking secrets or stack traces.

## 7. Database, Permissions, and File Storage

- Use **Drizzle ORM** consistently for application database access and migrations. Keep queries server-side and within the owning feature's data boundary. Use parameterized SQL for pgvector-specific operations when ORM support is insufficient.
- Use PostgreSQL for authoritative product/SKU data, brand/category/description metadata, reference-image relationships, repository-image source metadata, job status, and search-history records.
- Use **pgvector** for embeddings; keep embedding dimensions, distance metrics, indexing configuration, and model/version metadata compatible. Never compare vectors from incompatible embedding spaces as if they were interchangeable.
- Put image bytes and model artifacts in **R2**, not in relational columns. Store identifiers, permissions, provenance, and metadata in the database.
- Validate file size, media type, actual content, and allowed use before processing. Limit upload access and object visibility; use server-controlled object keys and time-limited signed access where appropriate.
- Enforce authorization on **every read/write boundary**, including Server Actions, Route Handlers, storage operations, background job initiation, and history access. Restrict catalog administration and training actions to authorized roles; expose only intentionally public search/catalog data.
- Keep secrets in environment configuration, never in client bundles, committed files, logs, or error responses. Minimize retained image and search data and respect the project's approved retention/access rules.
- Make schema changes through reviewed migrations, not undocumented production edits.

## 8. AI Service, Retrieval, and Background Processing

- Treat the FastAPI service as a **versioned, validated external boundary**. Use **Pydantic** for Python request/response validation and keep TypeScript Zod schemas and documented OpenAPI contracts aligned without assuming automatic cross-language type safety.
- Use **YOLO** for bounding-box-based multi-product detection and **OpenCLIP** for image/text embeddings and semantic similarity, according to the approved model design. Do not conflate detection, classification, embeddings, and retrieval into a single guaranteed-accurate step.
- Support product indexing/training states such as **pending → processing → indexed/trained** or **failed**, with validated transitions, retries/reprocessing, error reporting, and recovery. Reflect the actual implementation's state vocabulary consistently.
- Execute long-running training, embedding generation, and batch image processing through **Celery + Redis**. Do not block web requests waiting for model training or large batch jobs.
- Make jobs as idempotent as practical; guard against duplicates, stale retries, deleted products, partially uploaded files, and concurrent re-indexing. Commit state changes deliberately and capture actionable failure information.
- Track the association between model version, preprocessing pipeline, embedding/index version, source image, and product/SKU. Re-index or migrate explicitly when an embedding model or vector dimension changes.
- Treat AI-generated product descriptions, predicted classes, bounding boxes, and similarity scores as **model outputs, not authoritative product facts**. Provide review/correction paths where the product workflow requires them.
- Do not label raw similarity scores as calibrated confidence probabilities unless calibration has been established. Define and test ranking, thresholds, no-match behavior, and multi-detection handling based on evaluation evidence.
- Keep training/evaluation datasets appropriately split, avoid leakage between product reference images and evaluation images, and evaluate representative multi-product shelf/store scenes.
- Do not commit large training datasets, uploaded product images, model weights, credentials, or generated artifacts unless explicitly required and approved.

## 9. Functional Requirements to Preserve

These are **planned acceptance goals from the README**. Implement each incrementally; preserve behavior only after it actually exists:

1. **Product catalog:** create, view, update, delete products/SKUs with brand, category, description, and multiple reference images.
2. **AI indexing/training:** generate embeddings, track pending/processing/success/failure, and allow authorized reprocessing.
3. **Product search:** search by name, natural-language description, or uploaded image.
4. **Image repository:** store shelf/store images with their store, date, campaign, or other source associations.
5. **Product detection/search:** find one or multiple products within images and return associated records with meaningful similarity/match information.
6. **Search history:** persist and review previous searches and results subject to access controls.

For new features, define concrete acceptance criteria and verify behavior for the relevant user roles. Do not imply the current scaffold satisfies any item merely because a route or module directory exists.

## 10. Testing, Quality, and Observability

- **Testability:** design deterministic domain logic so it can be tested without database, network, file-storage, or model calls. Mock integration boundaries thoughtfully; use real integrations where they provide meaningful contract coverage.
- Add or update **Vitest/React Testing Library** tests for web/domain behavior, **pytest/HTTPX** tests for Python/FastAPI behavior, and **Playwright** tests for critical end-to-end workflows when relevant.
- Test happy paths **and** failures: invalid input, unauthorized access, malformed uploads, missing data, duplicate jobs, AI service downtime, failed indexing, no matches, and multiple detections.
- For AI changes, cover image preprocessing, output schema, ranking/threshold behavior, and model-version compatibility using deterministic fixtures; add evaluation metrics where appropriate.
- **Observability:** log actionable diagnostics for API errors, job attempts/failures, and cross-service requests. Use correlation/job identifiers where supported. Redact credentials, personal data, sensitive search content, and private image URLs.
- **Accessibility by default:** test keyboard access, visible focus, meaningful labels, form errors, and status announcements for interactive workflows.
- **Incremental development:** preserve existing behavior, add narrowly scoped tests, and avoid unrelated refactors.
- For TypeScript changes, run applicable existing commands: `bun run typecheck`, `bun run lint`, `bun run format:check`, and `bun run build` when the change warrants a build. For docs-only changes, prefer Markdown/link and `git diff --check` validation. Once Python/test/CI scaffolds are configured, use their _actual_ documented commands. **Do not invent test scripts or report a placeholder workflow as a passed check.**
- Avoid running `bun run format` solely to validate: it is a **write** operation. Use `format:check` for a read-only check.
- Keep documentation, OpenAPI schemas, migrations, environment examples, and tests in sync with meaningful contract/configuration changes.

## 11. Gitflow, Pull Requests, and CI

- Follow the **planned Gitflow** from the README: production `main`, integration `development` (verify that branch exists before using it), and `feature/*`, `release/*`, and `hotfix/*` branches. Check the current branch before starting; do not infer any server-side branch protection from a local branch name.
- Use the branch and commit naming conventions already defined in the repository; do not guess an unrecorded naming standard.
- **Never push directly to protected branches.** Make changes through pull requests with **at least one approval** and all required **GitHub Actions** checks passing before merge.
- Keep pull requests focused, explain behavioral changes and risks, and include tests/verification. Delete merged short-lived branches according to team policy.
- Preserve the documented sprint-based development/release and QA review process. Do not bypass QA, branch protection, or CI to expedite a change.
- Never claim a PR is approved, a workflow passed, a branch was merged, or a deployment completed without verifying it.

## 12. Agent Completion Checklist

Before finishing any implementation:

- [ ] Read the README, relevant instructions, and existing code; honored established conventions.
- [ ] Kept changes within the appropriate **vertical slice** and maintained **modular-monolith boundaries**.
- [ ] Read applicable [skills](#skill-selection), including **shadcn for UI work**, and reused existing UI/components (or disclosed an unavailable skill).
- [ ] Checked server-side authorization, runtime validation, sensitive data, and accessibility.
- [ ] Considered AI service contracts, job states, embedding versions, and retriability where relevant.
- [ ] Added/updated meaningful tests and docs; avoided unrelated dependencies and changes.
- [ ] Ran applicable checks, recorded which passed/failed/not run, and did **not** claim unexecuted validation.
- [ ] Checked `git status` and did not overwrite other uncommitted work, especially the Python service directory move.
- [ ] Summarized what changed, why, any limitations, and the exact follow-up needed.

## 13. Decision Order

When several valid implementations exist:

1. **Correctness, security, and explicit requirements.**
2. **Consistency** with the actual repository and approved stack.
3. **Vertical Slice + Modular Monolith** boundaries and cohesive feature ownership.
4. **Simplicity, type safety, accessibility, and maintainability.**
5. Minimal new dependencies, abstractions, hidden state, and cross-service coupling.
6. Measured performance and operational needs, especially for AI processing.
7. Additional complexity **only** when its benefits are concrete and testable.
