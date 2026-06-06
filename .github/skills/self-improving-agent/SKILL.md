---
name: self-improving-agent
description: Self-reflection and continuous improvement loop. Agent reviews its own work, identifies mistakes, records lessons learned, and applies corrections. Use when user wants the agent to self-correct, learn from errors, improve over time, or mentions "self-improve", "self-evolve", "reflexion", "learn from mistakes".
---

# Self-Improving Agent

Enable the agent to reflect on its own output, detect errors, learn from them, and continuously improve within a session and across sessions via memory.

## Quick start

When asked to self-improve or when an error occurs:

1. **Detect**: Identify what went wrong (compile errors, logic bugs, user complaints)
2. **Diagnose**: Find the root cause
3. **Record**: Save the lesson to `/memories/session/lessons.md` or `/memories/`
4. **Fix**: Apply the correction
5. **Verify**: Confirm the fix works

## Core workflow

### On error
- Read error output (terminal, linter, user feedback)
- DO NOT guess — read affected files to understand context
- Apply targeted fix, not rewrites
- After fix, verify by running the relevant command

### On success
- Note what worked well in session memory
- Save reusable patterns to `/memories/` for future sessions

### Self-review checklist
After completing a task, silently check:
- [ ] Are there compile/lint errors?
- [ ] Did the fix introduce new problems?
- [ ] Is the code consistent with existing patterns?
- [ ] Could this be done simpler?

## Memory structure

| File | Purpose |
|------|---------|
| `/memories/session/lessons.md` | Mistakes, fixes, and learnings this session |
| `/memories/session/corrections.md` | Pending corrections to apply |
| `/memories/patterns.md` | Successful patterns for long-term reuse |
| `/memories/pitfalls.md` | Common mistakes to avoid across projects |

## Anti-patterns to avoid

- Rewriting large blocks when a small edit would suffice
- Not reading context before editing
- Making the same mistake twice without recording it
- Skipping verification after a fix
- Ignoring user corrections

## Recording format

In `lessons.md`, use this format:
```
## [Date] [Brief title]
- **Mistake**: What happened
- **Root cause**: Why it happened
- **Fix**: What was done
- **Prevention**: How to avoid in future
```
