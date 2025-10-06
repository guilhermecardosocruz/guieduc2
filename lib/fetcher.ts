export async function getJSON<T=any>(url: string): Promise<T> {
  const res = await fetch(url, { cache:'no-store', next:{ revalidate:0 }, headers: { 'cache-control':'no-store' } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}
