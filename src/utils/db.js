import { openDB } from "idb";

export const db = await openDB("ems-db", 1, {
  upgrade(db) {
    db.createObjectStore("companies", { keyPath: "id" });
    db.createObjectStore("departments", { keyPath: "id" });
  },
});

export async function saveToCache(storeName, data) {
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  await store.clear();
  for (const item of data) {
    await store.put(item);
  }
  await tx.done;
}

export async function getFromCache(storeName) {
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  return await store.getAll();
}
