# Drizzle Connections and Test Databases

How you create `db` depends on how long your process lives. A long-running
server keeps one pool. A serverless function cannot, and a dev server that
reloads makes a new one on every save unless you stop it.

## Contents

- [Long-Running Server (Express)](#long-running-server-express)
- [Next.js Dev Reloads](#nextjs-dev-reloads)
- [Serverless and Transaction Poolers](#serverless-and-transaction-poolers)
- [Test Database](#test-database)
- [Rules](#rules)

## Long-Running Server (Express)

```ts
// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const pool = new Pool({ connectionString: env.APP_DATABASE_URL, max: 10 });
export const db = drizzle({ client: pool, schema, casing: "snake_case" });
```

```ts
// BAD: a pool per request — connections pile up until Postgres refuses them
app.get("/notes", async (req, res) => {
  const db = drizzle({ client: new Pool({ connectionString: env.APP_DATABASE_URL }) });
  res.json(await db.select().from(notes));
});
```

One module, one pool, imported everywhere. Close it on shutdown with
`await pool.end()` after `server.close()`.

`max` times the number of app instances must stay under Postgres's
`max_connections` (100 by default), with room left for migrations and you.

## Next.js Dev Reloads

```ts
// src/db/index.ts — hot reload re-runs this module; reuse the pool across reloads
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool = globalForDb.pool ?? new Pool({ connectionString: env.APP_DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
```

Without it, every save in `next dev` opens a new pool, and after a few minutes
Postgres says `too many clients already`.

Import `db` only from server code (route handlers, server actions, server
components). Add `import "server-only"` at the top of the file so a client
import fails at build time.

## Serverless and Transaction Poolers

A function that may run on a fresh instance per request should not hold a pool.

```ts
// Neon over HTTP — no pool, one round-trip per query
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export const db = drizzle({ client: neon(env.DATABASE_URL), schema, casing: "snake_case" });
```

`neon-http` does not support interactive transactions. Use `neon-serverless`
(WebSocket) where you need `db.transaction`, including `withUser` from the row-level security reference.

```ts
// BAD: prepared statements through a transaction pooler (PgBouncer, Supavisor on 6543)
const client = postgres(env.DATABASE_URL);

// GOOD: the pooler hands each statement to any backend; a prepared one is not there
const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle({ client, schema, casing: "snake_case" });
```

Migrations need a direct (session) connection, not the transaction pooler.

## Test Database

Test against real Postgres, never a mock of `db`. A mock agrees with your bug.

```ts
// vitest.global-setup.ts — once per run: an empty database, migrated
export default async function setup() {
  const admin = new Pool({ connectionString: env.ADMIN_DATABASE_URL });
  await admin.query(`DROP DATABASE IF EXISTS app_test WITH (FORCE)`);
  await admin.query(`CREATE DATABASE app_test`);
  await admin.end();

  const pool = new Pool({ connectionString: env.TEST_DATABASE_URL });
  await migrate(drizzle({ client: pool }), { migrationsFolder: "./drizzle" });
  await pool.end();
}
```

```ts
// BAD: wipe shared tables before each test — locks rows, and parallel files collide
beforeEach(() => db.execute(sql`TRUNCATE users CASCADE`));

// GOOD: each test makes its own rows with unique values and reads only those
const user = await createUser({ email: `${randomUUID()}@test.dev` });
```

Run migrations in the setup, not `push`, so the tests see the same SQL production
runs. Set `jit = off` on the test database. The testing-best-practices skill
covers the rest of database test speed.

## Rules

- Always create one pool per process, in one module, and close it on shutdown.
- Always reuse the pool across reloads in Next.js dev through `globalThis`.
- Never import `db` into client code; mark the module `server-only`.
- Always pass `prepare: false` to postgres.js behind a transaction pooler.
- Always run migrations over a direct connection, not a transaction pooler.
- Never use `neon-http` where you need a transaction.
- Always test against a real, migrated Postgres; never mock `db`.
- Never truncate shared tables between tests; give each test its own rows.
