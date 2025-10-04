import { db } from './db';

export async function saveMany<T>(store: string, items: T[], keyFn: (x:T)=>string) {
  const D = await db();
  const tx = D.transaction(store, 'readwrite');
  for (const it of items) await tx.store.put(it as any, keyFn(it));
  await tx.done;
}
export async function getAll<T>(store: string): Promise<T[]> {
  const D = await db();
  return (await D.getAll(store)) as any;
}
export async function putOne<T>(store: string, key: string, value: T) {
  const D = await db(); await D.put(store, value as any, key);
}
export async function getOne<T>(store: string, key: string): Promise<T | undefined> {
  const D = await db(); return (await D.get(store, key)) as any;
}

/** Enfileira mutações quando offline; será drenado quando voltar a conexão */
export async function enqueue(op:{method:'POST'|'PUT'|'DELETE'; url:string; body:any}) {
  const D = await db();
  const id = crypto.randomUUID();
  await D.put('queue', { id, ts: Date.now(), ...op }, id);
}

export async function drainQueue() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  const D = await db();
  const all = await D.getAll('queue');
  for (const q of all.sort((a,b)=>a.ts-b.ts)) {
    try {
      const res = await fetch(q.url, {
        method: q.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q.body)
      });
      if (res.ok) await D.delete('queue', q.id);
    } catch {
      // permanece na fila
    }
  }
}

// tenta drenar ao voltar a conexão
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { drainQueue(); });
}
