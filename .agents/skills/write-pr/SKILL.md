---
name: write-pr
description: Use to open a pull request for a completed, in-scope change — create a branch, commit, push, and open a GitHub PR with a useful description that references and closes the source issue. Keeps diffs small and the handoff clean before the review step.
---

# Write PR

Open a clean, small pull request for a change that is already implemented and validated. Project: booking/resource-management monorepo (`api/` + `web/`).

## Preconditions

- The change is complete and in scope, and the relevant checks pass:
  ```bash
  npm run typecheck
  npm run build
  ```
- If the API contract changed, the client was regenerated (`npm run generate`) and committed.

## Procedure

1. **Branch.** Work on a feature branch (not `main`), named for the change, e.g. `feat/status-filter-bookings` or `fix/reservation-overlap`.
   ```bash
   git checkout -b <branch>
   ```
2. **Commit.** Stage the real change only; keep the diff focused. Write a clear message.
   ```bash
   git add -A
   git commit -m "<concise summary>"
   ```
3. **Push.**
   ```bash
   git push -u origin <branch>
   ```
4. **Open the PR** with a description that references the issue so it auto-closes on merge:
   ```bash
   gh pr create --fill --base main \
     --title "<title>" \
     --body "Closes #<issue>. <what changed and why>. Validation: typecheck + build."
   ```

## PR description should include

- **Closes #<issue>** (or `Refs #<issue>` if it shouldn't auto-close).
- One short paragraph: what changed and why.
- **Areas touched** — `api/`, `web/`, generated client, schema.
- **How it was validated** — which checks were run.
- **Out of scope / follow-ups**, if any.

## Notes

- Keep the PR small enough to review in under ~10 minutes; if it isn't, split it.
- After opening, the PR is ready for `review-pr` and then human review. A human merges.
