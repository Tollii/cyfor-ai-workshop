# Project skills

Reusable, project-local Copilot skills for the booking/resource-management delivery loop. Each skill lives in its own folder as `SKILL.md` and is usable by the main agent or a sub-agent.

```
pick issue → triage → plan → implement → open PR → review PR → human merges
```

| Skill | Stage | Writes to GitHub? | Summary |
| --- | --- | --- | --- |
| [`refine-issue`](refine-issue/SKILL.md) | before triage | yes (issue) | Turn a vague issue/requirement into an implementation-ready brief; asks targeted questions when ambiguous. |
| [`triage-issue`](triage-issue/SKILL.md) | triage | yes (issue comment) | Confirm scope/assumptions/acceptance criteria, assess risk, recommend ready / needs-refinement / blocked. |
| [`plan-implementation`](plan-implementation/SKILL.md) | plan + implement | yes (issue comment) | Write a short plan, **post it to the issue**, then **auto-start implementation when low-risk**, else pause for a human. |
| [`review-pr`](review-pr/SKILL.md) | review | yes (PR review) | Review the real PR for API/web sync, regenerated client, booking-domain validation, small correct diffs. |
| [`write-pr`](write-pr/SKILL.md) | open PR | yes (PR) | Branch, commit, push, and open a small PR that `Closes #<issue>`. |

## Control points

The loop keeps a human in charge of the important decisions. Triage, the plan, and the PR review are all posted back to GitHub so a human can inspect them. The deliberate exception is wired into `plan-implementation`: when an issue and its plan are unambiguous, small, and reversible (low-risk), it proceeds straight to implementation; anything needing product judgement, schema/migration work, or changes to booking/reservation business rules pauses for human approval.

## Conventions baked into the skills

- Keep diffs small enough to review in ~10 minutes; if not, split the work.
- API contract changes flow `api/src/app.ts` (+ `api/prisma/schema.prisma`) → `npm run generate` → re-typecheck/build. Never hand-edit `api/openapi.json` or `web/src/api/generated/hooks.ts`.
- Keep `api/` and `web/` in sync; preserve existing create/edit/remove behavior.
- Use `gh` so skills operate on real issues and PRs. See `AGENTS.md` for repo commands.
