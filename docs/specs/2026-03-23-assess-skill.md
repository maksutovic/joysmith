# Assess Project Harness Quality — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-23-joysmith-cli-plugin.md`
> **Status:** Ready
> **Date:** 2026-03-23
> **Estimated scope:** 1-2 sessions / 2 files / ~200 lines

---

## What

Build the `/joysmith` skill — the main entry point. When invoked inside Claude Code, it reads the project's current state, detects whether a harness exists, scores it against the 5-level framework, and either recommends scaffolding (no harness), outputs an assessment with upgrade plan (partial harness), or confirms readiness (full harness).

## Why

This is the front door of Joysmith. Without it, users have no way to know where their project stands or what to improve. The assessment must be honest, specific, and actionable — not a generic checklist.

## Acceptance Criteria

- [ ] Skill file installs to `.claude/skills/joysmith.md`
- [ ] Detects "no harness" state: no CLAUDE.md or generic CLAUDE.md without boundaries → offers to scaffold
- [ ] Detects "partial harness" state: CLAUDE.md exists but missing dimensions → runs assessment
- [ ] Detects "full harness" state: all dimensions present at 3.5+ → confirms readiness, offers to start work
- [ ] Assessment scores 7 dimensions: Spec Quality, Spec Granularity, Behavioral Boundaries, Skills & Hooks, Documentation, Knowledge Capture, Testing & Validation
- [ ] Each dimension score includes specific evidence (file paths, what's present, what's missing)
- [ ] Assessment outputs a concrete upgrade plan: "To reach Level X, do these 3-5 things"
- [ ] Assessment is written to `docs/joysmith-assessment.md` AND displayed in conversation
- [ ] Skill handles the case where it's run outside a git repo gracefully

## Constraints

- MUST use the Joysmith assessment methodology (5-level framework, dimension scoring from ASSESSMENT_TEMPLATE.md)
- MUST be a Claude Code skill (markdown file with structured instructions for Claude)
- MUST NOT require external tools or APIs — works purely by reading project files
- MUST produce actionable output — every gap identified must have a specific recommendation
- SHOULD reference the installed Joysmith skills by name when recommending workflow improvements

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Create | `src/skills/joysmith.md` | Main entry point skill — detection + assessment + routing |
| Create | `src/skills/joysmith-assess.md` | Detailed assessment skill (called by main skill when partial harness detected) |

## Approach

The skill is a markdown file with structured instructions for Claude. It tells Claude to:

1. Check for CLAUDE.md — read it if it exists
2. Check for key directories (docs/specs/, docs/briefs/, .claude/skills/)
3. Check for boundary framework (Always/Ask First/Never sections)
4. Check for skills infrastructure
5. Check for test configuration
6. Score each dimension based on what's found
7. Route to: scaffold recommendation, assessment output, or "ready" confirmation

The skill is NOT code that runs — it's instructions that Claude follows. The "intelligence" comes from Claude reading the project and applying the scoring rubric.

**Rejected alternative:** Building the assessment as executable code (TypeScript) that parses files and computes scores. This would be rigid and miss nuance. Claude reading the actual files and applying judgment produces much better assessments.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Project has CLAUDE.md but it's just a README | Detect as "no harness" — presence of file isn't enough |
| Project has boundaries but no skills | Score boundaries high, skills low — recommend adding skills |
| Project already has non-Joysmith skills | Acknowledge them, don't replace — suggest additions |
| Monorepo with multiple CLAUDE.md files | Assess root CLAUDE.md, note component-level files exist |
| Project has excellent tests but no specs | Score testing high, spec quality low — different dimensions |
