# Agent Instructions

## What is this?

A booking/resource management system built as an npm workspaces monorepo.

- **`api/`** — REST API (Hono + Prisma + SQLite)
- **`web/`** — Frontend (React + Vite + TailwindCSS)

## Development commands

Use the existing npm scripts — do not introduce new tooling.

| Command | Purpose |
| --- | --- |
| `npm install` | Install all dependencies |
| `npm run dev` | Run API + web concurrently |
| `npm run dev:api` | API only (port 3000) |
| `npm run dev:web` | Web only (assumes API running) |
| `npm run build` | Build all workspaces |
| `npm run typecheck` | Type-check all workspaces |
| `npm run generate` | Regenerate Prisma client, OpenAPI spec, and Orval API client |
| `npm test` | Run tests across all workspaces |

## Key rules

- After any API or OpenAPI schema change, run `npm run generate` to regenerate the typed API client used by the frontend.
- Keep changes small and focused — match the style and patterns already in the codebase.
- The SQLite database (`api/data/workshop.db`) is auto-created on first run via `prisma db push`. Delete it to reset.
- Prisma schema lives at `api/prisma/schema.prisma`.
