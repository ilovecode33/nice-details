# Persisted data and migrations

Applies to every value this repository writes to a durable store: IndexedDB, Durable Object storage,
localStorage, and the encrypted room payload.

## Why this rule exists

A production release cannot ask users to clear their browser data. Any change to a stored shape
therefore ships with a reader that understands the old shape and a migration that moves it forward.
Silent fallbacks are treated as data loss.

## Stores and their version constants

| Store                                             | Constant                | Location                             |
| ------------------------------------------------- | ----------------------- | ------------------------------------ |
| OKR document (`okr-web` → `state` → `current`)    | `CURRENT_STATE_VERSION` | `packages/okr-shared/src/schema.ts`  |
| Legacy localStorage document (`okr-web.state.v1`) | `CURRENT_STATE_VERSION` | `packages/okr-shared/src/storage.ts` |
| Saved sync room (`sync-room`)                     | `SYNC_ROOM_VERSION`     | `apps/okr-web/src/storage.ts`        |
| Saved period/sort filters (`view`)                | `VIEW_VERSION`          | `apps/okr-web/src/storage.ts`        |
| Durable Object room record (`room`)               | `ROOM_RECORD_VERSION`   | `apps/okr-realtime/src/room.ts`      |
| IndexedDB database itself                         | `OKR_DATABASE_VERSION`  | `apps/okr-web/src/storage.ts`        |

The encrypted room payload is opaque to the Worker; its shape is the OKR document and is migrated on
the client with `parseState`.

Derived values are exempt: the quarter fields are recomputed from the objective's dates on every
read, so changing their format never needs a version bump.

## Rules

1. **Additive optional fields do not need a version bump.** Adding `keyResult.updatedAt` or
   `state.deleted` was compatible: old readers ignore them and new readers tolerate their absence.
2. **Renaming, removing, or changing the meaning of a stored field requires a bump.** Bump the
   constant, add the next step to the migration map, and change the `version` literal in the type.
3. **Read through one entry point.** The app reads documents with `parseState()`, never by casting.
   It returns `ok`, `invalid`, or `newer`, and normalized output.
4. **Never overwrite data you cannot read.** A newer version is refused and surfaced to the user. A
   corrupt value is copied to a backup key (`current.corrupt`) before replacing it.
5. **Migrate once and write back.** When `parseState` reports `migrated`, the storage layer writes
   the migrated document so the old shape stops spreading.
6. **Old records stay readable.** Version-less records (sync room, room record) are read as version
   1; unknown future versions are ignored, not rewritten.
7. **Migrate the database inside `openPersistence`.** A new object store or index bumps
   `OKR_DATABASE_VERSION`; the persistence layer applies the new schema during the upgrade and keeps
   existing records.
8. **Test all three paths** for every change: old shape → current, corrupt → backup + sample, newer
   → refused without writes.
9. **Update the app README data contract, the changeset, and this table** in the same pull request.

## Review checklist

- [ ] Does the change alter a stored field's name, type, or meaning?
- [ ] Is the matching version constant bumped and the migration registered?
- [ ] Does an existing record from the previous release still load?
- [ ] Is unreadable data preserved instead of replaced?
- [ ] Is a newer record never overwritten or silently ignored?
- [ ] Do tests cover old, corrupt, and newer records?
- [ ] Is the room payload still readable by the previous app release, or is the breaking change
      intentional and documented?
