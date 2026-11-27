/** A secondary index on a table store. */
export interface IndexSchema {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

/** A key-value object store: out-of-line keys, one value per key. */
export interface KVStoreSchema {
  type: 'kv';
}

/** A table object store: records with a primary key and optional indexes. */
export interface TableStoreSchema {
  type: 'table';
  keyPath?: string | string[];
  autoIncrement?: boolean;
  indexes?: IndexSchema[];
}

/** One object store definition inside a persistence database. */
export type StoreSchema = KVStoreSchema | TableStoreSchema;

/** Options for opening a persistence database. */
export interface PersistenceOptions {
  /** Database name passed to IndexedDB. */
  name: string;
  /**
   * Database version. Omit to open the current version (or version 1 for a
   * new database); pass a higher value together with the new stores/indexes
   * to run an upgrade.
   */
  version?: number;
  /** Object stores and indexes to create or add during an upgrade. */
  stores?: Record<string, StoreSchema>;
  /** Inject an IDBFactory for tests or non-browser runtimes. */
  factory?: IDBFactory;
  /** Called when another connection blocks an upgrade or deletion. */
  onBlocked?: () => void;
  /** Runs after the built-in schema application during an upgrade. */
  onUpgrade?: (
    db: IDBDatabase,
    transaction: IDBTransaction,
    oldVersion: number,
  ) => void;
}

/** Typed key-value view over one IndexedDB object store. */
export interface KVStore<T = unknown> {
  get(key: IDBValidKey): Promise<T | undefined>;
  set(key: IDBValidKey, value: T): Promise<void>;
  delete(key: IDBValidKey): Promise<void>;
  clear(): Promise<void>;
  has(key: IDBValidKey): Promise<boolean>;
  count(): Promise<number>;
  keys(): Promise<IDBValidKey[]>;
  entries(): Promise<Array<[IDBValidKey, T]>>;
}

/** Typed table view over one IndexedDB object store. */
export interface TableStore<T = unknown, K extends IDBValidKey = IDBValidKey> {
  add(value: T): Promise<K>;
  put(value: T): Promise<K>;
  get(key: K): Promise<T | undefined>;
  delete(key: K): Promise<void>;
  clear(): Promise<void>;
  has(key: K): Promise<boolean>;
  count(): Promise<number>;
  getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<T[]>;
  getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<K[]>;
  getAllByIndex(
    index: string,
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number,
  ): Promise<T[]>;
  countByIndex(index: string, query?: IDBValidKey | IDBKeyRange | null): Promise<number>;
}

/** An open persistence database. */
export interface Persistence {
  readonly name: string;
  readonly version: number;
  kv<T = unknown>(storeName: string): KVStore<T>;
  table<T = unknown, K extends IDBValidKey = IDBValidKey>(
    storeName: string,
  ): TableStore<T, K>;
  close(): void;
  destroy(): Promise<void>;
}
