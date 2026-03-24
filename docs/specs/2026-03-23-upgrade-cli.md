# Upgrade CLI Command — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-23-joysmith-cli-plugin.md`
> **Status:** Ready
> **Date:** 2026-03-23
> **Estimated scope:** 1-2 sessions / 3-4 files / ~200 lines

---

## What

Build `npx joysmith upgrade` — a CLI command that compares installed Joysmith templates and skills against the latest version, shows a diff of what changed, and offers to update files while preserving user customizations.

## Why

Templates evolve (we overhauled the spec system in a single session). Users who ran `init` months ago shouldn't have to manually track what changed. The upgrade command keeps the harness current.

## Acceptance Criteria

- [ ] `npx joysmith upgrade` runs in a project that was previously initialized
- [ ] Compares installed skills (.claude/skills/joysmith-*.md, new-feature.md, decompose.md, session-end.md) against latest versions bundled in the package
- [ ] Compares installed templates (docs/templates/*.md) against latest versions
- [ ] For files that differ: shows a summary of what changed and asks whether to update
- [ ] For files that match: reports "up to date"
- [ ] For new files in latest that don't exist locally: offers to add them
- [ ] For files the user has customized: shows the diff and asks, never auto-overwrites
- [ ] Records a `.joysmith-version` marker file (or similar) to track installed version
- [ ] Prints summary: "Updated N files, skipped M (user-customized), added K new"
- [ ] If project was never initialized: tells user to run `npx joysmith init` first
- [ ] Build passes
- [ ] Tests pass

## Constraints

- MUST NOT overwrite user-customized files without explicit confirmation
- MUST detect user customizations — compare file content against the version that was originally installed (not just the latest)
- MUST be additive — never remove files that the user may have created
- SHOULD use a simple diffing strategy (content hash comparison) rather than complex merge
- SHOULD support `--yes` flag to auto-accept all updates (for CI or power users)

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Create | `src/upgrade.ts` | Upgrade logic — diff, prompt, apply |
| Create | `src/version.ts` | Version tracking — read/write .joysmith-version |
| Modify | `src/cli.ts` | Add `upgrade` subcommand |
| Create | `tests/upgrade.test.ts` | Tests — upgrade scenarios with modified/unmodified files |

## Approach

The upgrade command:

1. Read `.joysmith-version` to determine what version was installed
2. For each file that Joysmith manages (skills + templates), compare installed content against latest bundled content
3. Categorize: unchanged (skip), changed-by-joysmith-only (auto-update), changed-by-user (show diff, ask), new (offer to add)
4. Apply accepted updates, write new `.joysmith-version`

To detect user customization vs. Joysmith updates: store content hashes of the originally installed files in `.joysmith-version` (JSON). If the current file hash matches the original hash, the user hasn't modified it → safe to auto-update. If it differs, the user customized it → ask.

**Rejected alternative:** Git-style three-way merge. Too complex for markdown files. Simple "show diff, ask user" is sufficient for v1.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| No .joysmith-version file (old install) | Treat all files as potentially user-customized, ask for each |
| User deleted a Joysmith skill | Offer to re-add it, don't force |
| User renamed a skill | Don't detect it — Joysmith only tracks its own filenames |
| Package version is same as installed | Report "already up to date", exit |
| User runs with --yes in CI | Auto-accept all updates, no prompts |
