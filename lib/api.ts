import { outboxPush } from '@/lib/offline';

export async function api<T=any>(url: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || 'GET').toUpperCase();
  const isWrite = method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE';

  const headers = { ...(init.headers as any) } as Record<string,string>;
  if (init.body && !headers['content-type']) headers['content-type'] = 'application/json';

  try {
    const r = await fetch(url, {
      cache: 'no-store',
      ...init,
      headers: { ...headers, 'cache-control': 'no-store' },
      next: { revalidate: 0 },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as T;
  } catch (err) {
    if (typeof window !== 'undefined' && isWrite) {
      await outboxPush({
        url,
        method,
        headers,
        body: init.body && typeof init.body !== 'string' ? JSON.parse(init.body as any) : (init.body as any),
      });
      // retorna resposta sintética amigável
      return { ok: true, queued: true } as any as T;
    }
    throw err;
  }
}
