# Row-Level Security with Drizzle

Row-level security makes Postgres filter rows by policy, so a query that forgot
its `where` still cannot read another tenant's data. It only works if the app
connects as a role the policies apply to.

## Contents

- [The Trap: Superusers Skip It](#the-trap-superusers-skip-it)
- [Roles and Policies in the Schema](#roles-and-policies-in-the-schema)
- [The Current User, per Request](#the-current-user-per-request)
- [Testing a Policy](#testing-a-policy)
- [Rules](#rules)

## The Trap: Superusers Skip It

Superusers and roles with `BYPASSRLS` skip every policy, with no error and no
warning. So does the table owner, unless the table forces RLS.

```ts
// BAD: the app connects as postgres — every policy below is decoration
const pool = new Pool({ connectionString: "postgres://postgres:…@db/app" });

// GOOD: the app is a plain role; migrations run as the owner
const pool = new Pool({ connectionString: process.env.APP_DATABASE_URL });   // role "app"
```

Create the `app` role with `NOSUPERUSER NOBYPASSRLS` (docker-best-practices
production guide shows the init script). Check it once:

```sql
SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user;  -- f, f
```

## Roles and Policies in the Schema

```ts
import { sql } from "drizzle-orm";
import { pgPolicy, pgRole, pgTable } from "drizzle-orm/pg-core";

export const appRole = pgRole("app").existing();   // created outside migrations

const currentUserId = sql`current_setting('app.user_id', true)::int`;

export const notes = pgTable(
  "notes",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().notNull().references(() => users.id),
    body: text().notNull(),
  },
  (t) => [
    index().on(t.userId),
    pgPolicy("notes_owner", {
      for: "all",
      to: appRole,
      using: sql`${t.userId} = ${currentUserId}`,
      withCheck: sql`${t.userId} = ${currentUserId}`,
    }),
  ],
);
```

A policy on a table turns RLS on for it. To turn it on with no policy yet (every
row hidden), call `.enableRLS()` on 0.45 or use `pgTable.withRLS` on 1.0.

`.existing()` tells `drizzle-kit` not to create the role. Leave it off only if
migrations should own the role.

`using` filters what the role can read, update, and delete. `withCheck` stops it
from writing a row it could not read back. Leave `withCheck` off and a user can
insert a note into someone else's account.

To make the table owner obey policies too, add a custom migration:

```sql
ALTER TABLE "notes" FORCE ROW LEVEL SECURITY;
```

## The Current User, per Request

```ts
// BAD: session-level setting on a pooled connection — the next request on that
// connection inherits this user
await db.execute(sql`select set_config('app.user_id', ${String(userId)}, false)`);
const rows = await db.select().from(notes);
```

```ts
// GOOD: transaction-local; it ends with the transaction
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function withUser<T>(userId: number, fn: (tx: Tx) => Promise<T>) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${String(userId)}, true)`);
    return fn(tx);
  });
}

const myNotes = await withUser(session.user.id, (tx) => tx.select().from(notes));
```

The third argument `true` scopes the setting to the transaction. This also works
behind a transaction pooler (PgBouncer, Supavisor), where any other form is
unsafe. Every query that touches an RLS table goes through `withUser`.

Keep the `where userId = …` in your queries anyway. The policy is the backstop
for the query you forgot, and the `where` lets the index do its job.

## Testing a Policy

Test as the `app` role, against a real database:

```ts
it("hides another user's notes", async () => {
  await seedNote({ userId: alice.id });
  const rows = await withUser(bob.id, (tx) => tx.select().from(notes));
  expect(rows).toEqual([]);
});

it("refuses a note written into another account", async () => {
  await expect(
    withUser(bob.id, (tx) => tx.insert(notes).values({ userId: alice.id, body: "x" })),
  ).rejects.toThrow(/row-level security/);
});
```

A test run as the owner or a superuser passes whether the policy works or not.

## Rules

- Never let the app connect as a superuser, a `BYPASSRLS` role, or the table owner.
- Always mark a role created outside migrations with `pgRole(...).existing()`.
- Always give a write policy a `withCheck`, not only `using`.
- Always set the current user with `set_config(..., true)` inside a transaction.
- Never set it at session level on a pooled connection.
- Always keep the explicit `where` on the owner column; the policy is a backstop.
- Always test a policy as the app role, and test the denial, not only the happy path.
