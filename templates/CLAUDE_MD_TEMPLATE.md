# CLAUDE.md Template

> Copy this template to a project's root CLAUDE.md. Customize each section.
> For monorepos, each component gets its own CLAUDE.md referencing the root.

---

# [Project Name]

**Component:** [What this is] | **Updated:** YYYY-MM-DD

---

## Behavioral Boundaries

> See also: [/BOUNDARY_FRAMEWORK.md](./BOUNDARY_FRAMEWORK.md) for system-wide boundaries (monorepos only).

### ALWAYS
- [Run tests/type-check/lint before committing]
- [Commit style: `verb: concise message`]
- [Reference canonical specs/contracts when touching interfaces]
- [Read this CLAUDE.md before making changes]
- [Create session notes for non-trivial work]

### ASK FIRST
- [Adding new dependencies]
- [Changing shared interfaces, APIs, or contracts]
- [Modifying auth/security flows]
- [Architectural pattern changes]
- [Deploying to production]
- [Deviating from an approved implementation plan]

### NEVER
- [Hardcode secrets, API keys, or credentials]
- [Skip type-checking or linting]
- [Modify files outside scope of current spec/plan]
- [Push to main without approval]
- [Remove or weaken existing tests]

---

## Architecture

```
project/
├── src/             # Source code
├── tests/           # Test suite
├── docs/            # Documentation
│   ├── claude-sessions/  # Session notes
│   └── plans/            # Design specs and implementation plans
└── scripts/         # Build/deploy scripts
```

[Brief architecture description — components, data flow, key patterns]

---

## Key Files

| File | Purpose |
|------|---------|
| `[path]` | [Description — single source of truth for X] |
| `[path]` | [Description] |

---

## Development Workflow

### Build & Run
```bash
[exact commands]
```

### Test
```bash
[exact commands]
```

### Deploy
```bash
[exact commands with verification steps]
```

---

## Common Gotchas

1. [Platform/framework-specific pitfall and how to handle it]
2. [Non-obvious constraint that trips up new sessions]

---

## Session Documentation

Session notes go in `docs/claude-sessions/YYYY-MM-DD-<topic>.md`. Check these before starting work — they capture decisions, investigations, and context that may not be obvious from the code.

---

## Template Usage Notes

**Required sections:** Behavioral Boundaries, Architecture, Key Files, Development Workflow
**Optional sections:** Common Gotchas (include if the project has non-obvious pitfalls)
**Scale to complexity:** A simple project might have 50 lines; a complex system might have 200+
**Key principle:** Every section should be ACTIONABLE — things an agent can use to make decisions, not just background reading
