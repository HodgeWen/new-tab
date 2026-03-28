import { deleteDB, openDB } from "idb";

import type { NewTabDBSchema } from "@/types/db-schema";
import type { Group, Website } from "@/types/persistence";

const DB_NAME = "new-tab-db";
const DB_VERSION = 1;

type StoreName = "websites" | "groups";

let dbPromise: ReturnType<typeof openDB<NewTabDBSchema>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<NewTabDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const websites = db.createObjectStore("websites", { keyPath: "id" });
          websites.createIndex("by-groupId", "groupId");
          websites.createIndex("by-order", "order");
          const groups = db.createObjectStore("groups", { keyPath: "id" });
          groups.createIndex("by-order", "order");
        }
      },
    });
  }
  return dbPromise;
}

async function getAllStore<T extends Website | Group>(store: StoreName): Promise<T[]> {
  const db = await getDb();
  return db.getAll(store) as Promise<T[]>;
}

async function getStore<T extends Website | Group>(
  store: StoreName,
  id: string,
): Promise<T | undefined> {
  const db = await getDb();
  return db.get(store, id) as Promise<T | undefined>;
}

async function putStore<T extends Website | Group>(store: StoreName, value: T): Promise<void> {
  const db = await getDb();
  await db.put(store, value);
}

async function deleteStore(store: StoreName, id: string): Promise<void> {
  const db = await getDb();
  await db.delete(store, id);
}

export const websitesStore = {
  getAll: () => getAllStore<Website>("websites"),
  get: (id: string) => getStore<Website>("websites", id),
  put: (value: Website) => putStore("websites", value),
  delete: (id: string) => deleteStore("websites", id),
};

export const groupsStore = {
  getAll: () => getAllStore<Group>("groups"),
  get: (id: string) => getStore<Group>("groups", id),
  put: (value: Group) => putStore("groups", value),
  delete: (id: string) => deleteStore("groups", id),
};

export async function clearDbForTests(): Promise<void> {
  if (dbPromise) {
    try {
      (await dbPromise).close();
    } catch {
      /* ignore */
    }
    dbPromise = null;
  }
  await deleteDB(DB_NAME);
}
