# GUIEDUC2 — Next 15 + React 19 + TS + Tailwind + **PWA**
- Tema: primário branco, secundário azul (#0A66FF).
- Rotas: /login, /register, /recover, /dashboard, /offline
- PWA: `next-pwa` com `manifest.json` + ícones prontos, instalável no navegador.

## Dicas de segurança PWA
- Evite limpar `localStorage` ao atualizar a versão — prefira **migração**.
- `skipWaiting` está **false** para não tomar controle sem recarregar. Mude conscientemente.
- Em dev, se o cache “grudar”, rode: **Vercel/localhost** → DevTools → Application → Service Workers → *Unregister* + *Clear storage*.
