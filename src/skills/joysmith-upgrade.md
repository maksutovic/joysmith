---
name: joysmith-upgrade
description: Apply assessment upgrades — read the latest assessment and fix identified gaps in your project harness
---

# Joysmith — Apply Assessment Upgrades

You are applying recommended upgrades to this project's AI development harness. Follow these steps precisely.

## Step 1: Read the Assessment

Look for `docs/joysmith-assessment.md`. If it does not exist, tell the user:

> No assessment found. Run `/joysmith` first to assess your project's harness, then come back here.

Stop and do not continue.

If the file exists, read it and check the date. If the assessment date is more than 7 days old, or if there have been significant commits since the assessment was written, warn the user:

> This assessment may be stale — it was written on [date] and there have been changes since. Would you like to re-assess first with `/joysmith`, or proceed with these recommendations?

If the user wants to re-assess, stop and let them run `/joysmith`. Otherwise, continue.

## Step 2: Parse Recommendations

Extract every gap and recommendation from the assessment. Group them into these categories:

1. **Missing directories** — `docs/specs/`, `docs/briefs/`, `docs/discoveries/`, `docs/templates/`, `.claude/skills/`
2. **Missing CLAUDE.md sections** — Behavioral Boundaries (Always/Ask First/Never), Architecture, Key Files, Development Workflow, Common Gotchas
3. **Missing skills** — Skill files that should be in `.claude/skills/`
4. **Missing templates** — Template files that should be in `docs/templates/`
5. **Testing gaps** — Missing test configuration, CI setup, or validation commands in CLAUDE.md
6. **Knowledge capture gaps** — Missing `docs/discoveries/`, session-end workflow, decision log

## Step 3: Check What Already Exists

Before applying anything, check the current state of every item. Skip anything that already exists. If ALL recommendations have already been applied, tell the user:

> Nothing to upgrade — your harness is current with the latest assessment recommendations.

Stop and do not continue.

## Step 4: Apply Upgrades (in priority order)

Apply fixes in this order — high-impact, low-effort first:

### Priority 1: Create Missing Directories

For each missing directory, create it. No confirmation needed — directories are safe to create.

- `docs/specs/`
- `docs/briefs/`
- `docs/discoveries/`
- `docs/templates/`
- `.claude/skills/`

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

For each missing skill identified in the assessment, copy the skill file to `.claude/skills/`. Available Joysmith skills:

- `joysmith.md` — Assessment, scoring, and upgrade recommendations
- `joysmith-upgrade.md` — This skill (apply upgrades)
- `new-feature.md` — Structured feature development with brief and specs
- `decompose.md` — Break large tasks into atomic specs
- `session-end.md` — End-of-session knowledge capture

Note which skills were installed.

### Priority 4: Copy Missing Templates

For each missing template identified in the assessment, copy it to `docs/templates/`. Standard Joysmith templates include:

- `spec.md` — Atomic spec template
- `brief.md` — Feature brief template
- `discovery.md` — Discovery/learning capture template

Note which templates were copied.

### Priority 5: Suggest Testing & Knowledge Capture Improvements

For testing and knowledge capture gaps, do NOT make changes automatically. Instead, present specific suggestions:

- If test commands are missing from CLAUDE.md, draft an addition and ask the user
- If CI is not configured, suggest what to add and where
- If knowledge capture workflows are missing, recommend `/session-end` and explain how it works

## Step 5: Re-assess and Report

After all upgrades are applied (or skipped), re-evaluate each of the 7 dimensions against the current state of the project. Use the same scoring rubric from `/joysmith`.

Display a before/after comparison:

```
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
```

Update `docs/joysmith-assessment.md` with the new scores and today's date.

## Edge Cases

- **Assessment file missing:** Tell the user to run `/joysmith` first. Do not proceed.
- **Assessment is stale:** Warn and offer to re-assess before proceeding.
- **All recommendations already applied:** Report "nothing to upgrade" and stop.
- **User declines a recommendation:** Skip it, continue to the next, and include it in the "What Was Skipped" section of the report.
- **CLAUDE.md does not exist at all:** Create it with the recommended sections, but ask the user first: "No CLAUDE.md found. I'll create one with [list of sections]. OK?"
- **Non-Joysmith content in CLAUDE.md:** Preserve it exactly as-is. Only append or merge Joysmith sections — never remove or reformat existing content.
