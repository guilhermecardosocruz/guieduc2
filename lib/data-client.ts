type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
const OUTBOX_KEY = "guieduc2.outbox";

function enqueueOutbox(entry: any) {
  const arr = JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
  arr.push({ ...entry, _ts: Date.now() });
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(arr));
}

export async function serverFetch<T = any>(url: string, opts?: RequestInit & { method?: Method }) {
  const method = (opts?.method || "GET").toUpperCase() as Method;
  const isMutation = ["POST","PUT","PATCH","DELETE"].includes(method);

  try {
    const res = await fetch(url, {
      ...opts,
      headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (isMutation) {
      // Se falhou (offline, timeout…), registra na outbox para reenvio
      try {
        enqueueOutbox({ url, method, body: opts?.body ?? null, headers: opts?.headers ?? {} });
        console.warn("[outbox] enfileirada:", url, method);
      } catch {}
    }
    throw err;
  }
}

// Utilitário para drenar a outbox manualmente (além do SW Background Sync)
export async function flushOutbox() {
  const arr = JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
  const next: any[] = [];
  for (const it of arr) {
    try {
      await fetch(it.url, { method: it.method, body: it.body, headers: it.headers });
    } catch {
      next.push(it); // mantém se ainda falhou
    }
  }
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(next));
  return { ok: next.length === 0, pending: next.length };
}
