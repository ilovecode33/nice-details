import { PersistenceError } from './errors';

/** Default IndexedDB factory, or a clear error when the environment lacks it. */
export function getDefaultFactory(): IDBFactory {
  if (typeof indexedDB === 'undefined') {
    throw new PersistenceError('IndexedDB is not available in this environment');
  }
  return indexedDB;
}

/** Resolves an IndexedDB request, wrapping request failures. */
export function requestAsPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new PersistenceError('IndexedDB request failed', { cause: request.error }));
  });
}

/** Resolves when a read-write transaction commits; rejects on error or abort. */
export function transactionAsPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(new PersistenceError('IndexedDB transaction failed', { cause: transaction.error }));
    transaction.onabort = () =>
      reject(new PersistenceError('IndexedDB transaction aborted', { cause: transaction.error }));
  });
}

/** Opens a read-only transaction and returns its object store. */
export function readStore(db: IDBDatabase, name: string): IDBObjectStore {
  try {
    return db.transaction(name, 'readonly').objectStore(name);
  } catch (error) {
    throw new PersistenceError(`Object store "${name}" is not available`, { cause: error });
  }
}

/** Opens a read-write transaction and returns it together with its object store. */
export function writeStore(
  db: IDBDatabase,
  name: string,
): { transaction: IDBTransaction; store: IDBObjectStore } {
  try {
    const transaction = db.transaction(name, 'readwrite');
    return { transaction, store: transaction.objectStore(name) };
  } catch (error) {
    throw new PersistenceError(`Object store "${name}" is not available`, { cause: error });
  }
}

/** Returns an index or throws a clear error when it is missing. */
export function getIndex(store: IDBObjectStore, name: string): IDBIndex {
  try {
    return store.index(name);
  } catch (error) {
    throw new PersistenceError(`Index "${name}" is not available`, { cause: error });
  }
}

/** Runs a write request and waits for the transaction to commit. */
export async function writeRequest<T>(
  store: IDBObjectStore,
  transaction: IDBTransaction,
  request: IDBRequest<T>,
): Promise<T> {
  const [result] = await Promise.all([
    requestAsPromise(request),
    transactionAsPromise(transaction),
  ]);
  return result;
}

/** Runs one write request in its own transaction and waits for the commit. */
export function createWriteRequest<T>(
  db: IDBDatabase,
  name: string,
  create: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const { transaction, store } = writeStore(db, name);
  return writeRequest(store, transaction, create(store));
}
