/* eslint-disable no-var */
declare global { var __outbox_db: IDBDatabase | null; }
if (typeof window !== 'undefined' && !globalThis.__outbox_db) globalThis.__outbox_db = null;

type OutboxItem = {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  createdAt: number;
  tries: number;
};

const DB_NAME = 'guieduc2_offline';
const STORE = 'outbox';
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (globalThis.__outbox_db) return resolve(globalThis.__outbox_db);
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => { globalThis.__outbox_db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

export async function outboxPush(item: Omit<OutboxItem, 'id' | 'createdAt' | 'tries'>) {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readwrite');
  const id = crypto.randomUUID();
  const full: OutboxItem = { id, createdAt: Date.now(), tries: 0, ...item };
  await new Promise((res, rej) => {
    const r = tx.objectStore(STORE).add(full);
    r.onsuccess = () => res(null);
    r.onerror = () => rej(r.error);
  });
  await new Promise((res, rej) => { tx.oncomplete = () => res(null); tx.onerror = () => rej(tx.error); });
  return id;
}

async function outboxAll(): Promise<OutboxItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const items: OutboxItem[] = [];
    const r = tx.objectStore(STORE).openCursor();
    r.onsuccess = (ev: any) => {
      const cursor: IDBCursorWithValue | null = ev.target.result;
      if (cursor) { items.push(cursor.value as OutboxItem); cursor.continue(); }
      else resolve(items);
    };
    r.onerror = () => reject(r.error);
  });
}

async function outboxDelete(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readwrite');
  await new Promise((res, rej) => {
    const r = tx.objectStore(STORE).delete(id);
    r.onsuccess = () => res(null);
    r.onerror = () => rej(r.error);
  });
  await new Promise((res, rej) => { tx.oncomplete = () => res(null); tx.onerror = () => rej(tx.error); });
}

export async function flushOutboxOnce() {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  const items = await outboxAll();
  for (const it of items) {
    try {
      const r = await fetch(it.url, {
        method: it.method,
        headers: it.headers,
        body: it.body ? (typeof it.body === 'string' ? it.body : JSON.stringify(it.body)) : undefined,
        cache: 'no-store',
      });
      if (r.ok) {
        await outboxDelete(it.id);
      } else {
        // backoff leve
        await new Promise(res => setTimeout(res, Math.min(1000 * (1 + it.tries), 10000)));
      }
    } catch {
      // permanece no outbox
    }
  }
}

let started = false;
export function startOutboxAutoFlush() {
  if (typeof window === 'undefined') return;
  if (started) return;
  started = true;

  const tick = async () => { try { await flushOutboxOnce(); } catch {} };
  window.addEventListener('online', tick);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tick(); });
  // timer leve
  setInterval(tick, 15000);
  // primeiro disparo
  tick();
}
