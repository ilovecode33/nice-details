# @ilovecode33/persistence

A small, framework-neutral IndexedDB layer with two typed stores:

- **Key-value** — out-of-line keys, one value per key.
- **Table** — records with a primary key, auto-increment, and secondary indexes.

It has no runtime dependencies and does not touch IndexedDB at import time, so it is safe to import
during SSR. The database is opened only when you call `openPersistence`.

## Install

```bash
bun add @ilovecode33/persistence
```

## Quick start

```ts
import { openPersistence } from "@ilovecode33/persistence";

const db = await openPersistence({
  name: "my-app",
  version: 1,
  stores: {
    settings: { type: "kv" },
    notes: {
      type: "table",
      keyPath: "id",
      indexes: [{ name: "byUpdatedAt", keyPath: "updatedAt" }],
    },
  },
});

const settings = db.kv<{ theme: string }>("settings");
await settings.set("prefs", { theme: "dark" });
const prefs = await settings.get("prefs");

interface Note {
  id: string;
  title: string;
  updatedAt: string;
}

const notes = db.table<Note, string>("notes");
await notes.put({ id: "n1", title: "First", updatedAt: "2026-11-27" });

const recent = await notes.getAllByIndex("byUpdatedAt", IDBKeyRange.lowerBound("2026-11-01"));

db.close();
// await db.destroy(); // close and delete the database
```

## Schema

Each entry in `stores` describes one IndexedDB object store:

```ts
// Key-value: one value per key, keys are supplied to set/get/delete.
const kv: StoreSchema = { type: "kv" };

// Table: records carry their primary key, with optional indexes.
const table: StoreSchema = {
  type: "table",
  keyPath: "id",
  // autoIncrement: true, // when records have no keyPath
  indexes: [
    { name: "byUpdatedAt", keyPath: "updatedAt" },
    { name: "byTag", keyPath: "tags", unique: false, multiEntry: true },
  ],
};
```

- Omit `version` to open the current version (or create version 1).
- Pass a higher `version` together with new stores/indexes to upgrade.
- The schema is **additive**: existing stores and indexes are kept. Use `onUpgrade` for custom
  migrations and data backfills.
- A table store needs `keyPath` or `autoIncrement`; otherwise opening rejects with
  `PersistenceError`.

## Key-value store

```ts
const kv = db.kv<MyValue>("cache");

await kv.set(key, value);
await kv.get(key); // MyValue | undefined
await kv.has(key); // boolean
await kv.delete(key);
await kv.clear();
await kv.count();
await kv.keys(); // IDBValidKey[]
await kv.entries(); // Array<[IDBValidKey, MyValue]>
```

## Table store

```ts
const notes = db.table<Note, string>('notes');

await notes.add(note);    // rejects if the primary key already exists
await notes.put(note);    // upsert
await notes.get(id);
await notes.has(id);
await notes.delete(id);
await notes.clear();
await notes.count();
await notes.getAll();     // Note[]
await notes.getAllKeys(); // string[]
await notes.getAll(query?, count?);
await notes.getAllKeys(query?, count?);
await notes.getAllByIndex('byUpdatedAt', query?, count?);
await notes.countByIndex('byUpdatedAt', query?);
```

`query` is an `IDBValidKey` or `IDBKeyRange`.

## Errors

All failures reject with `PersistenceError`, with the original `DOMException` available as `cause`:

```ts
import { PersistenceError } from "@ilovecode33/persistence";

try {
  await db.table("missing").get("x");
} catch (error) {
  if (error instanceof PersistenceError) {
    console.error(error.message, error.cause);
  }
}
```

If IndexedDB is unavailable (for example in Node or an old browser), `openPersistence` rejects
instead of throwing at import time.

## Testing

`openPersistence` accepts a `factory` so tests can inject a fake implementation:

```ts
import { openPersistence } from "@ilovecode33/persistence";
import { indexedDB } from "fake-indexeddb";

const db = await openPersistence({
  name: "test",
  version: 1,
  stores: { settings: { type: "kv" } },
  factory: indexedDB,
});
```

The package's own tests use `fake-indexeddb/auto` in `rstest.setup.ts`.

## Commands

```bash
bunx turbo run build --filter=@ilovecode33/persistence
bunx turbo run typecheck --filter=@ilovecode33/persistence
bunx turbo run test --filter=@ilovecode33/persistence
```

## Links

- [CHANGELOG.md](CHANGELOG.md)
- [Repository README](../../README.md) and [RELEASING.md](../../RELEASING.md)
- [AI rules index](../ai-rules/README.md)
