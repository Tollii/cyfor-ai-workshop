---
name: ship
description: Use to drive a GitHub issue through the full semi-autonomous delivery loop — pick → refine → triage → plan → implement → open PR → review PR → hand to human for merge. This is the orchestrator: it delegates each stage to a sub-agent running the matching stage skill, passes GitHub context between stages, and stops at human control points. Use when asked to "ship", "run the loop", or take an issue end-to-end.
---

# Ship (orchestrator)

Run an issue through the delivery loop for this booking/resource-management repo (`api/` Hono + Prisma + SQLite, `web/` React + Vite + Orval). You are the **orchestrator**: you pick the issue, dispatch each stage to a **sub-agent** running the relevant skill, pass along the current GitHub context, collect the result, and let a human approve the next step. You do little of the stage work yourself.

```
pick → refine → triage → plan → implement → open PR → review PR → human merges
```

## Core rules

- **One sub-agent per stage.** Spawn a dedicated sub-agent for each stage and tell it which skill to use. This keeps your context clean and lets stages run independently. The stage skills are written to be sub-agent–usable.
- **Skills own their GitHub writes — not you.** Each stage skill posts its own output to GitHub (refined brief → issue, triage → issue comment, plan → issue comment, review → PR review). The orchestrator only passes context (issue number, branch, PR number) and collects results; it does not re-post that content itself.
- **Honor the control points.** Triage, plan, and PR review are checkpoints. Surface each result to the human and pause when human input is needed. A human always presses merge.
- **Keep the diff small.** If a stage reveals the change is too big to review in ~10 minutes, stop and split the issue.
- **Use parallel sub-agents only when work is genuinely independent** (e.g. a docs/lookup task alongside coding, or splitting clearly separate `api/` and `web/` work). Otherwise keep stages sequential — each one depends on the previous result.

## Procedure

### 0. Pick the issue
```bash
gh issue list --state open --json number,title,labels
gh issue view <number> --json number,title,body,labels,assignees,comments
gh issue edit <number> --add-assignee @me
```
Confirm the issue is a sensible ~30‑minute unit of work before starting.

### 1. Refine (only if vague)
If the issue is a one-liner or ambiguous, dispatch a sub-agent with the **`refine-issue`** skill to turn it into an implementation-ready brief and write it back to the issue. If it asks the human questions, **pause** until they're answered.
*Skip this stage when the issue already has clear acceptance criteria.*

### 2. Triage
Dispatch a sub-agent with the **`triage-issue`** skill. It confirms scope/assumptions/acceptance criteria, assesses risk, and posts a concise triage comment to the issue. Review and tighten the result, then present it as a human control point.

### 3. Plan (+ implement gate)
Dispatch a sub-agent with the **`plan-implementation`** skill, passing the issue + triage. It writes a short plan, **posts it to the issue**, and classifies the work:
- **LOW-RISK →** it may proceed to implement automatically.
- **NEEDS-HUMAN →** it stops; you surface the plan/questions and **wait for approval**.
Respect that decision — do not override a NEEDS-HUMAN gate without human sign-off.

### 4. Implement
With an approved (or low-risk auto-approved) plan, run implementation using the issue + triage + plan as the source of truth:
- Prefer a sub-agent (or sub-agents) for the actual edits so your context stays orchestration-focused.
- Split into parallel sub-agents **only** when the work cleanly separates (e.g. independent `api/` and `web/` slices); otherwise one sub-agent, sequentially.
- Keep `api/` and `web/` in sync; for contract changes follow `AGENTS.md` (`api/src/app.ts`/`schema.prisma` → `npm run generate` → re-typecheck/build). Never hand-edit `api/openapi.json` or `web/src/api/generated/hooks.ts`.
- Stay strictly inside planned scope. If it grows, stop and re-triage.
- Validate: `npm run typecheck` and `npm run build` (scoped where appropriate).

### 5. Open PR
Dispatch a sub-agent with the **`write-pr`** skill to branch, commit, push, and open a PR whose description `Closes #<issue>`.

### 6. Review PR
Dispatch a sub-agent with the **`review-pr`** skill against the **real** PR. It posts an AI review to the PR. Treat it as input, not truth.

### 7. Human review + merge
Present the AI review alongside the diff for a human pass. **Do not merge.** A human compares the reviews, fixes anything important, and presses merge.

## Output

Keep a short running status of where the issue is in the loop (current stage, last sub-agent result, next control point). Reference issue/PR numbers so every artifact is traceable on GitHub.
