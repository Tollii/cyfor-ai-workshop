# Skill: Review PR

Review a pull request in the cyfor-workshop repository. Use `gh` CLI to fetch the PR diff, comments, and changed files.

## Review checklist

### Correctness
- Are there obvious bugs, off-by-one errors, or unhandled edge cases?
- Do error paths return appropriate HTTP status codes and messages?
- Is input validation present and correct for the booking/resource domain (e.g. required fields, string lengths, valid categories)?

### API–frontend sync
- If API routes, request/response schemas, or the Prisma model changed, was `npm run generate` run to regenerate the OpenAPI spec and Orval hooks?
- Do the generated files in `web/src/api/generated/` match the current API spec in `api/openapi.json`?
- Does the frontend use the correct hook names and payload shapes for any new or changed endpoints?

### Schema and data
- Do Prisma schema changes match the Zod schemas in `api/src/app.ts`?
- Are new database fields given sensible defaults so existing data is not broken?
- Are `updatedAt` / `createdAt` fields handled correctly?

### Scope and style
- Is the change small and focused, or does it mix unrelated concerns?
- Does the code follow the existing patterns in the codebase (naming, file layout, error handling)?
- Are there leftover TODOs, commented-out code, or debug statements?

### Tests
- If behavior changed, were tests added or updated in `api/src/app.test.ts`?
- Do the tests cover both happy paths and validation/error cases?

### Security and performance
- Is user input validated before hitting the database?
- Are there any N+1 query patterns or unbounded list fetches?

## Output format

Summarize findings as:
1. **Blocking** — must fix before merge
2. **Suggestions** — improvements worth considering
3. **Nits** — style or minor issues

If the PR looks good, say so briefly and note any areas that were checked.
