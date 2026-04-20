# Cyfor workshop frontend

This frontend is a plain Vite + React single-page app wired to a local Orval-generated API client.

## Scripts

```bash
npm install
npm run generate
npm run dev
npm run typecheck
npm run build
```

## API wiring

- Dev requests default to `/api`, and Vite proxies that to `http://localhost:3000`
- Build-time override: set `VITE_API_BASE_URL=http://localhost:3000` if the built app should call the API on a different origin
- The local hooks live in `src/api` and are generated from `../api/openapi.json`
- `src/App.tsx` includes a minimal add/remove list example using the generated `useGetItems()`, `usePostItems()`, and `useDeleteItemsId()` hooks
