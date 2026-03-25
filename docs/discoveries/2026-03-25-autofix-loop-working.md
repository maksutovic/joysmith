# Discovery: Level 5 Auto-Fix Loop Working End-to-End

**Date:** 2026-03-25
**Impact:** Validated the full Level 5 pattern. Ready to productize in Joycraft.

## Key Fixes to Apply to Joycraft's Workflow Templates

1. **No duplicate `env:` blocks** — merge all env vars into a single `env:` per step
2. **Don't use `--model` with Claude Code CLI** — it's not an API wrapper, has its own model resolution
3. **All workflows must be on `main`** for `repository_dispatch` to trigger
4. **pnpm/action-setup + packageManager conflict** — use `packageManager` in package.json, remove explicit `version:` from action
5. **Comment identity is cosmetic** — scenarios repo uses PAT (shows as repo owner), could use App token for cleaner attribution

## Validated Architecture

```
PR → CI (internal tests) → pass → dispatch to scenarios repo
→ 18 holdout tests → FAIL → dispatch scenario-failed to main repo
→ autofix workflow → GitHub App token → claude -p → fix → push
→ CI re-runs → dispatch to scenarios → 18 tests PASS
→ Total: ~3 minutes, one iteration, zero human intervention
```
