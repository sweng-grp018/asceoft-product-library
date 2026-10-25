# Drizzle Migrations

`generate` turns a schema diff into SQL you commit. `migrate` applies it. Every
mistake here is either SQL nobody read or SQL that ran twice.

## Contents

- [Config](#config)
- [Workflow](#workflow)
- [Renames](#renames)
- [Custom Migrations](#custom-migrations)
- [Running in Production](#running-in-production)
- [Drift in CI](#drift-in-ci)
- [Upgrading to 1.0](#upgrading-to-10)
- [Rules](#rules)

## Config

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

`strict: true` only makes `push` ask before it runs its SQL. It does nothing for
`generate`, and 1.0 removes it.

## Workflow

```bash
drizzle-kit generate --name=add_posts    # writes drizzle/0003_add_posts.sql
# read the SQL
drizzle-kit migrate                      # applies what the journal has not seen
```

On 0.x the files are `drizzle/0003_add_posts.sql`, with order and hashes in
`drizzle/meta/_journal.json`. Commit both. Never edit or delete a migration that
has run anywhere; write a new one.

```bash
# BAD: push on a shared database — no file, no history, no review
DATABASE_URL=$STAGING_URL drizzle-kit push

# GOOD: push only against your own throwaway database while prototyping
drizzle-kit push
```

`drizzle-kit pull` writes a schema from an existing database. Use it once, to
adopt a database Drizzle did not create.

## Renames

`generate` cannot tell a rename from a drop plus an add, so it asks.

```
? Is full_name column in users table created or renamed from another column?
❯ + full_name            create column
  ~ name › full_name     rename column
```

Pick **rename**. Picking create drops `name` and every value in it. In CI there
is no prompt, so generate renames on your machine and commit the result.

## Custom Migrations

```bash
drizzle-kit generate --custom --name=backfill_roles   # an empty file you fill in
```

```sql
-- drizzle/0004_backfill_roles.sql
UPDATE "users" SET "role" = 'member' WHERE "role" IS NULL;
```

Use one for backfills, data fixes, extensions, and anything the diff cannot see.
For a column that must become NOT NULL on a live table, follow the sql skill's
safe migration steps.

## Running in Production

```ts
// src/db/migrate.ts — run once per deploy, before the app starts
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.MIGRATOR_DATABASE_URL });
await migrate(drizzle({ client: pool }), { migrationsFolder: "./drizzle" });
await pool.end();
```

```ts
// BAD: every instance migrates on boot; two replicas race, and a failure still starts the app
await migrate(db, { migrationsFolder: "./drizzle" });
app.listen(PORT);
```

Run it as a one-shot step the app waits on (docker-best-practices
production guide). It connects as the table owner. The app connects as a limited
role (see the row-level security reference). Ship the `drizzle/` folder in the image; `drizzle-kit` is a dev
dependency and should not be.

## Drift in CI

```yaml
# BAD: passes whether or not the schema and the migrations agree
- run: npx drizzle-kit generate

# GOOD: a schema change with no migration fails the build
- run: npx drizzle-kit generate && git diff --exit-code drizzle/
- run: npx drizzle-kit check     # two branches that both added 0005
```

## Upgrading to 1.0

Stay on 0.45 until 1.0 is `latest` on npm. When you move:

1. Run `drizzle-kit up`. It rewrites `drizzle/` into one folder per migration
   (`drizzle/<timestamp>_name/migration.sql`) and adds `name` and `applied_at` to
   the migrations table.
2. Rewrite relational queries. `db._query` (the old API) is gone in 1.0.
3. Replace `relations()` with one `defineRelations`, and pass `{ relations }`.
4. Change `drizzle-zod` imports to `drizzle-orm/zod`.
5. Rename `getTableColumns` to `getColumns`. `.array()` no longer chains.
6. Replace `.enableRLS()` with `pgTable.withRLS(...)`.
7. Drop `strict` from the config. `push` asks before data loss unless `--force`.
8. `push` and `pull` now manage every schema by default, not only `public`.
9. The migrator applies every missing migration, whatever its timestamp order.

```ts
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    posts: r.many.posts({ from: r.users.id, to: r.posts.userId }),
    groups: r.many.groups({
      from: r.users.id.through(r.usersToGroups.userId),
      to: r.groups.id.through(r.usersToGroups.groupId),
    }),
  },
  posts: { author: r.one.users({ from: r.posts.userId, to: r.users.id }) },
}));

export const db = drizzle({ client: pool, relations });
await db.query.users.findMany({ where: { id: 1 }, with: { posts: true } });
```

In v2, many-to-many goes through the junction table with `.through()`, and
`where` is an object.

## Rules

- Always read the generated SQL before `migrate`.
- Always commit `drizzle/` and `meta/_journal.json`; never edit a migration that has run.
- Always pick **rename** when `generate` asks; create drops the data.
- Never `push` to a database anyone else uses.
- Always run migrations as a one-shot deploy step, as the owner role, never on app boot.
- Always fail CI on `generate` + `git diff --exit-code drizzle/`.
- Never upgrade to 1.0 while it is a release candidate; when you do, run `drizzle-kit up` first.
