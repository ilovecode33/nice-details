import { createWriteRequest, getIndex, readStore, requestAsPromise } from './idb';
import type { TableStore } from './types';

/** IndexedDB-backed table store with a primary key and optional indexes. */
export class TableStoreImpl<T, K extends IDBValidKey = IDBValidKey>
  implements TableStore<T, K>
{
  constructor(
    private readonly db: IDBDatabase,
    private readonly storeName: string,
  ) {}

  async add(value: T): Promise<K> {
    return (await createWriteRequest(this.db, this.storeName, (store) =>
      store.add(value),
    )) as K;
  }

  async put(value: T): Promise<K> {
    return (await createWriteRequest(this.db, this.storeName, (store) =>
      store.put(value),
    )) as K;
  }

  async get(key: K): Promise<T | undefined> {
    const store = readStore(this.db, this.storeName);
    return (await requestAsPromise(store.get(key))) as T | undefined;
  }

  async delete(key: K): Promise<void> {
    await createWriteRequest(this.db, this.storeName, (store) => store.delete(key));
  }

  async clear(): Promise<void> {
    await createWriteRequest(this.db, this.storeName, (store) => store.clear());
  }

  async has(key: K): Promise<boolean> {
    const store = readStore(this.db, this.storeName);
    return (await requestAsPromise(store.getKey(key))) !== undefined;
  }

  async count(): Promise<number> {
    const store = readStore(this.db, this.storeName);
    return await requestAsPromise(store.count());
  }

  async getAll(
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number,
  ): Promise<T[]> {
    const store = readStore(this.db, this.storeName);
    return (await requestAsPromise(store.getAll(query, count))) as T[];
  }

  async getAllKeys(
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number,
  ): Promise<K[]> {
    const store = readStore(this.db, this.storeName);
    return (await requestAsPromise(store.getAllKeys(query, count))) as K[];
  }

  async getAllByIndex(
    index: string,
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number,
  ): Promise<T[]> {
    const store = readStore(this.db, this.storeName);
    return (await requestAsPromise(
      getIndex(store, index).getAll(query, count),
    )) as T[];
  }

  async countByIndex(
    index: string,
    query?: IDBValidKey | IDBKeyRange | null,
  ): Promise<number> {
    const store = readStore(this.db, this.storeName);
    return await requestAsPromise(
      getIndex(store, index).count(query ?? undefined),
    );
  }
}
