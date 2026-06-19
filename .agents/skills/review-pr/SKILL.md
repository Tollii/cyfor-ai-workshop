---
name: review-pr
description: Use to review a real GitHub pull request in this repo against project-specific standards — API/frontend sync, regenerated client/derived files, booking/resource-management validation rules, small and correct diffs, and obvious bugs or risky assumptions. Reviews the actual PR via gh (not a pasted diff) and posts the review back to GitHub. The AI review pass before a human review.
---

# Review PR

Review a **real** GitHub pull request against this project's standards and post the result back to GitHub. This is the AI pass; a human still reviews afterward — the two are complementary, not substitutes.

Project: booking/resource-management monorepo — `api/` (Hono + Prisma + SQLite), `web/` (React + Vite, Orval-generated client).

## Inputs — read the real PR

```bash
gh pr view <number> --json number,title,body,headRefName,baseRefName,files,additions,deletions
gh pr diff <number>
```
Review the actual diff and changed files, not a description of them.

## What to check

1. **Scope & size.** Is the diff small enough to review comfortably (the loop's ~10‑minute rule)? Flag scope drift and unrelated changes.
2. **API ↔ frontend sync.** If the API contract changed (`api/src/app.ts`, routes/schemas), is `web/` updated to match?
3. **Generated / derived files.** If the contract changed, was `npm run generate` run so `api/openapi.json` and `web/src/api/generated/hooks.ts` are regenerated and consistent? Generated files should be regenerated, never hand-edited.
4. **Schema changes.** Any `api/prisma/schema.prisma` change handled correctly (client regenerated, data implications considered)?
5. **Domain validation.** Does validation match the booking/resource domain — resource fields (`title`/`description`/`type`), reservation rules (start/end ordering, overlap detection against active reservations, status transitions `pending`/`confirmed`/`cancelled`)? Call out missing edge cases.
6. **Correctness.** Obvious bugs, missing error handling (404/400/409 paths), risky assumptions, anything that breaks existing create/edit/remove behavior.
7. **Consistency.** Matches existing code style and uses existing npm scripts rather than new tooling.
8. **Verification.** Did the author run `npm run typecheck` / `npm run build`? Note anything you couldn't verify.

## Output

Write a concise review: a short summary, then findings grouped as **Blocking**, **Should fix**, and **Nits**, each with file/line and a concrete suggestion. Be specific and signal-rich; skip style nitpicking the tooling already covers. End with an explicit verdict: **Approve**, **Approve with comments**, or **Request changes**.

Post it to the PR:

```bash
gh pr review <number> --comment --body-file <review.md>
# or, when warranted:
gh pr review <number> --request-changes --body-file <review.md>
gh pr review <number> --approve --body-file <review.md>
```

## Notes

- Usable by the main agent or a sub-agent.
- AI review comments are **input, not truth** — present them so a human can judge. Never recommend weakening tests or lowering quality just to make CI pass.
