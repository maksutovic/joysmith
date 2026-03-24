---
name: new-feature
description: Guided feature development — interview the user, produce a Feature Brief, then decompose into atomic specs
---

# New Feature Workflow

You are starting a new feature. Follow this process in order. Do not skip steps.

## Phase 1: Interview

Interview the user about what they want to build. Let them talk — your job is to listen, then sharpen.

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

Write a Feature Brief to `docs/briefs/YYYY-MM-DD-feature-name.md` using FEATURE_BRIEF_TEMPLATE.md:

1. **Vision** — the problem/opportunity distilled (2-4 paragraphs)
2. **User Stories** — 2-5 stories that capture core behaviors
3. **Hard Constraints** — non-negotiables that apply to ALL specs
4. **Out of Scope** — be generous here
5. **Decomposition** — break into atomic specs (this is the key step)
6. **Execution Strategy** — sequential, parallel, or mixed
7. **Success Criteria** — end-to-end checks after all specs merge

Present the brief to the user. Focus review on:
- "Does the decomposition match how you think about this?"
- "Is anything in scope that shouldn't be?"
- "Are the specs small enough? Can each be described in one sentence?"

Iterate until approved.

## Phase 3: Generate Atomic Specs

For each row in the decomposition table, create a self-contained spec file at `docs/specs/YYYY-MM-DD-spec-name.md` using ATOMIC_SPEC_TEMPLATE.md.

**Critical rule:** Each spec must be understandable WITHOUT reading the Feature Brief. Copy relevant context into each spec. The brief is the map; each spec is a complete set of turn-by-turn directions.

This prevents the "Curse of Instructions" — no spec should require Claude to hold the entire feature in context.

## Phase 4: Hand Off for Execution

Tell the user:
```
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
```

**Important:** Recommend a fresh session for execution. The interview session has too much context noise — a clean session with just the spec produces better results. This follows Boris Cherny's pattern: interview → spec → fresh session to execute.
