import { PersistenceError } from './errors';
import { createWriteRequest, readStore, requestAsPromise } from './idb';
import type { KVStore } from './types';

/** IndexedDB-backed key-value store using out-of-line keys. */
export class KVStoreImpl<T> implements KVStore<T> {
  constructor(
    private readonly db: IDBDatabase,
    private readonly storeName: string,
  ) {}

  async get(key: IDBValidKey): Promise<T | undefined> {
    const store = readStore(this.db, this.storeName);
    return (await requestAsPromise(store.get(key))) as T | undefined;
  }

  async set(key: IDBValidKey, value: T): Promise<void> {
    await createWriteRequest(this.db, this.storeName, (store) => store.put(value, key));
  }

  async delete(key: IDBValidKey): Promise<void> {
    await createWriteRequest(this.db, this.storeName, (store) => store.delete(key));
  }

  async clear(): Promise<void> {
    await createWriteRequest(this.db, this.storeName, (store) => store.clear());
  }

  async has(key: IDBValidKey): Promise<boolean> {
    const store = readStore(this.db, this.storeName);
    return (await requestAsPromise(store.getKey(key))) !== undefined;
  }

  async count(): Promise<number> {
    const store = readStore(this.db, this.storeName);
    return await requestAsPromise(store.count());
  }

  async keys(): Promise<IDBValidKey[]> {
    const store = readStore(this.db, this.storeName);
    return await requestAsPromise(store.getAllKeys());
  }

  entries(): Promise<Array<[IDBValidKey, T]>> {
    const store = readStore(this.db, this.storeName);
    return new Promise((resolve, reject) => {
      const entries: Array<[IDBValidKey, T]> = [];
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(entries);
          return;
        }
        entries.push([cursor.key, cursor.value as T]);
        cursor.continue();
      };
      request.onerror = () =>
        reject(
          new PersistenceError('Reading key-value entries failed', {
            cause: request.error,
          }),
        );
    });
  }
}
