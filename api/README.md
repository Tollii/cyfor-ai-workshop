# Cyfor workshop API

```bash
npm install
npm run generate
npm run dev
```

```bash
open http://localhost:3000
```

OpenAPI is served at `http://localhost:3000/openapi.json` and generated into `api/openapi.json` for frontend codegen.

The dev and start scripts automatically run `prisma db push`, so the SQLite schema is recreated if `api/data/workshop.db` has been deleted before startup.

To reset workshop state:

```bash
rm api/data/workshop.db
npm run dev --workspace api
```

Running the root `npm run dev` command works the same way because it uses the same API startup script.

If a separately hosted frontend should call the API directly, set `CORS_ORIGIN` to a comma-separated list of allowed origins.
