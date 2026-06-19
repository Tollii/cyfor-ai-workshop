---
name: triage-issue
description: Use to triage a GitHub issue before planning or implementation — confirm scope, assumptions, and acceptance criteria, assess risk and which parts of the system are affected, then post a concise triage result back to the issue. The first control point in the delivery loop (triage → plan → implement → PR → review → merge).
---

# Triage issue

First control point in the delivery loop. Read a GitHub issue, decide whether it is ready to plan, and post a concise triage comment back to GitHub. Project: booking/resource-management monorepo (`api/` Hono + Prisma + SQLite, `web/` React + Vite + Orval client).

## When to use

- An issue has been picked up and you need to confirm scope before planning.
- Usable by the main agent or a sub-agent; operate on the **real** issue via `gh`.

## Inputs

```bash
gh issue view <number> --json number,title,body,labels,assignees,comments
```

## Procedure

1. **Understand the ask.** Restate the issue in 1–2 sentences. If it is too vague to restate, recommend running `refine-issue` first and stop.
2. **Assess.** Produce a short triage with:
   - **Scope** — one paragraph of what is and isn't included.
   - **Affected areas** — `api/src/app.ts`, `api/prisma/schema.prisma`, generated client (`api/openapi.json` → `web/src/api/generated/hooks.ts`), `web/src/App.tsx`, docs/tests.
   - **Assumptions** worth confirming.
   - **Acceptance criteria** — tighten or add a testable checklist.
   - **Risk** — `low` / `medium` / `high`. Higher when it touches the Prisma schema/migrations, the API contract, booking/reservation business rules (overlap detection, status transitions), or when the expected diff is large.
   - **Open questions** that block planning.
   - **Recommendation** — `ready-to-plan`, `needs-refinement`, or `blocked`.
3. **Keep scope small.** If the issue can't be reviewed as a <10‑minute PR, recommend splitting it and say how.
4. **Post back to GitHub.** Always write the result to the issue so the human has a control point:
   ```bash
   gh issue comment <number> --body-file <triage.md>
   ```
   Optionally reflect status with labels, e.g.:
   ```bash
   gh issue edit <number> --add-label "api" --add-label "web"
   ```

## Output contract

A markdown triage comment with the headings above plus an explicit **Recommendation** and **Risk** line. Tighten the result before posting — do not rubber-stamp.
