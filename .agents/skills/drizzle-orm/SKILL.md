---
name: drizzle-orm
category: Backend
description: "MUST USE when writing or reviewing Drizzle ORM schemas, migrations, relational queries, or drizzle-kit configuration. Enforces identity columns, timestamptz, indexed foreign keys, working relations, type inference, and safe writes. Bundle covers migrations and the 1.0 upgrade, row-level security, and connections and test databases."
tracks: drizzle-orm@0.45
metadata:
  gate-paths: "**/*.ts"
---

# Drizzle ORM

Drizzle 0.45 is the stable line; 1.0 is a release candidate. Everything here is
0.45. Check `package.json` before copying, and read MIGRATIONS.md before an upgrade.

## Quick Reference — When to Load What

| Working on… | Read |
|---|---|
| drizzle.config, generate/migrate, renames, CI drift, upgrading to 1.0 | MIGRATIONS.md |
| Policies, app role, current user per request | RLS.md |
| Pool vs serverless driver, Next.js singleton, test database | CONNECTIONS.md |

## Schema — Identity Columns, Not Serial

```ts
// BAD: serial is legacy PostgreSQL
id: serial().primaryKey(),

// GOOD
id: integer().primaryKey().generatedAlwaysAsIdentity(),
```

## Schema — Let Casing Do the Naming

```ts
// BAD: half the columns named by hand, half by key; the SQL is a mix
firstName: varchar("first_name", { length: 256 }),
lastName: varchar({ length: 256 }),            // becomes "lastName"

// GOOD: one setting, in both places, and no names by hand
export const db = drizzle({ client: pool, schema, casing: "snake_case" });
export default defineConfig({ casing: "snake_case", /* … */ });
```

Set it in `drizzle()` and in `drizzle.config.ts`. With only one, queries and
migrations disagree about column names.

## Schema — Timestamps, Enums, Foreign Keys

```ts
export const roleEnum = pgEnum("role", ["guest", "user", "admin"]);

export const posts = pgTable(
  "posts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: text().notNull(),
    role: roleEnum().notNull().default("guest"),
    userId: integer().notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.userId)],   // Postgres never indexes a foreign key for you
);
```

```ts
// BAD: timestamp without a zone — the server's time zone leaks into the data
createdAt: timestamp().notNull().defaultNow(),
```

`$onUpdate` runs only on a Drizzle `update()`. Raw SQL and other clients never
touch it.

## Schema — One File per Domain

```ts
// BAD: src/db/schema.ts — passes 200 lines by the fifth table
// GOOD: src/db/schema/users.ts, posts.ts, billing.ts, index.ts re-exports them
schema: "./src/db/schema/*.ts",   // in drizzle.config.ts
```

Keep each schema file under 200 lines. Better Auth generates its own tables, and
their `user.id` is `text`; a foreign key to it is `text()`, not `integer()`.

## Schema — Type Inference

```ts
// BAD: a hand-written interface drifts from the table
interface User { id: number; name: string }

// GOOD
export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
```

## Relations — One-to-Many

```ts
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  memberships: many(usersToGroups),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.userId], references: [users.id] }),
}));
```

One `relations()` per table. Declare a second one for the same table and the
schema file fails with a duplicate export.

## Relations — Many-to-Many

The junction table needs its own `relations()`, with a `one()` to each side.

```ts
export const usersToGroups = pgTable(
  "users_to_groups",
  {
    userId: integer().notNull().references(() => users.id),
    groupId: integer().notNull().references(() => groups.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.groupId] }), index().on(t.groupId)],
);

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  user: one(users, { fields: [usersToGroups.userId], references: [users.id] }),
  group: one(groups, { fields: [usersToGroups.groupId], references: [groups.id] }),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  memberships: many(usersToGroups),
}));
```

```ts
const user = await db.query.users.findFirst({
  where: eq(users.id, id),
  with: { memberships: { with: { group: true } } },
});
```

## Relational Queries

```ts
// BAD: every column of both tables, for a list that shows two
await db.query.users.findMany({ with: { posts: true } });

// GOOD: name the columns at each level
await db.query.users.findMany({
  columns: { id: true, name: true },
  with: {
    posts: {
      columns: { id: true, title: true },
      where: (p, { eq }) => eq(p.published, true),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: 5,
    },
  },
});
```

Use `db.query` for nested shapes. Use `db.select()` with joins for flat rows,
aggregates, and reports; a join is not a smell.

## Writes

```ts
const [user] = await db.insert(users).values(input).returning();

await db
  .insert(users)
  .values(input)
  .onConflictDoUpdate({ target: users.email, set: { name: input.name } });
```

Since 0.44 a driver error arrives wrapped in `DrizzleQueryError`. The Postgres
code is on `cause`:

```ts
// BAD: always undefined since 0.44; every duplicate becomes a 500
if (err.code === "23505") throw new AppError("Email taken", 409);

// GOOD
if (err instanceof DrizzleQueryError && (err.cause as { code?: string })?.code === "23505") {
  throw new AppError("Email taken", 409);
}
```

## Transactions

```ts
// BAD: `db` inside the callback runs outside the transaction; it never rolls back
await db.transaction(async (tx) => {
  await tx.insert(orders).values(order);
  await db.update(inventory).set({ stock: sql`${inventory.stock} - 1` })
    .where(eq(inventory.id, itemId));
});

// GOOD: every statement goes through tx
await db.transaction(async (tx) => {
  await tx.insert(orders).values(order);
  await tx.update(inventory).set({ stock: sql`${inventory.stock} - 1` })
    .where(eq(inventory.id, itemId));
});
```

A thrown error rolls back. `tx.rollback()` rolls back on purpose. Pass
`{ isolationLevel: "serializable" }` as the second argument when two writers race.

## Pagination and Soft Deletes

```ts
// BAD: OFFSET reads and throws away every skipped row; page 500 is slow
.orderBy(desc(posts.createdAt)).limit(20).offset(page * 20)

// GOOD: keyset — continue after the last row the client saw
.where(or(lt(posts.createdAt, cursor.createdAt),
  and(eq(posts.createdAt, cursor.createdAt), lt(posts.id, cursor.id))))
.orderBy(desc(posts.createdAt), desc(posts.id)).limit(20)
```

Index `(createdAt, id)` for it. For soft deletes, add `deletedAt` and filter
`isNull(t.deletedAt)` in every query; neither `db.query` nor `select()` does it
for you. Give hot lookups a partial index:

```ts
index("posts_live_idx").on(t.userId).where(sql`deleted_at is null`),
```

## Migrations

```bash
drizzle-kit generate --name=add_posts   # review the SQL before it runs
drizzle-kit migrate                     # applies it
drizzle-kit push                        # local prototyping only
```

Renames, custom SQL, production runs, CI drift checks, and the 1.0 upgrade are in
MIGRATIONS.md. Safe DDL on a live table is in the sql skill.

## Rules

1. **Always use identity columns**, never `serial`.
2. **Always set `casing: "snake_case"`** in both `drizzle()` and `drizzle.config.ts`; never name columns by hand.
3. **Always use `timestamp({ withTimezone: true })`.**
4. **Always index a foreign key column** — Postgres does not.
5. **Always keep schema files under 200 lines**, one per domain.
6. **Always infer types** with `$inferInsert` / `$inferSelect`.
7. **Always give a junction table its own `relations()`**, and one `relations()` per table.
8. **Always name `columns`** in relational queries that feed a list or an API.
9. **Always read the Postgres code from `err.cause`** of a `DrizzleQueryError`.
10. **Never use `db` inside a transaction callback** — use `tx`.
11. **Never paginate deep lists with OFFSET** — use a keyset on an indexed pair.
12. **Never use `push` against a shared or production database.**

## Reference Files

- **MIGRATIONS.md** — read before editing `drizzle.config.ts`, generating or applying a migration, renaming a column, or upgrading to 1.0. Covers config, the 0.x file layout, renames, custom migrations, the one-shot production step, CI drift checks, and the 1.0 upgrade checklist with relations v2.
- **RLS.md** — read before adding row-level security or a policy. Covers why the app must not connect as a superuser, `pgRole` and `pgPolicy`, setting the current user per request inside a transaction, and testing that a policy denies.
- **CONNECTIONS.md** — read before creating the `db` instance or a test database. Covers `node-postgres` for a long-running server, the Next.js dev singleton, serverless drivers and transaction poolers, and a migrated test database.
