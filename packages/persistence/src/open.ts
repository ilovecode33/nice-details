import { PersistenceError } from './errors';
import { getDefaultFactory } from './idb';
import { KVStoreImpl } from './kv';
import { TableStoreImpl } from './table';
import type {
  Persistence,
  PersistenceOptions,
  StoreSchema,
} from './types';

class PersistenceImpl implements Persistence {
  constructor(
    private readonly db: IDBDatabase,
    private readonly factory: IDBFactory,
  ) {}

  get name(): string {
    return this.db.name;
  }

  get version(): number {
    return this.db.version;
  }

  kv<T = unknown>(storeName: string) {
    return new KVStoreImpl<T>(this.db, storeName);
  }

  table<T = unknown, K extends IDBValidKey = IDBValidKey>(storeName: string) {
    return new TableStoreImpl<T, K>(this.db, storeName);
  }

  close(): void {
    this.db.close();
  }

  async destroy(): Promise<void> {
    this.close();
    await deletePersistence(this.db.name, this.factory);
  }
}

/** Creates missing stores and indexes while an upgrade transaction is active. */
function applySchema(
  db: IDBDatabase,
  transaction: IDBTransaction,
  stores: Record<string, StoreSchema>,
): void {
  for (const [name, schema] of Object.entries(stores)) {
    let store: IDBObjectStore;

    if (db.objectStoreNames.contains(name)) {
      store = transaction.objectStore(name);
    } else if (schema.type === 'kv') {
      store = db.createObjectStore(name);
    } else {
      if (!schema.keyPath && !schema.autoIncrement) {
        throw new PersistenceError(
          `Table store "${name}" needs a keyPath or autoIncrement`,
        );
      }
      store = db.createObjectStore(name, {
        keyPath: schema.keyPath,
        autoIncrement: schema.autoIncrement,
      });
    }

    if (schema.type === 'table') {
      for (const index of schema.indexes ?? []) {
        if (!store.indexNames.contains(index.name)) {
          store.createIndex(index.name, index.keyPath, {
            unique: index.unique,
            multiEntry: index.multiEntry,
          });
        }
      }
    }
  }
}

/**
 * Opens an IndexedDB database and applies the supplied store schema.
 * New stores and indexes are added on upgrade; existing data is preserved.
 */
export async function openPersistence(
  options: PersistenceOptions,
): Promise<Persistence> {
  const factory = options.factory ?? getDefaultFactory();
  const request =
    options.version === undefined
      ? factory.open(options.name)
      : factory.open(options.name, options.version);

  return new Promise((resolve, reject) => {
    let blocked = false;
    let upgradeError: unknown;

    request.onupgradeneeded = (event) => {
      const transaction = request.transaction;
      if (!transaction) return;
      try {
        applySchema(request.result, transaction, options.stores ?? {});
        options.onUpgrade?.(request.result, transaction, event.oldVersion);
      } catch (error) {
        upgradeError = error;
        transaction.abort();
      }
    };

    request.onblocked = () => {
      blocked = true;
      options.onBlocked?.();
      reject(
        new PersistenceError(
          `Opening database "${options.name}" is blocked by another connection`,
        ),
      );
    };

    request.onerror = () =>
      reject(
        upgradeError instanceof Error
          ? upgradeError
          : new PersistenceError(`Opening database "${options.name}" failed`, {
              cause: request.error,
            }),
      );

    request.onsuccess = () => {
      const db = request.result;
      if (blocked) {
        db.close();
        return;
      }
      resolve(new PersistenceImpl(db, factory));
    };
  });
}

/** Deletes an IndexedDB database by name. */
export async function deletePersistence(
  name: string,
  factory?: IDBFactory,
): Promise<void> {
  const actualFactory = factory ?? getDefaultFactory();
  return new Promise((resolve, reject) => {
    const request = actualFactory.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onblocked = () =>
      reject(
        new PersistenceError(
          `Deleting database "${name}" is blocked by another connection`,
        ),
      );
    request.onerror = () =>
      reject(
        new PersistenceError(`Deleting database "${name}" failed`, {
          cause: request.error,
        }),
      );
  });
}
