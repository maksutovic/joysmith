# Create Verify Skill — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-test-first-new-feature.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 2-3 files / ~100 lines

---

## What

Create a new `/joycraft-verify` skill that spawns a separate subagent to independently verify an implementation against its spec. The verifier reads the spec's acceptance criteria and test plan, runs the tests, and produces a pass/fail verdict with evidence. It does NOT write or modify any code — it only reads and runs tests.

## Why

Anthropic's research found that "agents reliably skew positive when grading their own work" and that "separating the agent doing the work from the agent judging it consistently outperformed self-evaluation." The implementation agent has incentive (context bias) to believe its work is correct. A separate verifier with a clean context window provides an independent second opinion.

## Acceptance Criteria

- [ ] New skill file exists at `src/skills/joycraft-verify.md`
- [ ] Skill accepts a spec path as input (or finds the most recent spec)
- [ ] Skill spawns a subagent (using Claude Code's Agent/teammate feature) with read-only + test-run permissions
- [ ] Subagent reads the spec's acceptance criteria and test plan
- [ ] Subagent runs the test commands identified in the spec's test plan
- [ ] Subagent checks each acceptance criterion and marks pass/fail with evidence
- [ ] Subagent produces a structured verdict: which criteria passed, which failed, and why
- [ ] The verifier subagent CANNOT edit source code or test files — read-only + run tests only
- [ ] Skill outputs the verdict to the user for review
- [ ] Skill is registered in `src/bundled-files.ts` for installation
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| Skill file exists | Check file exists at expected path after init | unit |
| Skill registered in bundled-files | Grep for joycraft-verify in bundled-files.ts | unit |
| Skill produces structured verdict | Manual test: run /joycraft-verify against a completed spec | manual |
| Verifier cannot edit code | Manual test: verify subagent instructions include read-only constraint | manual review |
| Build passes | `pnpm build` | build |
| Tests pass | `pnpm test --run` | meta |

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL (if they pass, you're testing the wrong thing)
2. Each test calls your actual function/endpoint — not a reimplementation or the underlying library
3. Identify your smoke test — it must run in seconds, not minutes, so you get fast feedback on each change

## Constraints

- MUST: Verifier runs as a separate subagent with clean context — not in the current session
- MUST: Verifier is read-only for code and tests — can only run test commands, not edit files
- MUST: Verdict is structured (not prose) — each criterion gets pass/fail + evidence
- MUST: Work with Claude Code's existing Agent/teammate feature (no SDK required)
- MUST NOT: Auto-fix failures — the verifier reports, the human decides what to do
- MUST NOT: Require any specific test framework — works by running whatever commands the spec identifies

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Create | `src/skills/joycraft-verify.md` | New skill with verification flow |
| Modify | `src/bundled-files.ts` | Register skill content |

## Approach

The skill flow:

1. **Find the spec:** Accept a path argument, or scan `docs/specs/` for the most recently modified spec with status "Complete" or "In Progress"

2. **Extract verification criteria:** Parse the spec's Acceptance Criteria and Test Plan sections

3. **Spawn verifier subagent:** Use Claude Code's teammate/subagent feature with instructions:
   ```
   You are a QA verifier. Your job is to independently verify this implementation.

   RULES:
   - You may READ any file
   - You may RUN test commands listed below
   - You may NOT edit, create, or delete any files
   - You may NOT install packages or access the network
   - Report what you observe, not what you expect

   SPEC: [spec content]
   TEST COMMANDS: [from spec's test plan]
   ACCEPTANCE CRITERIA: [from spec]

   For each criterion, report:
   - PASS or FAIL
   - Evidence (test output, file content, observed behavior)
   - If FAIL: what specifically is wrong
   ```

4. **Collect and format verdict:** The subagent returns its findings. The skill formats them as:
   ```
   Verification Report — [spec name]

   | # | Criterion | Verdict | Evidence |
   |---|-----------|---------|----------|
   | 1 | GET returns preferences | PASS | Test passed: 200 response with correct JSON shape |
   | 2 | New users get defaults | FAIL | Test failed: returns 500 instead of creating defaults |

   Overall: 5/7 criteria passed. 2 failures need attention.
   ```

5. **Hand off:** Show the verdict and suggest next steps: fix the failures, or if all pass, proceed to commit/PR.

**Rejected alternative:** Running the verifier in the same session with "pretend you haven't seen the implementation." Self-evaluation doesn't work — Anthropic proved this. A separate subagent with clean context is essential.

**Rejected alternative:** Making verification automatic (always runs after implementation). This should be opt-in — not every small change needs formal verification. The user invokes it when they want confidence.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Spec has no Test Plan | Verifier can still check acceptance criteria by reading code and running any available tests, but warns that without a test plan, verification is weaker |
| All tests pass but a criterion isn't testable | Verifier marks as "MANUAL CHECK NEEDED" with explanation |
| Subagent can't run tests (missing dependencies) | Reports the error as a FAIL with evidence (the error message) |
| No specs found | Skill tells the user to specify a spec path or create one first |
| Spec is already marked Complete | Still runs verification — "Complete" means the implementer thinks it's done, verification confirms |
