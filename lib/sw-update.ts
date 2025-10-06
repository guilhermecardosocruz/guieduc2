export function setupSwAutoUpdate(intervalMs = 15000) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  (async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      setInterval(() => reg.update().catch(() => {}), intervalMs);
      reg.update().catch(() => {});
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!sessionStorage.getItem('__reloaded')) {
          sessionStorage.setItem('__reloaded', '1');
          location.reload();
        }
      });
    } catch {}
  })();
}
