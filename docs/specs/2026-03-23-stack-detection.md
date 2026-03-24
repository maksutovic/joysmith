# Detect Tech Stack from Manifest Files — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-23-joysmith-cli-plugin.md`
> **Status:** Ready
> **Date:** 2026-03-23
> **Estimated scope:** 1 session / 2-3 files / ~150 lines

---

## What

Build a `detectStack()` function that reads a project directory, identifies the tech stack from manifest files, and returns a structured object with build, test, lint, and deploy commands. This is the foundation that `joysmith init` uses to populate CLAUDE.md with correct project-specific commands.

## Why

Every CLAUDE.md needs accurate build/test/lint commands. Without auto-detection, users have to fill these in manually — which means most won't, and the harness is immediately less useful.

## Acceptance Criteria

- [ ] Detects Node.js projects (package.json) — identifies package manager (npm, pnpm, yarn, bun) from lockfile
- [ ] Detects Python projects (pyproject.toml, setup.py, requirements.txt) — identifies tool (poetry, pip, uv)
- [ ] Detects Rust projects (Cargo.toml)
- [ ] Detects Go projects (go.mod)
- [ ] Detects Swift projects (Package.swift)
- [ ] Detects generic projects (Makefile, Dockerfile) as fallback
- [ ] Returns a `StackInfo` object with: language, packageManager, commands (build, test, lint, typecheck, deploy), framework (if detectable — e.g., Next.js, FastAPI, Actix)
- [ ] Returns sensible defaults when a manifest exists but specific tools are ambiguous
- [ ] Returns `null` / unknown gracefully when no manifest is found (doesn't crash)
- [ ] Unit tests cover all supported stacks + the unknown fallback
- [ ] Build passes
- [ ] Tests pass

## Constraints

- MUST be a pure function — reads filesystem, returns data, no side effects
- MUST NOT install or run any project dependencies — detection is from file contents only
- MUST handle monorepos (multiple manifests) — detect the root/primary stack
- SHOULD detect frameworks from dependencies (e.g., `next` in package.json → Next.js, `fastapi` in pyproject.toml → FastAPI)
- SHOULD detect test frameworks (vitest, jest, pytest, cargo test, go test)

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Create | `src/detect.ts` | `detectStack()` function + `StackInfo` type |
| Create | `tests/detect.test.ts` | Unit tests for all supported stacks |
| Create | `tests/fixtures/` | Minimal manifest files for each stack (package.json, Cargo.toml, etc.) |

## Approach

Read the project directory for known manifest files in priority order. For each detected manifest, parse it (JSON for package.json, TOML for Cargo.toml/pyproject.toml, etc.) to extract framework and tooling info. Return a `StackInfo` object.

Priority order when multiple manifests exist: package.json > pyproject.toml > Cargo.toml > go.mod > Package.swift > Makefile.

**Rejected alternative:** Running `npm --version`, `cargo --version`, etc. to detect installed tools. This requires the tools to be installed, which we can't assume.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| No manifest files found | Return `{ language: 'unknown', commands: {} }` with empty commands |
| Monorepo with package.json + pyproject.toml | Prioritize package.json (root manifest), note secondary stacks |
| package.json exists but no lockfile | Default to npm |
| pyproject.toml with both poetry and setuptools config | Prefer poetry if `[tool.poetry]` section exists |
| Empty package.json (no scripts, no deps) | Return Node.js with default commands (`npm test`, `npm run build`) |
