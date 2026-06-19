---
name: refine-issue
description: Use when a GitHub issue or requirement is vague, lightweight, or "just a sentence" and needs to become an implementation-ready brief before any planning or coding. Turns fuzzy asks into a problem statement, user story, acceptance criteria, business rules, assumptions, non-goals, and impacted areas — asking targeted questions first when the issue is ambiguous.
---

# Refine issue

Turn a lightweight GitHub issue or vague requirement into an implementation-ready brief for this booking/resource-management repo (`api/` Hono + Prisma + SQLite, `web/` React + Vite + Orval client).

## When to use

- An issue is a one-liner, a vague goal, or missing acceptance criteria.
- Before `triage-issue` / `plan-implementation` when the problem itself is unclear.

## Inputs

- An issue number/URL, or a raw requirement string.
- Read the issue first:
  ```bash
  gh issue view <number> --json number,title,body,labels,comments
  ```

## Procedure

1. **Read and restate.** Summarise the ask in one or two sentences. If you cannot, the issue is too vague — go to step 2.
2. **Clarify before locking scope.** If anything material is ambiguous, ask the user a *small number* of targeted questions (like plan mode) instead of guessing. Focus on the choices that change the implementation:
   - what exactly is being built / changed, and for whom
   - what "done" looks like
   - hidden business rules and edge cases (esp. around resources and reservations: overlaps, statuses `pending`/`confirmed`/`cancelled`, validation)
   - which surfaces are in scope (`api/`, `web/`, generated client, database/schema, docs)
   - Do **not** invent specificity the user did not ask for. Preserve intentional vagueness as explicit open questions.
3. **Write the brief.** Produce a short, concrete brief containing:
   - **Problem statement** (1–3 sentences)
   - **User / role affected**
   - **User story** ("As a … I want … so that …")
   - **Acceptance criteria** (checklist, testable)
   - **Business rules** (e.g. booking/resource constraints)
   - **Assumptions**
   - **Non-goals**
   - **Edge cases / validation rules**
   - **Impacted parts** — call out `api/src/app.ts`, `api/prisma/schema.prisma`, generated client (`api/openapi.json` → `web/src/api/generated/hooks.ts`), `web/src/App.tsx`, tests
   - **Open follow-up questions** (anything still genuinely undecided)
4. **Write back to GitHub.** Persist the brief on the issue so it is the shared source of truth:
   ```bash
   gh issue edit <number> --body-file <brief.md>      # replace/augment the body, or
   gh issue comment <number> --body-file <brief.md>   # add as a refinement comment
   ```
   Prefer editing the body when the issue was essentially empty; comment when there is history worth keeping.

## Output contract

A markdown brief with the headings above. Keep it tight — the goal is to make a vague issue actionable, not to produce a giant template. Leave room for later refinement where the workshop intends ambiguity.
