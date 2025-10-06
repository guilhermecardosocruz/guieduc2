export async function api<T=any>(url: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(url, {
    cache: 'no-store',
    ...init,
    next: { revalidate: 0 },
    headers: { ...(init.headers||{}), 'cache-control': 'no-store', ...(init.body ? {'content-type':'application/json'}:{} ) }
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
