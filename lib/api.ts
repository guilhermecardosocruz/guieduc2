type Job = { url: string; init: RequestInit };

const QUEUE_KEY = '__api_queue_v1';

function loadQueue(): Job[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}
function saveQueue(q: Job[]) { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); }

async function tryFlush() {
  if (typeof window === 'undefined') return;
  if (!navigator.onLine) return;
  const q = loadQueue();
  const rest: Job[] = [];
  for (const job of q) {
    try {
      const res = await fetch(job.url, { cache: 'no-store', ...job.init, headers: { ...(job.init.headers||{}), 'cache-control':'no-store' } });
      if (!res.ok) throw new Error('bad status');
    } catch { rest.push(job); }
  }
  saveQueue(rest);
}

export async function api<T=any>(url: string, init: RequestInit = {}): Promise<T> {
  try {
    const r = await fetch(url, { cache:'no-store', ...init, headers: { ...(init.headers||{}), 'cache-control':'no-store' }, next: { revalidate: 0 } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  } catch (e) {
    if (typeof window !== 'undefined') {
      const body = init.body && typeof init.body !== 'string' ? JSON.stringify(init.body) : (init.body as any);
      const job: Job = { url, init: { ...init, body } };
      const q = loadQueue(); q.push(job); saveQueue(q);
      window.addEventListener('online', () => { tryFlush(); }, { once: true });
    }
    throw e;
  }
}

export function startQueueAutoFlush(intervalMs = 8000) {
  if (typeof window === 'undefined') return;
  setInterval(tryFlush, intervalMs);
  window.addEventListener('online', tryFlush);
  tryFlush();
}
