---
name: planning-with-files
description: Use structured markdown files for planning complex tasks. Use when starting multi-step tasks, complex feature implementation, or when user asks to "plan with files", "create a plan file", or wants organized task tracking.
---

# Planning with Files

Use structured markdown files in the project workspace to plan, track progress, and organize complex multi-step work.

## Quick start

When starting any non-trivial task, create a `plan.md` (or use the session memory `/memories/session/`) with the task breakdown.

## Core Files

Create these files as needed in `/memories/session/` or the project root:

| File | Purpose |
|------|---------|
| `plan.md` | Overall task breakdown, checklist of todos |
| `research.md` | Findings from exploring the codebase, decisions made |
| `data-model.md` | Schema, types, interfaces discovered or designed |
| `quickstart.md` | Commands to build, run, test — copy-paste ready |
| `tasks.md` | Granular task list with status (todo/in-progress/done) |
| `notes.md` | Observations, gotchas, edge cases encountered |
| `api.md` | API endpoints, request/response shapes |

## Workflow

1. **Plan**: Read relevant files, create `plan.md` with todos
2. **Research**: Document findings in `research.md` before coding
3. **Execute**: Mark tasks `in-progress` → `completed` as you work
4. **Track**: Keep `quickstart.md` updated with working commands
5. **Wrap up**: Archive or clean up planning files when done

## Guidelines

- Keep files in `/memories/session/` for conversation-scoped plans
- Use `/memories/repo/` for project conventions that survive across sessions
- Read relevant plan files at the start of each conversation turn
- Update status in real-time — don't batch completions
- Prefer concise bullet points over prose
