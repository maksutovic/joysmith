# Adapt Workflow Skills for Installed Use — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-23-joysmith-cli-plugin.md`
> **Status:** Ready
> **Date:** 2026-03-23
> **Estimated scope:** 1 session / 3 files / ~150 lines
> **Covers:** Specs 4 (new-feature), 5 (decompose), 6 (session-end) from the brief

---

## What

Adapt the three core workflow skills (`new-feature`, `decompose`, `session-end`) from their current form as Joysmith repo templates into installable Claude Code skills that work in any project. The skills need to reference project-relative paths (not Joysmith paths) and be self-contained (no dependency on the Joysmith repo being present).

## Why

The workflow skills are the core value proposition after scaffolding. They guide the user through interview → brief → decompose → execute → discoveries without needing to know the methodology. They must work standalone in any project.

## Acceptance Criteria

- [ ] `new-feature.md` skill works when installed to `.claude/skills/` — references `docs/briefs/` and `docs/specs/` (project-relative)
- [ ] `decompose.md` skill works standalone — doesn't reference Joysmith templates by absolute path
- [ ] `session-end.md` skill works standalone — references `docs/discoveries/` (project-relative)
- [ ] Each skill includes inline guidance (doesn't require reading a separate template file to function)
- [ ] Skills reference each other correctly: new-feature → decompose → session-end
- [ ] Skills are compatible with both Claude Code slash commands (`/new-feature`) and direct invocation
- [ ] Each skill has the correct frontmatter (name, description) for Claude Code discovery
- [ ] Existing template files in templates/ are preserved as the "source of truth" — the installed skills are derived from them

## Constraints

- MUST be self-contained markdown files — no imports, no external references
- MUST use project-relative paths (`docs/specs/`, not `/Users/compiler/Developer/Joysmith/templates/`)
- MUST include enough template structure inline that Claude can generate correct files without reading a separate template
- MUST NOT duplicate the full template verbatim — include the key sections and structure, reference `docs/templates/` for the full template if installed
- SHOULD mention the Joysmith methodology briefly so users understand the "why"

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Create | `src/skills/new-feature.md` | Installable version of the new-feature skill |
| Create | `src/skills/decompose.md` | Installable version of the decompose skill |
| Create | `src/skills/session-end.md` | Installable version of the session-end skill |

## Approach

Take each existing template skill, remove Joysmith-repo-specific paths, embed the critical template structure inline (section headers, key fields), and add a reference to `docs/templates/` for the full template. The skills should be slightly more verbose than the templates since they're the user's primary interface — include brief "why" explanations for each step.

**Key adaptation per skill:**

- **new-feature:** Change spec output path from `docs/superpowers/specs/` to `docs/briefs/`. Remove reference to superpowers executing-plans skill. Add inline Feature Brief structure.
- **decompose:** Change spec output path to `docs/specs/`. Add inline Atomic Spec structure (section headers + key fields, not the full template). Reference `docs/templates/ATOMIC_SPEC_TEMPLATE.md` for details.
- **session-end:** Change discoveries path to `docs/discoveries/`. Remove the session-notes ritual entirely. Keep it focused on: discoveries, verification, spec status update, commit.

**Rejected alternative:** Having skills read from `docs/templates/` at runtime. This adds a dependency — if a user deletes a template file, the skill breaks. Better to be self-contained with a "see template for details" reference.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| User runs /new-feature but docs/briefs/ doesn't exist | Create the directory, then proceed |
| User runs /decompose with no Feature Brief | Prompt to run /new-feature first, or accept inline description |
| User runs /session-end with nothing to discover | Skip DISCOVERIES.md, just verify and commit |
| docs/templates/ was deleted by user | Skills still work — they have inline structure |
