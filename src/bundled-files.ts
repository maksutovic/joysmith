// Bundled file contents — embedded at build time since tsup bundles everything
// and we can't read files from the package at runtime.

export const SKILLS: Record<string, string> = {
  'decompose.md': `---
name: decompose
description: Break a feature brief into atomic specs — small, testable, independently executable units
---

# Decompose Feature into Atomic Specs

You have a Feature Brief (or the user has described a feature). Your job is to decompose it into atomic specs that can be executed independently — one spec per session.

## Step 1: Verify the Brief Exists

Look for a Feature Brief in \`docs/briefs/\`. If one doesn't exist yet, tell the user:

> No feature brief found. Run \`/new-feature\` first to interview and create one, or describe the feature now and I'll work from your description.

If the user describes the feature inline, work from that description directly. You don't need a formal brief to decompose — but recommend creating one for complex features.

## Step 2: Identify Natural Boundaries

**Why:** Good boundaries make specs independently testable and committable. Bad boundaries create specs that can't be verified without other specs also being done.

Read the brief (or description) and identify natural split points:

- **Data layer changes** (schemas, types, migrations) — always a separate spec
- **Pure functions / business logic** — separate from I/O
- **UI components** — separate from data fetching
- **API endpoints / route handlers** — separate from business logic
- **Test infrastructure** (mocks, fixtures, helpers) — can be its own spec if substantial
- **Configuration / environment** — separate from code changes

Ask yourself: "Can this piece be committed and tested without the other pieces existing?" If yes, it's a good boundary.

## Step 3: Build the Decomposition Table

For each atomic spec, define:

| # | Spec Name | Description | Dependencies | Size |
|---|-----------|-------------|--------------|------|

**Rules:**
- Each spec name is \`verb-object\` format (e.g., \`add-terminal-detection\`, \`extract-prompt-module\`)
- Each description is ONE sentence — if you need two, the spec is too big
- Dependencies reference other spec numbers — keep the dependency graph shallow
- More than 2 dependencies on a single spec = it's too big, split further
- Aim for 3-7 specs per feature. Fewer than 3 = probably not decomposed enough. More than 10 = the feature brief is too big

## Step 4: Present and Iterate

Show the decomposition table to the user. Ask:
1. "Does this breakdown match how you think about this feature?"
2. "Are there any specs that feel too big or too small?"
3. "Should any of these run in parallel (separate worktrees)?"

Iterate until the user approves.

## Step 5: Generate Atomic Specs

For each approved row, create \`docs/specs/YYYY-MM-DD-spec-name.md\`. Create the \`docs/specs/\` directory if it doesn't exist.

**Why:** Each spec must be self-contained — a fresh Claude session should be able to execute it without reading the Feature Brief. Copy relevant constraints and context into each spec.

Use this structure:

\`\`\`markdown
# [Verb + Object] — Atomic Spec

> **Parent Brief:** \`docs/briefs/YYYY-MM-DD-feature-name.md\` (or "standalone")
> **Status:** Ready
> **Date:** YYYY-MM-DD
> **Estimated scope:** [1 session / N files / ~N lines]

---

## What
One paragraph — what changes when this spec is done?

## Why
One sentence — what breaks or is missing without this?

## Acceptance Criteria
- [ ] [Observable behavior]
- [ ] Build passes
- [ ] Tests pass

## Constraints
- MUST: [hard requirement]
- MUST NOT: [hard prohibition]

## Affected Files
| Action | File | What Changes |
|--------|------|-------------|

## Approach
Strategy, data flow, key decisions. Name one rejected alternative.

## Edge Cases
| Scenario | Expected Behavior |
|----------|------------------|
\`\`\`

If \`docs/templates/ATOMIC_SPEC_TEMPLATE.md\` exists, reference it for the full template with additional guidance.

Fill in all sections — each spec must be self-contained (no "see the brief for context"). Copy relevant constraints from the Feature Brief into each spec. Write acceptance criteria specific to THIS spec, not the whole feature.

## Step 6: Recommend Execution Strategy

Based on the dependency graph:
- **Independent specs** — "These can run in parallel worktrees"
- **Sequential specs** — "Execute these in order: 1 -> 2 -> 4"
- **Mixed** — "Start specs 1 and 3 in parallel. After 1 completes, start 2."

Update the Feature Brief's Execution Strategy section with the plan (if a brief exists).

## Step 7: Hand Off

Tell the user:
\`\`\`
Decomposition complete:
- [N] atomic specs created in docs/specs/
- [N] can run in parallel, [N] are sequential
- Estimated total: [N] sessions

To execute:
- Sequential: Open a session, point Claude at each spec in order
- Parallel: Use worktrees — one spec per worktree, merge when done
- Each session should end with /session-end to capture discoveries

Ready to start execution?
\`\`\`
`,

  'joysmith-upgrade.md': `---
name: joysmith-upgrade
description: Apply assessment upgrades — read the latest assessment and fix identified gaps in your project harness
---

# Joysmith — Apply Assessment Upgrades

You are applying recommended upgrades to this project's AI development harness. Follow these steps precisely.

## Step 1: Read the Assessment

Look for \`docs/joysmith-assessment.md\`. If it does not exist, tell the user:

> No assessment found. Run \`/joysmith\` first to assess your project's harness, then come back here.

Stop and do not continue.

If the file exists, read it and check the date. If the assessment date is more than 7 days old, or if there have been significant commits since the assessment was written, warn the user:

> This assessment may be stale — it was written on [date] and there have been changes since. Would you like to re-assess first with \`/joysmith\`, or proceed with these recommendations?

If the user wants to re-assess, stop and let them run \`/joysmith\`. Otherwise, continue.

## Step 2: Parse Recommendations

Extract every gap and recommendation from the assessment. Group them into these categories:

1. **Missing directories** — \`docs/specs/\`, \`docs/briefs/\`, \`docs/discoveries/\`, \`docs/templates/\`, \`.claude/skills/\`
2. **Missing CLAUDE.md sections** — Behavioral Boundaries (Always/Ask First/Never), Architecture, Key Files, Development Workflow, Common Gotchas
3. **Missing skills** — Skill files that should be in \`.claude/skills/\`
4. **Missing templates** — Template files that should be in \`docs/templates/\`
5. **Testing gaps** — Missing test configuration, CI setup, or validation commands in CLAUDE.md
6. **Knowledge capture gaps** — Missing \`docs/discoveries/\`, session-end workflow, decision log

## Step 3: Check What Already Exists

Before applying anything, check the current state of every item. Skip anything that already exists. If ALL recommendations have already been applied, tell the user:

> Nothing to upgrade — your harness is current with the latest assessment recommendations.

Stop and do not continue.

## Step 4: Apply Upgrades (in priority order)

Apply fixes in this order — high-impact, low-effort first:

### Priority 1: Create Missing Directories

For each missing directory, create it. No confirmation needed — directories are safe to create.

- \`docs/specs/\`
- \`docs/briefs/\`
- \`docs/discoveries/\`
- \`docs/templates/\`
- \`.claude/skills/\`

After creating, briefly note what was created.

### Priority 2: Add Missing CLAUDE.md Sections

**This requires user confirmation for every change.**

For each missing section identified in the assessment:

1. Draft the section content based on what you know about the project (read the codebase to gather real information — do not use placeholder text)
2. Show the user the exact content that will be added
3. Ask: "I'm going to add a [section name] section to CLAUDE.md. OK?"
4. If the user approves, append the section to CLAUDE.md — do NOT replace or rewrite existing content
5. If the user declines, note it was skipped and move on

**Important:** Never overwrite or reformat existing CLAUDE.md content. Only append new sections or merge into existing sections.

### Priority 3: Install Missing Skills

For each missing skill identified in the assessment, copy the skill file to \`.claude/skills/\`. Available Joysmith skills:

- \`joysmith.md\` — Assessment, scoring, and upgrade recommendations
- \`joysmith-upgrade.md\` — This skill (apply upgrades)
- \`new-feature.md\` — Structured feature development with brief and specs
- \`decompose.md\` — Break large tasks into atomic specs
- \`session-end.md\` — End-of-session knowledge capture

Note which skills were installed.

### Priority 4: Copy Missing Templates

For each missing template identified in the assessment, copy it to \`docs/templates/\`. Standard Joysmith templates include:

- \`spec.md\` — Atomic spec template
- \`brief.md\` — Feature brief template
- \`discovery.md\` — Discovery/learning capture template

Note which templates were copied.

### Priority 5: Suggest Testing & Knowledge Capture Improvements

For testing and knowledge capture gaps, do NOT make changes automatically. Instead, present specific suggestions:

- If test commands are missing from CLAUDE.md, draft an addition and ask the user
- If CI is not configured, suggest what to add and where
- If knowledge capture workflows are missing, recommend \`/session-end\` and explain how it works

## Step 5: Re-assess and Report

After all upgrades are applied (or skipped), re-evaluate each of the 7 dimensions against the current state of the project. Use the same scoring rubric from \`/joysmith\`.

Display a before/after comparison:

\`\`\`
## Upgrade Results

| Dimension              | Before | After | Change |
|------------------------|--------|-------|--------|
| Spec Quality           | X/5    | X/5   | +X     |
| Spec Granularity       | X/5    | X/5   | +X     |
| Behavioral Boundaries  | X/5    | X/5   | +X     |
| Skills & Hooks         | X/5    | X/5   | +X     |
| Documentation          | X/5    | X/5   | +X     |
| Knowledge Capture      | X/5    | X/5   | +X     |
| Testing & Validation   | X/5    | X/5   | +X     |

**Previous Level:** X — **New Level:** X

### What Changed
- [list each change that was applied]

### What Was Skipped
- [list each recommendation the user declined, if any]

### Remaining Gaps
- [list anything still below 3.5 that wasn't addressed]
\`\`\`

Update \`docs/joysmith-assessment.md\` with the new scores and today's date.

## Edge Cases

- **Assessment file missing:** Tell the user to run \`/joysmith\` first. Do not proceed.
- **Assessment is stale:** Warn and offer to re-assess before proceeding.
- **All recommendations already applied:** Report "nothing to upgrade" and stop.
- **User declines a recommendation:** Skip it, continue to the next, and include it in the "What Was Skipped" section of the report.
- **CLAUDE.md does not exist at all:** Create it with the recommended sections, but ask the user first: "No CLAUDE.md found. I'll create one with [list of sections]. OK?"
- **Non-Joysmith content in CLAUDE.md:** Preserve it exactly as-is. Only append or merge Joysmith sections — never remove or reformat existing content.
`,

  'joysmith.md': `---
name: joysmith
description: Assess your project's AI development harness — detect state, score 7 dimensions, recommend upgrades, and offer to apply fixes
---

# Joysmith — Project Harness Assessment

You are evaluating this project's AI development harness. Follow these steps in order.

## Step 1: Detect Harness State

Check the following and note what exists:

1. **CLAUDE.md** — Read it if it exists. Check whether it contains meaningful content (not just a project name or generic README).
2. **Key directories** — Check for: \`docs/specs/\`, \`docs/briefs/\`, \`docs/discoveries/\`, \`docs/templates/\`, \`.claude/skills/\`
3. **Boundary framework** — Look for \`Always\`, \`Ask First\`, and \`Never\` sections in CLAUDE.md (or similar behavioral constraints under any heading).
4. **Skills infrastructure** — Check \`.claude/skills/\` for installed skill files.
5. **Test configuration** — Look for test commands in package.json, pyproject.toml, Cargo.toml, Makefile, or CI config files.

## Step 2: Route Based on State

### If No Harness (no CLAUDE.md, or CLAUDE.md is just a README with no structured sections):

Tell the user:
- Their project has no AI development harness
- Recommend running \`npx joysmith init\` to scaffold one
- Briefly explain what it sets up: CLAUDE.md with boundaries, spec/brief templates, skills, documentation structure
- **Stop here** — do not run the full assessment on a bare project

### If Harness Exists (CLAUDE.md has structured content — boundaries, commands, architecture, or domain rules):

Continue to Step 3 for the full assessment.

## Step 3: Score 7 Dimensions

Read CLAUDE.md thoroughly. Explore the project structure. Score each dimension on a 1-5 scale with specific evidence.

### Dimension 1: Spec Quality

Look in \`docs/specs/\` for specification files.

| Score | Criteria |
|-------|----------|
| 1 | No specs directory or no spec files |
| 2 | Specs exist but are informal notes or TODOs |
| 3 | Specs have structure (sections, some criteria) but lack consistency |
| 4 | Specs are structured with clear acceptance criteria and constraints |
| 5 | Atomic specs: self-contained, acceptance criteria, constraints, edge cases, affected files |

**Evidence:** Number of specs found, example of best/worst, whether acceptance criteria are present.

### Dimension 2: Spec Granularity

Can each spec be completed in a single coding session?

| Score | Criteria |
|-------|----------|
| 1 | No specs |
| 2 | Specs cover entire features or epics |
| 3 | Specs are feature-sized (multi-session but bounded) |
| 4 | Most specs are session-sized with clear scope |
| 5 | All specs are atomic — one session, one concern, clear done state |

### Dimension 3: Behavioral Boundaries

Read CLAUDE.md for explicit behavioral constraints.

| Score | Criteria |
|-------|----------|
| 1 | No CLAUDE.md or no behavioral guidance |
| 2 | CLAUDE.md exists with general instructions but no structured boundaries |
| 3 | Some boundaries exist but not organized as Always/Ask First/Never |
| 4 | Always/Ask First/Never sections present with reasonable coverage |
| 5 | Comprehensive boundaries covering code style, testing, deployment, dependencies, and dangerous operations |

**Important:** Projects may have strong rules under different headings (e.g., "Critical Rules", "Constraints"). Give credit for substance over format — a project with clear, enforced rules scores higher than one with empty Always/Ask First/Never sections.

### Dimension 4: Skills & Hooks

Look in \`.claude/skills/\` for skill files. Check for hooks configuration.

| Score | Criteria |
|-------|----------|
| 1 | No .claude/ directory |
| 2 | .claude/ exists but empty or minimal |
| 3 | A few skills installed, no hooks |
| 4 | Multiple relevant skills, basic hooks |
| 5 | Comprehensive skills covering workflow, hooks for validation |

### Dimension 5: Documentation

Examine \`docs/\` directory structure and content.

| Score | Criteria |
|-------|----------|
| 1 | No docs/ directory |
| 2 | docs/ exists with ad-hoc files |
| 3 | Some structure (subdirectories) but inconsistent |
| 4 | Structured docs/ with templates and clear organization |
| 5 | Full structure: briefs/, specs/, templates/, architecture docs, referenced from CLAUDE.md |

### Dimension 6: Knowledge Capture

Look for discoveries, decisions, and session notes.

| Score | Criteria |
|-------|----------|
| 1 | No knowledge capture mechanism |
| 2 | Ad-hoc notes in random locations |
| 3 | A dedicated notes or decisions directory exists |
| 4 | Structured discoveries/decisions directory with entries |
| 5 | Active capture: discoveries with entries, session-end workflow, decision log |

### Dimension 7: Testing & Validation

Look for test config, CI setup, and validation commands.

| Score | Criteria |
|-------|----------|
| 1 | No test configuration |
| 2 | Test framework installed but few/no tests |
| 3 | Tests exist with reasonable coverage |
| 4 | Tests + CI pipeline configured |
| 5 | Tests + CI + validation commands in CLAUDE.md + scenario tests |

## Step 4: Write Assessment

Write the assessment to \`docs/joysmith-assessment.md\` AND display it in the conversation. Use this format:

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
**Evidence:** [specific files, paths, counts found]
**Gap:** [what's missing]
**Recommendation:** [specific action to improve]

## Upgrade Plan

To reach Level [current + 1], complete these steps:
1. [Most impactful action] — addresses [dimension] (X -> Y)
2. [Next action] — addresses [dimension] (X -> Y)
[up to 5 actions, ordered by impact]
\`\`\`

## Step 5: Offer to Apply Fixes

After presenting the assessment, ask the user:

"Would you like me to start applying these upgrades? I'll go through each recommendation and ask before making changes to your CLAUDE.md or project files."

If the user agrees, work through the upgrade plan one item at a time:
- For each recommendation, explain what you'll do and ask for confirmation
- **Always ask before modifying CLAUDE.md** — show what you'll add
- Creating missing directories is safe to do without asking
- Installing missing templates is safe if the directory is empty
- After applying changes, briefly re-score the affected dimensions to show improvement

## Edge Cases

- **Not a git repo:** Note this. Joysmith works best in a git repo.
- **CLAUDE.md is just a README:** Treat as "no harness."
- **Non-Joysmith skills already installed:** Acknowledge them. Do not replace — suggest additions.
- **Monorepo:** Assess the root CLAUDE.md. Note if component-level CLAUDE.md files exist.
- **Project has rules under non-standard headings:** Give credit. Suggest reformatting as Always/Ask First/Never but acknowledge the rules are there.
`,

  'new-feature.md': `---
name: new-feature
description: Guided feature development — interview the user, produce a Feature Brief, then decompose into atomic specs
---

# New Feature Workflow

You are starting a new feature. Follow this process in order. Do not skip steps.

## Phase 1: Interview

Interview the user about what they want to build. Let them talk — your job is to listen, then sharpen.

**Why:** A thorough interview prevents wasted implementation time. Most failed features fail because the problem wasn't understood, not because the code was wrong.

**Ask about:**
- What problem does this solve? Who is affected?
- What does "done" look like? How will a user know this works?
- What are the hard constraints? (business rules, tech limitations, deadlines)
- What is explicitly NOT in scope? (push hard on this — aggressive scoping is key)
- Are there edge cases or error conditions we need to handle?
- What existing code/patterns should this follow?

**Interview technique:**
- Let the user "yap" — don't interrupt their flow of ideas
- After they finish, play back your understanding: "So if I'm hearing you right..."
- Ask clarifying questions that force specificity: "When you say 'handle errors,' what should the user see?"
- Push toward testable statements: "How would we verify that works?"

Keep asking until you can fill out a Feature Brief. When ready, say:
"I have enough context. Let me write the Feature Brief for your review."

## Phase 2: Feature Brief

Write a Feature Brief to \`docs/briefs/YYYY-MM-DD-feature-name.md\`. Create the \`docs/briefs/\` directory if it doesn't exist.

**Why:** The brief is the single source of truth for what we're building. It prevents scope creep and gives every spec a shared reference point.

Use this structure:

\`\`\`markdown
# [Feature Name] — Feature Brief

> **Date:** YYYY-MM-DD
> **Project:** [project name]
> **Status:** Interview | Decomposing | Specs Ready | In Progress | Complete

---

## Vision
What are we building and why? The full picture in 2-4 paragraphs.

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
- [ ] Parallel worktrees (specs are independent)
- [ ] Mixed

## Success Criteria
- [ ] [End-to-end behavior 1]
- [ ] [No regressions in existing features]
\`\`\`

If \`docs/templates/FEATURE_BRIEF_TEMPLATE.md\` exists, reference it for the full template with additional guidance.

Present the brief to the user. Focus review on:
- "Does the decomposition match how you think about this?"
- "Is anything in scope that shouldn't be?"
- "Are the specs small enough? Can each be described in one sentence?"

Iterate until approved.

## Phase 3: Generate Atomic Specs

For each row in the decomposition table, create a self-contained spec file at \`docs/specs/YYYY-MM-DD-spec-name.md\`. Create the \`docs/specs/\` directory if it doesn't exist.

**Why:** Each spec must be understandable WITHOUT reading the Feature Brief. This prevents the "Curse of Instructions" — no spec should require holding the entire feature in context. Copy relevant context into each spec.

Use this structure for each spec:

\`\`\`markdown
# [Verb + Object] — Atomic Spec

> **Parent Brief:** \`docs/briefs/YYYY-MM-DD-feature-name.md\`
> **Status:** Ready
> **Date:** YYYY-MM-DD
> **Estimated scope:** [1 session / N files / ~N lines]

---

## What
One paragraph — what changes when this spec is done?

## Why
One sentence — what breaks or is missing without this?

## Acceptance Criteria
- [ ] [Observable behavior]
- [ ] Build passes
- [ ] Tests pass

## Constraints
- MUST: [hard requirement]
- MUST NOT: [hard prohibition]

## Affected Files
| Action | File | What Changes |
|--------|------|-------------|

## Approach
Strategy, data flow, key decisions. Name one rejected alternative.

## Edge Cases
| Scenario | Expected Behavior |
|----------|------------------|
\`\`\`

If \`docs/templates/ATOMIC_SPEC_TEMPLATE.md\` exists, reference it for the full template with additional guidance.

## Phase 4: Hand Off for Execution

Tell the user:
\`\`\`
Feature Brief and [N] atomic specs are ready.

Specs:
1. [spec-name] — [one sentence] [S/M/L]
2. [spec-name] — [one sentence] [S/M/L]
...

Recommended execution:
- [Parallel/Sequential/Mixed strategy]
- Estimated: [N] sessions total

To execute: Start a fresh session per spec. Each session should:
1. Read the spec
2. Implement
3. Run /session-end to capture discoveries
4. Commit and PR

Ready to start?
\`\`\`

**Why:** A fresh session for execution produces better results. The interview session has too much context noise — a clean session with just the spec is more focused.

You can also use \`/decompose\` to re-decompose a brief if the breakdown needs adjustment.
`,

  'session-end.md': `---
name: session-end
description: Wrap up a session — capture discoveries, verify, prepare for PR or next session
---

# Session Wrap-Up

Before ending this session, complete these steps in order.

## 1. Capture Discoveries

**Why:** Discoveries are the surprises — things that weren't in the spec or that contradicted expectations. They prevent future sessions from hitting the same walls.

Check: did anything surprising happen during this session? If yes, create or update a discovery file at \`docs/discoveries/YYYY-MM-DD-topic.md\`. Create the \`docs/discoveries/\` directory if it doesn't exist.

Only capture what's NOT obvious from the code or git diff:
- "We thought X but found Y" — assumptions that were wrong
- "This API/library behaves differently than documented" — external gotchas
- "This edge case needs handling in a future spec" — deferred work with context
- "The approach in the spec didn't work because..." — spec-vs-reality gaps
- Key decisions made during implementation that aren't in the spec

**Do NOT capture:**
- Files changed (that's the diff)
- What you set out to do (that's the spec)
- Step-by-step narrative of the session (nobody re-reads these)

Use this format:

\`\`\`markdown
# Discoveries — [topic]

**Date:** YYYY-MM-DD
**Spec:** [link to spec if applicable]

## [Discovery title]
**Expected:** [what we thought would happen]
**Actual:** [what actually happened]
**Impact:** [what this means for future work]
\`\`\`

If nothing surprising happened, skip the discovery file entirely. No discovery is a good sign — the spec was accurate.

## 2. Run Validation

Run the project's validation commands. Check CLAUDE.md for project-specific commands. Common checks:

- Type-check (e.g., \`tsc --noEmit\`, \`mypy\`, \`cargo check\`)
- Tests (e.g., \`npm test\`, \`pytest\`, \`cargo test\`)
- Lint (e.g., \`eslint\`, \`ruff\`, \`clippy\`)

Fix any failures before proceeding.

## 3. Update Spec Status

If working from an atomic spec in \`docs/specs/\`:
- All acceptance criteria met — update status to \`Complete\`
- Partially done — update status to \`In Progress\`, note what's left

If working from a Feature Brief in \`docs/briefs/\`, check off completed specs in the decomposition table.

## 4. Commit

Commit all changes including the discovery file (if created) and spec status updates. The commit message should reference the spec if applicable.

## 5. Report

\`\`\`
Session complete.
- Spec: [spec name] — [Complete / In Progress]
- Build: [passing / failing]
- Discoveries: [N items / none]
- Next: [what the next session should tackle, or "ready for PR"]
\`\`\`
`,

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
