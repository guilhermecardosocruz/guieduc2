import { db, type DBSchema } from './db';
type StoreName = keyof DBSchema;

export async function saveMany<T>(store: StoreName, items: T[], keyFn: (x:T)=>string) {
  const D = await db();
  const tx = D.transaction(store, 'readwrite');
  for (const it of items) await tx.store.put(it as any, keyFn(it));
  await tx.done;
}
export async function getAll<T>(store: StoreName): Promise<T[]> {
  const D = await db(); return (await D.getAll(store)) as any;
}
export async function putOne<T>(store: StoreName, key: string, value: T) {
  const D = await db(); await D.put(store, value as any, key);
}
export async function getOne<T>(store: StoreName, key: string): Promise<T | undefined> {
  const D = await db(); return (await D.get(store, key)) as any;
}
export async function enqueue(op:{method:'POST'|'PUT'|'DELETE'; url:string; body:any}) {
  const D = await db();
  const id = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
  await D.put('queue', { id, ts: Date.now(), ...op }, id);
}
export async function drainQueue() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  const D = await db();
  const all = await D.getAll('queue');
  for (const q of all.sort((a,b)=>a.ts-b.ts)) {
    try {
      const res = await fetch(q.url, {
        method: q.method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q.body)
      });
      if (res.ok) await D.delete('queue', q.id);
    } catch {}
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { drainQueue(); });
}
