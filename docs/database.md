# Lensistry database foundation

The source of truth is `src/modules/*/db/*.schema.ts`, aggregated by
`src/lib/db/schema.ts`. `drizzle.config.ts` generates versioned migrations in
`drizzle/`. Run `bun run db:generate` to review schema changes and apply them
with `bun run db:migrate` using a **separately provisioned** PostgreSQL database.
The initial migration enables `vector`; the migrator role needs permission to
install that extension. Set `DATABASE_URL` to a trusted migration connection;
never use `db:push` against a shared or production database.

Authentication is provided by Better Auth 1.7.13 and the `admin()` plugin.
Its tables (`user`, `session`, `account`, `verification`, `rate_limit`) were
generated from the installed Better Auth Drizzle generator. Only its relation
declarations were adapted to Drizzle 0.45's supported API. After changing
Better Auth plugins or options, regenerate the tables with the matching Better
Auth version, compare the diff, and produce a new Drizzle migration. Configure
`DATABASE_URL`, `BETTER_AUTH_SECRET` (at least 32 secure random characters),
and `BETTER_AUTH_URL` on the server. Public registration is disabled, so an
administrator must be securely provisioned before staff invitations / account
management. Authorization checks belong in server feature handlers; the
`admin` and `user` roles alone do not guard future application endpoints.

`catalog` owns brands, nested categories, products, keywords, and R2 object
keys for reference images. `repository` owns stores, campaigns, source photos,
and normalized bounding boxes for detections. `indexing` owns job attempts,
failures, and 512-dimensional image vectors; the HNSW cosine index supports
approximate search when the collection becomes large. `search` stores private
user-scoped searches and result snapshots. Public anonymous searches can be
served without persisting identifying histories. Product deletion keeps
historical source-photo records and search labels but clears deleted product
references. Object storage garbage collection must occur in the application.

Indexing is append-only by job. Readers should select embeddings only for the
latest **successful** indexing job of the required model version; incomplete
jobs must never become visible as the active index. Enforce this switch and
job retry concurrency in the indexing feature's transaction boundaries.
Embedding dimensions must match the actual OpenCLIP deployment; changing them
requires a reviewed schema migration and full re-index. The similarity score
is a ranking metric, not a calibrated probability. Detection confidence and
bounding-box checks are storage invariants, not evidence of model calibration.

`bunx drizzle-kit check` validates migration journal consistency. TypeScript
and SQL generation are static checks only: before production, validate
migration application and rollback strategy with a migrated PostgreSQL test
instance, benchmark representative search queries, and test authorization,
multi-product matches, concurrent jobs, and account recovery. The current
repository still has placeholder UI, feature handlers, workers, and email
delivery. Password-reset email delivery, production secrets, and service
integrations must be configured before real users can sign in safely.
