# Task 1: Set up the repo and ship your first feature

In this task you will create all workshop issues in GitHub, give GitHub Copilot some repo-specific guidance, and implement a small feature in the booking/resource management app.

## Part 1: Create GitHub issues from the workshop tasks

Before starting the implementation work, use AI together with the `gh` CLI to turn the workshop tasks into GitHub issues.

Rules:

- read all files matching `workshop-tasks/task-*.md`
- create **one GitHub issue per part** in each task file
- create **all** of those issues up front, not just the ones from this file
- use clear issue titles
- keep the issue bodies intentionally lightweight and a bit open-ended
- include just enough context to understand the problem, but do not fully specify the solution
- leave room for later refinement into user stories and acceptance criteria
- create a workshop milestone and use it to group the issues
- add useful labels so progress is easy to scan in GitHub
- link each issue back to the source task file and part

Think of these issues as backlog seeds, not final implementation specs.

## Part 2: Create `AGENTS.md`

Create an `AGENTS.md` file in the repository root with short, practical instructions for GitHub Copilot working in this repo.

For this workshop, use `AGENTS.md` as the instruction file for the repository.

Include guidance such as:

- this is a booking/resource management system
- the API lives in `api/` and the frontend lives in `web/`
- use the existing npm scripts instead of inventing new tooling
- regenerate the API client after API/OpenAPI changes
- keep changes small and consistent with the current codebase

Keep it short and useful. Think of it as a cheat sheet for the agent.

## Part 3: Turn items into editable resources

The current app is still just a simple list of items. Evolve it so it feels more like the start of a booking/resource management product.

Implement a small but meaningful resource-management feature end-to-end.

### Requirements

- add a description field
- add a resource type or category field
- allow an existing resource to be edited after creation
- update the UI so it talks about resources instead of generic items
- show the extra resource information in the list view

### Notes

- keep the existing create and remove behavior working
- updated values should persist after a refresh
- choose sensible validation and naming based on the existing code style

## Done when

- there is one GitHub issue for every part in every `workshop-tasks/task-*.md` file
- the workshop issues are grouped in a milestone and labeled clearly enough to track progress
- `AGENTS.md` exists and contains repo-specific guidance
- users can create and edit a resource with a title, description, and type/category
- the updated resource information is visible in the UI and persists after refresh
- the project still builds and typechecks successfully
