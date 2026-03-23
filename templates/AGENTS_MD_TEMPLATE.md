# AGENTS.md Template

> Copy this template for projects using Codex, Gemini, or multi-agent harnesses.
> AGENTS.md is the equivalent of CLAUDE.md but for non-Claude agents.
> Keep it concise — agents load this into limited context windows.

---

# [Project Name]

**Component:** [What this is]

## Behavioral Boundaries

> See also: [/BOUNDARY_FRAMEWORK.md](./BOUNDARY_FRAMEWORK.md) for system-wide boundaries (monorepos only).

### ALWAYS
- [Concise version of each rule — one line max]
- [Commit messages use `verb: concise message`]
- [Reference contracts/specs at [path]]

### ASK FIRST
- [Cross-component changes]
- [Adding dependencies]
- [Deploying to production]

### NEVER
- [Hardcode secrets]
- [Modify [read-only resource]]
- [Skip tests]

## Architecture

```text
[Compact directory tree]
```

[One paragraph architecture summary]

## Key Files

| File | Purpose |
|------|---------|
| `[path]` | [Brief description] |

## Development

```bash
[Build command]
[Test command]
[Deploy command]
```

## Session Documentation

Check `docs/claude-sessions/` before deep work. Create new notes under `docs/claude-sessions/YYYY-MM-DD-<topic>.md`.

---

## Template Usage Notes

**Difference from CLAUDE.md:** AGENTS.md should be ~50% shorter. Strip detailed explanations, keep actionable rules. Agents consuming this file have smaller context windows.
**Key principle:** If an agent can't act on it in 3 seconds of reading, it's too verbose for AGENTS.md.
