# Boundary Framework Template

> Add this to the TOP of your CLAUDE.md, before any project context.
> Customize the specific rules per project, but keep the three-tier structure.

---

## Behavioral Boundaries

### ALWAYS (do these without asking)
- Run type-check and lint before every commit
- Commit after completing each discrete task (atomic commits)
- Create a session note in `docs/claude-sessions/` for any work spanning 30+ minutes
- Read the most recent session note at the start of a new session
- Follow patterns in `docs/patterns/` — match existing code style
- Check the active implementation plan before starting work

### ASK FIRST (pause and confirm before doing these)
- Adding new dependencies (npm packages, gems, pods, etc.)
- Modifying database schema, migrations, or data models
- Changing authentication or authorization flows
- Deviating from an approved implementation plan
- Creating new architectural patterns not in `docs/patterns/`
- Any destructive operation (deleting files, dropping tables, force-pushing)
- Modifying CI/CD, deployment, or infrastructure configuration
- Changes that affect other team members' work in progress

### NEVER (do not do these under any circumstances)
- Push to production or main branch without explicit approval
- Delete session notes, specs, or plan documents
- Modify environment variables or secrets
- Skip type-checking or linting to "save time"
- Make changes outside the scope of the current spec/plan
- Commit code that doesn't build
- Remove or weaken existing tests
- Hardcode secrets, API keys, or credentials

---

## Interface Contract Registry (Multi-Component Systems)

> Add this section for monorepos or distributed systems with cross-component interfaces.

All cross-component interface specifications live in `/docs/contracts/`:

| Contract | File | Components Affected |
|---|---|---|
| [Interface A] | `docs/contracts/[name].md` | [Component X], [Component Y] |

These are the **single source of truth**. Component docs should reference them, not duplicate them. See `templates/INTERFACE_CONTRACTS_TEMPLATE.md` for the full template.

## Cross-Component Decision Gates (Multi-Component Systems)

### Protocol/Interface Changes
1. Update the canonical contract spec in `/docs/contracts/` FIRST
2. Get approval from all affected component owners
3. Implement in dependency order: producer → bridge → consumer
4. Support both old and new formats during transition

### Coordinated Deployments
1. Document current versions of all components
2. Deploy in order of risk: server → firmware → client apps
3. Verify at each step before proceeding
4. See `/docs/DEPLOYMENT_RUNBOOK.md` for detailed procedures

---

## Customization Guide

**Per-project additions to ALWAYS:**
- TrashBlitz: "Use server actions only, no API routes"
- Simmons: "User runs builds — make code changes and let user verify"
- Foodtrails: "Database is single source of truth — never store derived data"
- Shuffle: "Use Convex patterns from docs/patterns/convex-patterns.md"

**Per-project additions to ASK FIRST:**
- TrashBlitz: "Adding non-shadcn UI libraries"
- Simmons: "Modifying MIDI protocol constants or ModuleType enum"
- Foodtrails: "Changes to the pipeline architecture"
- Shuffle: "Modifying OAuth flow or NetSuite API integration approach"

**Per-project additions to NEVER:**
- Simmons: "Attempt automated Xcode builds"
- Foodtrails: "Use em-dashes (—) anywhere in the codebase"
- TrashBlitz: "Use pure white (#FFFFFF) — always use design system colors"

---

## When Boundaries Conflict

If you encounter a situation where following one boundary would violate another (e.g., the plan says to modify the schema, but "Ask First" says to confirm schema changes), **Ask First takes precedence**. The safest action is always to pause and confirm.

If the user gives you a direct instruction that conflicts with a NEVER rule, flag it:
"This would violate the NEVER rule about [X]. Do you want me to proceed anyway?"
