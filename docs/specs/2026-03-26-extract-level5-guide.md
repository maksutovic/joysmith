# Extract Level 5 Guide — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-stack-aware-scenario-testing-draft.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 2 files / ~20 lines new (mostly moving existing content)

---

## What

Move the Level 5 content from `README.md` (the "Level 5: The Autonomous Loop" section through the end of "The Complete Loop") into a dedicated `docs/guides/level-5-autonomy.md` file. Replace the extracted section in README with a short summary paragraph and a link to the full guide. Keep the complexity note visible in the README.

## Why

The README is 686 lines and growing. The Level 5 section alone is ~350 lines with multiple mermaid diagrams, setup guides, and architecture explanations. This is advanced content that most first-time users don't need. Moving it to a dedicated page keeps the README focused on "what is Joycraft, how to get started" while giving Level 5 its own full-page treatment on GitHub.

## Acceptance Criteria

- [ ] New file exists at `docs/guides/level-5-autonomy.md`
- [ ] Level 5 guide contains all content currently in README from "## Level 5: The Autonomous Loop" through "### The Complete Loop" section (inclusive of all mermaid diagrams, setup steps, cost section)
- [ ] Level 5 guide also includes the "What Gets Installed" table
- [ ] Level 5 guide has a proper title and introduction paragraph
- [ ] README "Level 5" section replaced with a short summary (5-10 lines max) linking to the full guide
- [ ] The complexity note ("A note on complexity: Setting up Level 5 does have some moving parts...") remains visible in the README summary, not just in the guide
- [ ] The Setup Guide steps (Steps 1-6) are in the full guide, not the README
- [ ] The "Cost" section is in the full guide, not the README
- [ ] All internal links in the README that pointed to Level 5 anchors are updated to point to the guide file
- [ ] The guide renders correctly on GitHub (mermaid diagrams, tables, code blocks)
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| Guide file exists | Check `docs/guides/level-5-autonomy.md` exists | manual |
| README has link to guide | Grep README for `docs/guides/level-5-autonomy.md` | manual |
| Complexity note in README | Grep README for "moving parts" or "complexity" | manual |
| Guide has architecture diagram | Grep guide for `mermaid` | manual |
| Guide has setup steps | Grep guide for "Step 1" and "Step 6" | manual |
| No orphaned anchors in README | Grep README for `#level-5` anchors, verify they point to guide | manual |

**Execution order:**
1. Read the README Level 5 section to identify exact boundaries
2. Create the guide file with extracted content
3. Replace the README section with summary + link
4. Verify all links and rendering

**Smoke test:** Open both files on GitHub (or render locally) to verify formatting.

**Before implementing, verify your test harness:**
1. This is a content-only change — no code tests needed
2. Verify by reading both files after changes

## Constraints

- MUST: Keep the complexity note in the README summary — user specifically requested this
- MUST: Preserve all mermaid diagrams, tables, and formatting in the guide
- MUST: The guide must be self-contained — readable without the README
- MUST: Add a "Back to README" link at the top of the guide
- MUST NOT: Change any content — this is a move, not a rewrite
- MUST NOT: Move the "Tuning" section, "Test-First Development" section, "Permission Modes" section, or "Why This Exists" section — those stay in README

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Add | `docs/guides/level-5-autonomy.md` | Full Level 5 content extracted from README |
| Modify | `README.md` | Level 5 section replaced with summary + link |

## Approach

1. Extract README lines 173-426 (from "## Level 5: The Autonomous Loop" through the complete loop sequence diagram and "What Gets Installed" table)
2. Also extract the Setup Guide (Steps 1-6) and Cost section
3. Add a title and intro paragraph to the guide: "# Level 5: The Autonomous Loop — Full Guide"
4. Add a link back to README at the top
5. Replace extracted README content with:

```markdown
## Level 5: The Autonomous Loop

> **A note on complexity:** Setting up Level 5 does have some moving parts and, depending on the complexity of your stack, this will require a good amount of prompting and trial-and-error. Full step-by-step guides along with a video coming soon.

Level 5 is where specs go in and validated software comes out — four GitHub Actions workflows, a separate scenarios repo, and two AI agents that can never see each other's work. Run `/joycraft-implement-level5` for guided setup, or `npx joycraft init-autofix` via CLI.

See the full **[Level 5 Autonomy Guide](docs/guides/level-5-autonomy.md)** for architecture diagrams, setup steps, workflow details, and cost estimates.
```

**Rejected alternative:** Keeping everything in README with a table of contents. The README would still be 686+ lines and growing with the new stack-aware content. A dedicated page is cleaner.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| User clicks link on GitHub | File renders with all mermaid diagrams and formatting |
| User reads README on npm | Link may not work on npmjs.com — acceptable tradeoff |
| Existing bookmarks to README Level 5 anchors | Anchors change — but this is expected for a restructure |
