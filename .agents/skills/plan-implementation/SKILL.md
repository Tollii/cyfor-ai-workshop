---
name: plan-implementation
description: Use after an issue is triaged to produce a short implementation plan, post that plan back to the GitHub issue, and then decide whether to start coding automatically. If the issue and plan are low-risk and need no human input, begin implementation immediately; otherwise stop and wait for human approval. Second control point in the delivery loop.
---

# Plan implementation

Second control point in the delivery loop. Read the issue plus its triage, write a short implementation plan, **post the plan to the issue**, then gate on risk: auto-start low-risk work, otherwise hand back to a human.

Project: booking/resource-management monorepo — `api/` (Hono + Prisma + SQLite, contract in `api/src/app.ts`, schema in `api/prisma/schema.prisma`), `web/` (React + Vite, Orval client). Follow `AGENTS.md`.

## Inputs

```bash
gh issue view <number> --json number,title,body,labels,comments
```
Use the issue body and the most recent `triage-issue` comment as the source of truth. If there is no triage and the issue is non-trivial, run `triage-issue` first.

## Procedure

### 1. Write a short plan

Keep it to a small, reviewable change (target: a PR reviewable in under 10 minutes). Include:

- **Approach** — 1–3 sentences.
- **Steps / files to touch** — concrete paths, in order. For API-contract changes follow `AGENTS.md`: edit `api/src/app.ts` (and `api/prisma/schema.prisma` if needed) → `npm run generate` → re-typecheck/build. Do not hand-edit `api/openapi.json` or `web/src/api/generated/hooks.ts`.
- **Validation** — which checks you'll run (`npm run typecheck`, `npm run build`, scoped workspace builds, manual `npm run dev`).
- **Risk & rollback** — what could break (schema/migrations, booking overlap & status rules, API contract) and how to back out.
- **Out of scope** — explicit non-goals to prevent scope drift.

### 2. Post the plan to the issue

Always persist the plan on the issue so there is a control point and an audit trail:

```bash
gh issue comment <number> --body-file <plan.md>
```

### 3. Risk gate — decide whether to auto-start

Classify the plan as **LOW-RISK / auto-proceed** only if **all** are true:

- Acceptance criteria are clear and unambiguous; no open questions remain in the issue/triage.
- No new product decisions or business-rule judgement calls are required.
- The change is small and localized (roughly: a handful of files, no large refactor).
- No destructive or hard-to-reverse data work (no Prisma schema change that drops/renames columns or needs a manual migration; no bulk data mutation).
- It does not redefine core booking/reservation rules (overlap detection, status transitions `pending`/`confirmed`/`cancelled`).
- Standard validation (`typecheck` / `build`) can fully verify it.

Otherwise it is **NEEDS-HUMAN**.

State the decision explicitly at the end of the posted plan, e.g.
`Decision: LOW-RISK — proceeding to implement.` or
`Decision: NEEDS-HUMAN — pausing for approval because <reason>.`

### 4. Act on the decision

- **LOW-RISK →** begin implementation now, using the issue + triage + plan as the working context. Make the smallest correct change, keep `api/` and `web/` in sync, regenerate the client when the contract changes, then run the relevant `typecheck`/`build`. Hand off to `write-pr` when green. Stay strictly inside the planned scope — if you discover the work is bigger or riskier than planned, stop and re-classify as NEEDS-HUMAN.
- **NEEDS-HUMAN →** do **not** write code. Leave the plan on the issue, surface the specific questions/risks, and wait for a human to approve or adjust scope.

## Notes

- Usable by the main agent or a sub-agent.
- The bias is toward small, safe, reversible changes. When in doubt, classify as NEEDS-HUMAN.
