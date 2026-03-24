# Apply Assessment Upgrades — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-23-joysmith-cli-plugin.md`
> **Status:** Ready
> **Date:** 2026-03-23
> **Estimated scope:** 1 session / 1-2 files / ~100 lines

---

## What

Build a skill that takes the output of a `/joysmith` assessment and applies the recommended upgrades to the project — improving CLAUDE.md, adding missing directories, installing missing skills, creating template files. This is the "fix it for me" step after assessment.

## Why

Assessment without action is just a report card. Users want the gaps fixed, not just identified. This skill closes the loop: assess → apply → re-assess to confirm.

## Acceptance Criteria

- [ ] Skill file installs to `.claude/skills/joysmith-upgrade.md`
- [ ] Reads the most recent assessment from `docs/joysmith-assessment.md`
- [ ] For each gap identified in the assessment, applies the fix (creates dirs, adds CLAUDE.md sections, copies skills)
- [ ] Asks for confirmation before modifying CLAUDE.md ("I'm going to add a Behavioral Boundaries section. OK?")
- [ ] After applying, re-runs assessment dimensions to show improvement
- [ ] Reports what changed and what the new level estimate is
- [ ] Does NOT touch project code — only harness infrastructure (docs/, .claude/, CLAUDE.md)

## Constraints

- MUST respect the "Ask First" boundary for CLAUDE.md modifications — show the user what will change
- MUST NOT overwrite user customizations — append/merge, never replace
- MUST be idempotent — running twice produces the same result
- SHOULD prioritize high-impact, low-effort upgrades first (boundaries before scenarios)

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Create | `src/skills/joysmith-upgrade.md` | Upgrade-apply skill |

## Approach

The skill is Claude Code instructions that read the assessment, identify each recommendation, and apply fixes in order of impact. It uses the same CLAUDE.md improvement logic as `init` but is more surgical — it only adds what's missing per the assessment.

The skill walks through recommendations one at a time, shows the user what it will do, and waits for approval before each change. This is deliberate — harness modifications should be transparent.

**Rejected alternative:** Fully automatic application without confirmation. The boundaries say "Ask First" for CLAUDE.md changes, and this skill should model that behavior.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| No assessment file exists | Tell user to run `/joysmith` first |
| Assessment is stale (older than recent code changes) | Warn user, offer to re-assess first |
| All recommendations already applied | Report "nothing to upgrade — harness is current" |
| User declines a recommendation | Skip it, continue to next, note it was skipped |
