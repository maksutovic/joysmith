# Fix New Feature Inline Template Consistency — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-test-first-new-feature.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 1-2 files / ~20 lines

---

## What

Add the Test Plan section (with three laws) to the inline spec template in `/joycraft-new-feature` Phase 3. Currently the decompose skill's template has it but the new-feature skill's inline template does not, meaning specs generated via the `/joycraft-new-feature` end-to-end flow may lack test plans.

## Why

Decision 6 in the brief states: "Test plan section is always present in specs." The template inconsistency means specs generated through `/joycraft-new-feature` Phase 3 (which auto-decomposes) could violate this rule. Both paths to spec generation must produce identical structure.

## Acceptance Criteria

- [ ] The inline spec template in `joycraft-new-feature.md` Phase 3 includes a Test Plan section matching the one in `joycraft-decompose.md`
- [ ] The Test Plan includes the acceptance-criteria-to-test mapping table
- [ ] The Test Plan includes execution order (red before green)
- [ ] The Test Plan includes the three harness verification rules
- [ ] The Test Plan includes smoke test identification
- [ ] Both templates produce structurally identical specs
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| Inline template includes Test Plan section | Read skill file, verify Test Plan heading exists in Phase 3 template | manual review |
| Both templates match structurally | Compare section headings between new-feature and decompose templates | manual review |
| Build passes | `pnpm build` | build |
| Tests pass | `pnpm test --run` | meta |

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL (if they pass, you're testing the wrong thing)
2. Each test calls your actual function/endpoint — not a reimplementation or the underlying library
3. Identify your smoke test — it must run in seconds, not minutes, so you get fast feedback on each change

## Constraints

- MUST: Match the Test Plan section exactly as it appears in `joycraft-decompose.md`
- MUST: Update `src/bundled-files.ts` if the new-feature skill is inlined there
- MUST NOT: Change the decompose skill's template — only bring the new-feature template into alignment

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Modify | `src/skills/joycraft-new-feature.md` | Add Test Plan section to Phase 3 inline spec template |
| Modify | `src/bundled-files.ts` | Update inlined copy if applicable |

## Approach

Copy the Test Plan section from the decompose skill's spec template into the new-feature skill's Phase 3 inline template, placed between Acceptance Criteria and Constraints.

**Rejected alternative:** Removing the inline template from new-feature and always delegating to decompose. This would break the end-to-end flow for users who want new-feature to handle everything.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| User runs /joycraft-new-feature end-to-end | Specs generated include Test Plan section |
| User runs /joycraft-decompose separately | Specs generated include Test Plan section (already works) |
