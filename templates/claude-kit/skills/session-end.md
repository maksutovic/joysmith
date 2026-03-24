---
name: session-end
description: Wrap up a session — capture discoveries, verify, prepare for PR or next session
---

# Session Wrap-Up

Before ending this session:

## 1. Capture Discoveries

Check: did anything surprising happen during this session? If yes, create or update `DISCOVERIES.md` in the current branch root (or `docs/discoveries/YYYY-MM-DD-topic.md` for long-running work).

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

Format:
```markdown
# Discoveries — [topic]

**Date:** YYYY-MM-DD
**Spec:** [link to spec if applicable]

## [Discovery title]
**Expected:** [what we thought would happen]
**Actual:** [what actually happened]
**Impact:** [what this means for future work]
```

If nothing surprising happened, skip DISCOVERIES.md entirely. No discovery is a good sign — the spec was accurate.

## 2. Run Validation

- Type-check: `[use project-specific command from CLAUDE.md]`
- Tests: `[use project-specific command from CLAUDE.md]`
- Lint: `[use project-specific command from CLAUDE.md]`

## 3. Update Spec Status

If working from an atomic spec, update its status:
- All acceptance criteria met → Status: Complete
- Partially done → Status: In Progress, note what's left

If working from a Feature Brief, check off completed specs in the decomposition table.

## 4. Commit

Commit all changes including DISCOVERIES.md (if created). The commit message should reference the spec.

## 5. Report

```
Session complete.
- Spec: [spec name] — [Complete / In Progress]
- Build: [passing / failing]
- Discoveries: [N items / none]
- Next: [what the next session should tackle, or "ready for PR"]
```
