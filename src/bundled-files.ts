// Bundled file contents — embedded at build time since tsup bundles everything
// and we can't read files from the package at runtime.

export const SKILLS: Record<string, string> = {
  'joysmith.md': `---
name: joysmith
description: Assess your project's AI development harness — detect state, score dimensions, recommend upgrades
---

# Joysmith — Project Harness Assessment

You are evaluating this project's AI development harness. Follow these steps precisely.

## Step 1: Detect Harness State

Check the following and note what exists:

1. **CLAUDE.md** — Read it if it exists. Check whether it contains meaningful content (not just a project name or generic README).
2. **Key directories** — Check for: \`docs/specs/\`, \`docs/briefs/\`, \`docs/discoveries/\`, \`docs/templates/\`, \`.claude/skills/\`
3. **Boundary framework** — Look for \`Always\`, \`Ask First\`, and \`Never\` sections in CLAUDE.md (or similar behavioral constraints).
4. **Skills infrastructure** — Check \`.claude/skills/\` for installed skill files.
5. **Test configuration** — Look for test commands in package.json, pyproject.toml, Cargo.toml, Makefile, or CI config files.

## Step 2: Classify and Route

Based on what you found, classify the project into one of three states:

### State A: No Harness
**Trigger:** No CLAUDE.md, OR CLAUDE.md exists but has no behavioral boundaries, no spec references, and no structured sections.

**Action:** Tell the user:
- Their project has no AI development harness (or a minimal one)
- Recommend running \`npx joysmith init\` to scaffold one
- Briefly explain what Joysmith will set up: CLAUDE.md with boundaries, spec/brief templates, skills, and documentation structure
- Stop here — do not run the full assessment

### State B: Partial Harness
**Trigger:** CLAUDE.md exists with some structured content (boundaries, commands, or architecture), but not all 7 dimensions score 3.5 or above.

**Action:**
- Tell the user you've detected a partial harness and will run a detailed assessment
- Invoke the detailed assessment by running \`/joysmith-assess\`

### State C: Full Harness
**Trigger:** All of the following are true:
- CLAUDE.md has Always/Ask First/Never boundaries
- \`docs/specs/\` exists and contains spec files
- \`docs/briefs/\` exists
- \`.claude/skills/\` exists with skill files
- Test commands are configured
- Documentation structure is in place
- Knowledge capture mechanism exists (docs/discoveries/ or similar)

**Action:** Tell the user:
- Their project harness is solid across all dimensions
- Provide a quick summary of what's well-configured
- Offer to start work: "Your harness is ready. What would you like to work on? You can use \`/new-feature\` to start a new feature, or \`/decompose\` to break down a large task."

## Quick Scoring Rubric (for routing decisions)

Use these presence checks to quickly estimate scores. You do NOT need to do deep analysis here — that's what \`/joysmith-assess\` is for.

| Dimension | Score 1 (None) | Score 3 (Partial) | Score 5 (Complete) |
|-----------|---------------|-------------------|-------------------|
| Spec Quality | No specs directory | Specs exist but informal | Atomic specs with acceptance criteria |
| Spec Granularity | N/A | Large multi-session specs | Each spec fits one session |
| Behavioral Boundaries | No CLAUDE.md | CLAUDE.md without boundaries | Always/Ask First/Never sections |
| Skills & Hooks | No .claude/ directory | .claude/ exists, few skills | Multiple skills, hooks configured |
| Documentation | No docs/ directory | docs/ exists with some content | Structured docs/ with templates |
| Knowledge Capture | No discovery tracking | Ad-hoc notes | Structured discoveries directory |
| Testing & Validation | No test config | Tests exist, no CI | Tests + CI + validation commands in CLAUDE.md |

If the average quick score is 3.5 or above, classify as State C. Otherwise, classify as State B.

## Edge Cases

- **Not a git repo:** Note this to the user. Joysmith works best in a git repository. Recommend initializing one first.
- **CLAUDE.md is just a README:** Treat as State A — the file exists but isn't a harness.
- **Non-Joysmith skills already installed:** Acknowledge them. Do not suggest replacing them — suggest Joysmith skills as additions.
- **Monorepo:** Assess the root CLAUDE.md. Note if component-level CLAUDE.md files exist in subdirectories.`,

  'joysmith-assess.md': `---
name: joysmith-assess
description: Deep assessment of project harness quality — score 7 dimensions with evidence and upgrade plan
---

# Joysmith — Detailed Harness Assessment

You are performing a deep assessment of this project's AI development harness. Score each of the 7 dimensions below on a 1-5 scale, with specific evidence and recommendations.

## Instructions

1. Read CLAUDE.md thoroughly
2. Explore the project structure: check docs/, .claude/, test config, CI config
3. Score each dimension using the rubrics below
4. Write the full assessment to \`docs/joysmith-assessment.md\`
5. Display the assessment in the conversation as well

## Dimension 1: Spec Quality

**What to check:** Look in \`docs/specs/\` for specification files.

| Score | Criteria |
|-------|----------|
| 1 | No specs directory or no spec files |
| 2 | Specs exist but are informal notes or TODOs |
| 3 | Specs have structure (sections, some criteria) but lack consistency |
| 4 | Specs are structured with clear acceptance criteria and constraints |
| 5 | Atomic specs: self-contained, acceptance criteria, constraints, edge cases, affected files |

**Evidence to capture:** Number of specs found, example of best/worst spec, whether acceptance criteria are present.

## Dimension 2: Spec Granularity

**What to check:** Examine spec scope — can each spec be completed in a single coding session?

| Score | Criteria |
|-------|----------|
| 1 | No specs |
| 2 | Specs cover entire features or epics (multi-day work) |
| 3 | Specs are feature-sized (multi-session but bounded) |
| 4 | Most specs are session-sized with clear scope |
| 5 | All specs are atomic — one session, one concern, clear done state |

## Dimension 3: Behavioral Boundaries

**What to check:** Read CLAUDE.md for explicit behavioral constraints.

| Score | Criteria |
|-------|----------|
| 1 | No CLAUDE.md or no behavioral guidance |
| 2 | CLAUDE.md exists with general instructions but no structured boundaries |
| 3 | Some boundaries exist but not organized as Always/Ask First/Never |
| 4 | Always/Ask First/Never sections present with reasonable coverage |
| 5 | Comprehensive boundaries covering code style, testing, deployment, dependencies, and dangerous operations |

## Dimension 4: Skills & Hooks

**What to check:** Look in \`.claude/skills/\` for skill files.

| Score | Criteria |
|-------|----------|
| 1 | No .claude/ directory |
| 2 | .claude/ exists but empty or minimal |
| 3 | A few skills installed, no hooks |
| 4 | Multiple relevant skills, basic hooks |
| 5 | Comprehensive skill set covering workflow (new feature, decompose, session end), hooks for validation |

## Dimension 5: Documentation

**What to check:** Examine \`docs/\` directory structure and content.

| Score | Criteria |
|-------|----------|
| 1 | No docs/ directory |
| 2 | docs/ exists with ad-hoc files |
| 3 | Some structure (subdirectories) but inconsistent |
| 4 | Structured docs/ with templates and clear organization |
| 5 | Full documentation structure: briefs/, specs/, templates/, architecture docs, and CLAUDE.md references them |

## Dimension 6: Knowledge Capture

**What to check:** Look for mechanisms to capture discoveries, decisions, and session notes.

| Score | Criteria |
|-------|----------|
| 1 | No knowledge capture mechanism |
| 2 | Ad-hoc notes in random locations |
| 3 | A dedicated notes or decisions directory exists |
| 4 | Structured discoveries/decisions directory with some entries |
| 5 | Active knowledge capture: discoveries directory with entries, session-end workflow, decision log |

## Dimension 7: Testing & Validation

**What to check:** Look for test configuration, CI setup, and validation commands in CLAUDE.md.

| Score | Criteria |
|-------|----------|
| 1 | No test configuration |
| 2 | Test framework installed but few/no tests |
| 3 | Tests exist with reasonable coverage |
| 4 | Tests + CI pipeline configured |
| 5 | Tests + CI + validation commands documented in CLAUDE.md + scenario/integration tests |

## Output Format

Write the assessment in this format (both to file and conversation):

\`\`\`markdown
# Joysmith Assessment — [Project Name]

**Date:** [today's date]
**Overall Level:** [1-5, based on average score]

## Scores

| Dimension | Score | Summary |
|-----------|-------|---------|
| Spec Quality | X/5 | [one-line summary] |
| Spec Granularity | X/5 | [one-line summary] |
| Behavioral Boundaries | X/5 | [one-line summary] |
| Skills & Hooks | X/5 | [one-line summary] |
| Documentation | X/5 | [one-line summary] |
| Knowledge Capture | X/5 | [one-line summary] |
| Testing & Validation | X/5 | [one-line summary] |

**Average:** X.X/5

## Detailed Findings

### [Dimension Name] — X/5
**Evidence:** [what was found]
**Gap:** [what's missing]
**Recommendation:** [specific action]

[repeat for each dimension]

## Upgrade Plan

To reach Level [current + 1], complete these steps:

1. [Most impactful action] — addresses [dimension]
2. [Second action] — addresses [dimension]
3. [Third action] — addresses [dimension]

## Available Joysmith Skills

These skills are installed and can help with upgrades:
- \`/new-feature\` — Start a structured feature with brief and specs
- \`/decompose\` — Break a large task into atomic specs
- \`/session-end\` — Capture discoveries and learnings
- \`/joysmith-upgrade\` — Apply specific upgrades to your harness
\`\`\`

Write this assessment to \`docs/joysmith-assessment.md\`. Create the \`docs/\` directory if it doesn't exist.`,
};

export const TEMPLATES: Record<string, string> = {
  'ATOMIC_SPEC_TEMPLATE.md': `# [Verb + Object] — Atomic Spec

> **Parent Brief:** \`docs/briefs/YYYY-MM-DD-feature-name.md\` (or "standalone")
> **Status:** Draft | Ready | In Progress | Complete
> **Date:** YYYY-MM-DD
> **Estimated scope:** [1 session / 2-3 files / ~N lines]

---

## What

One paragraph. What changes when this spec is done? A developer with no context should understand the change in 15 seconds.

## Why

One sentence. What breaks, hurts, or is missing without this? Links to the parent brief if part of a larger feature.

## Acceptance Criteria

- [ ] [Observable behavior — what a human would see/verify]
- [ ] [Another observable behavior]
- [ ] [Regression: existing behavior X still works]
- [ ] Build passes
- [ ] Tests pass

> These are your "done" checkboxes. If Claude says "done" and these aren't all green, it's not done.

## Constraints

- MUST: [hard requirement]
- MUST NOT: [hard prohibition]
- SHOULD: [strong preference, with rationale]

> Use RFC 2119 language. 2-5 constraints is typical. Zero is a red flag — every change has boundaries.

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Create | \`path/to/file.ts\` | [brief description] |
| Modify | \`path/to/file.ts\` | [what specifically changes] |

## Approach

How this will be implemented. Not pseudo-code — describe the strategy, data flow, and key decisions. Name one rejected alternative and why it was rejected.

_Scale to complexity: 3 sentences for a bug fix, 1 page max for a feature. If you need more than a page, this spec is too big — decompose further._

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| [what could go wrong] | [what should happen] |

> Skip for trivial changes. Required for anything touching user input, data, or external APIs.`,

  'FEATURE_BRIEF_TEMPLATE.md': `# [Feature Name] — Feature Brief

> **Date:** YYYY-MM-DD
> **Project:** [project name]
> **Status:** Interview | Decomposing | Specs Ready | In Progress | Complete

---

## Vision

What are we building and why? This is the "yap" distilled — the full picture in 2-4 paragraphs.

## User Stories

- As a [role], I want [capability] so that [benefit]

## Hard Constraints

- MUST: [constraint that every spec must respect]
- MUST NOT: [prohibition that every spec must respect]

## Out of Scope

- NOT: [tempting but deferred]

## Decomposition

| # | Spec Name | Description | Dependencies | Est. Size |
|---|-----------|-------------|--------------|-----------|
| 1 | [verb-object] | [one sentence] | None | [S/M/L] |

## Execution Strategy

- [ ] Sequential (specs have chain dependencies)
- [ ] Agent teams (parallel teammates within phases)
- [ ] Parallel worktrees (specs are independent)

## Success Criteria

- [ ] [End-to-end behavior 1]
- [ ] [No regressions in existing features]`,

  'IMPLEMENTATION_PLAN_TEMPLATE.md': `# [Feature Name] — Implementation Plan

> **Design Spec:** \`docs/specs/YYYY-MM-DD-feature-name.md\`
> **Date:** YYYY-MM-DD
> **Estimated Tasks:** [number]

---

## Prerequisites

- [ ] Design spec is approved
- [ ] Branch created (if warranted): \`feature/feature-name\`
- [ ] Required context loaded: [list any docs Claude should read first]

## Task 1: [Descriptive Name]

**Goal:** One sentence — what is true after this task that wasn't true before.

**Files:**
- \`path/to/file.ts\` — [what changes]

**Steps:**
1. [Concrete action]
2. [Next concrete action]

**Verification:**
- [ ] [How to confirm this task worked]

**Commit:** \`feat: description\`

---

## Task N: Final Verification

**Goal:** Confirm everything works end-to-end.

**Steps:**
1. Run full type-check
2. Run linter
3. Run tests
4. Walk through verification checklist from design spec

**Verification:**
- [ ] All design spec verification items pass
- [ ] No regressions in existing functionality`,

  'BOUNDARY_FRAMEWORK.md': `# Boundary Framework

> Add this to the TOP of your CLAUDE.md, before any project context.
> Customize the specific rules per project, but keep the three-tier structure.

---

## Behavioral Boundaries

### ALWAYS (do these without asking)
- Run type-check and lint before every commit
- Commit after completing each discrete task (atomic commits)
- Follow patterns in existing code — match existing code style
- Check the active implementation plan before starting work

### ASK FIRST (pause and confirm before doing these)
- Adding new dependencies
- Modifying database schema, migrations, or data models
- Changing authentication or authorization flows
- Deviating from an approved implementation plan
- Any destructive operation (deleting files, dropping tables, force-pushing)
- Modifying CI/CD, deployment, or infrastructure configuration

### NEVER (do not do these under any circumstances)
- Push to production or main branch without explicit approval
- Delete specs, plans, or documentation
- Modify environment variables or secrets
- Skip type-checking or linting to "save time"
- Make changes outside the scope of the current spec/plan
- Commit code that doesn't build
- Remove or weaken existing tests
- Hardcode secrets, API keys, or credentials`,
};
