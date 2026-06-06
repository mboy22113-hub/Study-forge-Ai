// Premium IndexedDB Database Manager for StudyForge AI
// Designed to securely store larger binary data, custom templates, and user states.
// Seamlessly falls back to localStorage if IndexedDB is blocked under iframe sandbox policies.

const DB_NAME = "studyforge_indexeddb";
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;
let useFallback = false;

// Initialize database
export async function initIndexedDB(): Promise<boolean> {
  if (typeof window === "undefined" || !window.indexedDB) {
    useFallback = true;
    return false;
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        // Create object stores for everything
        const stores = [
          "user_profile",
          "subjects",
          "study_plans",
          "flashcards",
          "focus_sessions",
          "achievements",
          "coach_messages",
          "pdf_files",
          "gallery_images",
          "prayer_days",
          "wakeup_logs",
          "goals",
          "notes",
          "quests"
        ];
        
        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id" });
          }
        });
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        resolve(true);
      };

      request.onerror = (e) => {
        console.warn("IndexedDB initialization blocked or failed. Activating high-performance LocalStorage fallback.", e);
        useFallback = true;
        resolve(false);
      };
    } catch (err) {
      console.warn("Error during IndexedDB sandbox setup. Opting for fallback storage.", err);
      useFallback = true;
      resolve(false);
    }
  });
}

// Utility to write to a store
export async function writeDbRecord<T extends { id: string | number }>(storeName: string, record: T): Promise<void> {
  if (useFallback || !dbInstance) {
    localStorage.setItem(`sf_db_${storeName}_${record.id}`, JSON.stringify(record));
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = dbInstance!.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e);
    } catch (err) {
      reject(err);
    }
  });
}

// Utility to read all records from a store
export async function readDbRecords<T>(storeName: string): Promise<T[]> {
  if (useFallback || !dbInstance) {
    const list: T[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`sf_db_${storeName}_`)) {
        const json = localStorage.getItem(key);
        if (json) {
          try { list.push(JSON.parse(json)); } catch (e) {}
        }
      }
    }
    return list;
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = dbInstance!.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = (e) => reject(e);
    } catch (err) {
      reject(err);
    }
  });
}

// Utility to delete a record
export async function deleteDbRecord(storeName: string, recordId: string | number): Promise<void> {
  if (useFallback || !dbInstance) {
    localStorage.removeItem(`sf_db_${storeName}_${recordId}`);
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = dbInstance!.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(recordId);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e);
    } catch (err) {
      reject(err);
    }
  });
}

// Purge store
export async function clearDbStore(storeName: string): Promise<void> {
  if (useFallback || !dbInstance) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`sf_db_${storeName}_`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = dbInstance!.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e);
    } catch (err) {
      reject(err);
    }
  });
}

// Bulk overwrite/restore of entire cache
export async function bulkOverwriteStore<T extends { id: string | number }>(storeName: string, records: T[]): Promise<void> {
  await clearDbStore(storeName);
  for (const rec of records) {
    await writeDbRecord(storeName, rec);
  }
}
