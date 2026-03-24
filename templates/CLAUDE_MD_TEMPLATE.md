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

### ASK FIRST
- [Adding new dependencies]
- [Changing shared interfaces, APIs, or contracts]
- [Modifying auth/security flows]
- [Architectural pattern changes]
- [Deploying to production]
- [Deviating from an approved spec or plan]

### NEVER
- [Hardcode secrets, API keys, or credentials]
- [Skip type-checking or linting]
- [Modify files outside scope of current spec]
- [Push to main without approval]
- [Remove or weaken existing tests]

---

## Architecture

```
project/
├── src/             # Source code
├── tests/           # Test suite
├── docs/
│   ├── briefs/      # Feature briefs (big picture from interviews)
│   ├── specs/       # Atomic specs (small, self-contained, executable)
│   ├── contracts/   # Interface contracts
│   ├── decisions/   # Decision records
│   └── discoveries/ # Gotchas and surprises from implementation
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

### Feature Development Flow

```
/new-feature → Interview → Feature Brief → /decompose → Atomic Specs
→ Execute (worktrees) → Discoveries → Merge → External Scenarios → PR
```

1. Run `/new-feature` — Claude interviews you, produces a Feature Brief
2. Run `/decompose` — breaks the brief into atomic specs
3. Execute each spec in a fresh session (or parallel worktrees)
4. Run `/session-end` after each spec — captures discoveries, verifies, commits
5. PR includes the spec + any DISCOVERIES.md

---

## Common Gotchas

1. [Platform/framework-specific pitfall and how to handle it]
2. [Non-obvious constraint that trips up new sessions]

> This section grows from DISCOVERIES.md files. When a discovery recurs or is broadly relevant, promote it here.

---

## Template Usage Notes

**Required sections:** Behavioral Boundaries, Architecture, Key Files, Development Workflow
**Optional sections:** Common Gotchas (include if the project has non-obvious pitfalls)
**Scale to complexity:** A simple project might have 50 lines; a complex system might have 200+
**Key principle:** Every section should be ACTIONABLE — things an agent can use to make decisions, not just background reading
**Knowledge flow:** Discoveries → repeated discoveries get promoted to Common Gotchas → gotchas that represent rules get promoted to Behavioral Boundaries
