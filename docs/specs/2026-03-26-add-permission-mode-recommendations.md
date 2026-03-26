# Add Permission Mode Recommendations — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-test-first-new-feature.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 2 files / ~40 lines

---

## What

Update `/joycraft-lockdown` and `/joycraft-tune` to recommend Claude Code permission modes (`auto`, `dontAsk`, `acceptEdits`) alongside the existing CLAUDE.md deny patterns. Users should understand they don't need `--dangerously-skip-permissions` and can use safer alternatives.

## Why

Most Joycraft users run `--dangerously-skip-permissions` because they don't know about the safer alternatives. Claude Code's `auto` mode provides a safety classifier, and `dontAsk` mode with an explicit allowlist gives full autonomy without bypassing all safety checks. Recommending the right mode based on the user's risk profile makes autonomous development safer.

## Acceptance Criteria

- [ ] `/joycraft-lockdown` output includes a permission mode recommendation alongside deny patterns
- [ ] For lockdown mode: recommends `dontAsk` with explicit allowlist (most restrictive)
- [ ] `/joycraft-tune` risk interview includes permission mode recommendation based on answers
- [ ] For low-risk projects: recommends `auto` mode
- [ ] For high-risk projects (production DBs, live APIs): recommends `dontAsk` with tight allowlist
- [ ] Both skills explain why `--dangerously-skip-permissions` is usually unnecessary
- [ ] Includes a brief decision matrix: when to use `auto` vs `dontAsk` vs `acceptEdits`
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| Lockdown includes permission mode recommendation | Read skill file, verify permission mode section exists | manual review |
| Tune includes permission mode recommendation | Read skill file, verify permission mode guidance in risk interview output | manual review |
| Decision matrix present | Verify table/list comparing modes exists in both skills | manual review |
| Build passes | `pnpm build` | build |
| Tests pass | `pnpm test --run` | meta |

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL (if they pass, you're testing the wrong thing)
2. Each test calls your actual function/endpoint — not a reimplementation or the underlying library
3. Identify your smoke test — it must run in seconds, not minutes, so you get fast feedback on each change

## Constraints

- MUST: Present permission modes as recommendations, not requirements
- MUST: Explain the tradeoffs clearly (auto = classifier overhead but safer; dontAsk = zero overhead but requires careful allowlist)
- MUST: Update `src/bundled-files.ts` if skills are inlined there
- MUST NOT: Auto-change the user's permission mode — just recommend

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Modify | `src/skills/joycraft-lockdown.md` | Add permission mode recommendation section |
| Modify | `src/skills/joycraft-tune.md` | Add permission mode recommendation to risk interview output |
| Modify | `src/bundled-files.ts` | Update inlined copies |

## Approach

Add a "Permission Mode" section to the lockdown skill's output, after the deny patterns. Include a simple decision matrix:

```
## Recommended Permission Mode

| Your situation | Use | Why |
|---|---|---|
| Autonomous spec execution | `--permission-mode dontAsk` + allowlist above | Only pre-approved commands run |
| Long session with some trust | `--permission-mode auto` | Safety classifier reviews each action |
| Interactive development | `--permission-mode acceptEdits` | Auto-approves file edits, prompts for commands |

You do NOT need `--dangerously-skip-permissions`. The modes above provide autonomy with safety.
```

For the tune skill, add permission mode guidance after the git autonomy question in the risk interview.

**Rejected alternative:** Auto-detecting the current permission mode and warning if unsafe. This would require runtime checks that skills can't do — skills are just markdown guidance.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| User is already using auto mode | Recommendation affirms their choice |
| User insists on --dangerously-skip-permissions | Skill notes it's their choice but explains safer alternatives |
| User doesn't understand permission modes | Decision matrix + one-line explanations make it accessible |
