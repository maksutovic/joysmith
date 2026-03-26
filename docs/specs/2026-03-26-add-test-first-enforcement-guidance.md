# Add Test-First Enforcement Guidance — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-test-first-new-feature.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 1-2 files / ~10 lines

---

## What

Add "Run tests and confirm they fail before writing implementation code" as an ALWAYS rule in the CLAUDE.md that Joycraft generates for user projects. This provides test-first enforcement as a behavioral boundary, not just spec guidance.

## Why

Anthropic's research found agents "reliably skip" verification unless explicitly prompted. The three laws appear in spec templates, but an agent in a fresh session might not read the spec's Test Plan carefully. An ALWAYS rule in CLAUDE.md is seen by the agent on every session start and acts as a persistent behavioral constraint.

## Acceptance Criteria

- [ ] Joycraft-generated CLAUDE.md includes an ALWAYS rule: "Run tests before implementing — confirm they fail first, then implement until they pass"
- [ ] The rule appears in the ALWAYS section alongside existing rules like "Run tests before committing"
- [ ] The `init.ts` or `improve-claude-md.ts` generates this rule
- [ ] Existing CLAUDE.md files get the rule added via the merge/improve logic on upgrade
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| Generated CLAUDE.md includes test-first rule | Run init on a temp dir, read generated CLAUDE.md, assert rule exists | unit |
| Rule appears in ALWAYS section | Parse generated CLAUDE.md, verify rule is in the ALWAYS block | unit |
| Build passes | `pnpm build` | build |
| Tests pass | `pnpm test --run` | meta |

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL (if they pass, you're testing the wrong thing)
2. Each test calls your actual function/endpoint — not a reimplementation or the underlying library
3. Identify your smoke test — it must run in seconds, not minutes, so you get fast feedback on each change

## Constraints

- MUST: Keep the rule concise — one line, actionable
- MUST: Place in ALWAYS section (not NEVER or ASK FIRST)
- MUST: Work with the existing CLAUDE.md merge logic (append, don't overwrite)
- MUST NOT: Make the rule so aggressive it blocks projects without tests — it's guidance for spec-driven development

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Modify | `src/bundled-files.ts` or `src/init.ts` | Add the test-first ALWAYS rule to generated CLAUDE.md content |

## Approach

Find where the ALWAYS rules are defined in the CLAUDE.md generation (likely in `bundled-files.ts` or `init.ts`) and add one line:

```
- Run tests before implementing new features — confirm they fail first, then implement until they pass
```

Place it after the existing "Run [test command] before committing" rule since it's a natural companion.

**Rejected alternative:** Adding this as a pre-commit hook that checks test results. Hooks are too invasive and many users dislike them (decision 2 in the brief). A CLAUDE.md ALWAYS rule achieves the same guidance without tooling.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Project has no tests yet | Rule still appears — it guides the agent to write tests first when specs include a Test Plan |
| User removes the rule from their CLAUDE.md | Their choice — Joycraft won't re-add on upgrade if they deliberately removed it |
