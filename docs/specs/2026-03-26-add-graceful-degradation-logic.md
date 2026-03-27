# Add Graceful Degradation Logic — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-stack-aware-scenario-testing-draft.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 2 files / ~60 lines
> **Depends on:** `update-scenario-agent-prompt` (spec 5)

---

## What

Add layer-based fallback logic to the scenario agent prompt. When the primary testing backbone isn't available (e.g., no Playwright installed, no simulator running), the agent gracefully degrades to the next deepest testable layer: UI -> API -> Logic -> Static Analysis. This ensures the QA agent always produces something useful, even in constrained environments.

## Why

Not every CI environment or developer machine has Playwright or a mobile simulator available. Without fallback logic, the scenario agent would fail silently or produce tests that can't run. Graceful degradation means the agent always generates tests at the deepest layer the environment supports — API tests when there's no browser, logic tests when there's no server, static checks when there's no test runner.

## Acceptance Criteria

- [ ] Scenario agent prompt includes a "Graceful Degradation" section explaining the four layers
- [ ] Layer definitions: Layer 4 (UI — browser/simulator), Layer 3 (API — HTTP requests), Layer 2 (Logic — unit tests via test runner), Layer 1 (Static — build/typecheck/lint)
- [ ] Agent is instructed to check tool availability before generating tests (e.g., "if Playwright is not in the scenarios repo package.json, fall back to API testing")
- [ ] Fallback rules are concrete: Playwright unavailable -> generate fetch-based API tests; Maestro unavailable -> generate API tests if server exists, else logic tests
- [ ] Agent includes a "Testing Layer" comment at the top of each generated test file indicating which layer it's testing at
- [ ] Agent reports in its commit message which layer it fell back to and why
- [ ] The generate workflow passes available tool information (what's installed in the scenarios repo) to the agent
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| Prompt contains degradation section | Read prompt, assert contains "Graceful Degradation" or "Testing Layers" | unit |
| Prompt defines all four layers | Read prompt, assert contains "Layer 4", "Layer 3", "Layer 2", "Layer 1" (or equivalent) | unit |
| Prompt has concrete fallback rules | Read prompt, assert contains fallback instructions for missing Playwright and missing Maestro | unit |
| Prompt instructs layer comment in test files | Read prompt, assert contains instruction about "Testing Layer" comment | unit |

**Execution order:**
1. Write all tests above — they should fail (prompt doesn't have degradation content yet)
2. Run tests to confirm they fail (red)
3. Add degradation section to the prompt
4. Run tests until all pass (green)

**Smoke test:** `pnpm test --run -- init` — checks bundled file content.

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL
2. Each test reads the actual bundled template content
3. Identify your smoke test — it must run in seconds

## Constraints

- MUST: Degradation is always downward (UI -> API -> Logic -> Static), never upward
- MUST: Each generated test file includes a comment indicating its testing layer
- MUST: Fallback decisions are based on what's available in the scenarios repo (package.json deps, installed tools), not the main repo
- MUST NOT: Skip testing entirely — Layer 1 (static analysis) is always available as a floor
- MUST NOT: Make the degradation logic complex — simple if/else based on tool presence

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Modify | `docs/templates/scenarios/prompts/scenario-agent.md` | Add Graceful Degradation section with layer definitions and fallback rules |
| Modify | `src/bundled-files.ts` | Updated content for modified template |

## Approach

Add a "Graceful Degradation" section to the scenario agent prompt between the backbone instructions and the checklist. The section defines:

1. **The four layers** with clear descriptions
2. **Detection rules:** "Check the scenarios repo `package.json` for `@playwright/test`. If absent, you cannot generate Layer 4 web tests."
3. **Fallback chain:** For each backbone, what to fall back to:
   - `playwright` -> `api` -> `logic` -> `static`
   - `maestro` -> `api` (if server exists) -> `logic` -> `static`
   - `api` -> `logic` -> `static`
   - `native` -> `static`
4. **Reporting:** "Start each test file with `// Testing Layer: [N] - [name]`" and "Include in your commit message: `layer: [N] ([reason])`"

**Rejected alternative:** Making degradation automatic in the CI workflow (try Playwright, if it fails try API, etc.). This would be slow and wasteful. Better for the agent to check availability upfront and generate the right tests the first time.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Scenarios repo has no dependencies at all | Fall to Layer 1 — run build/typecheck only |
| Playwright installed but no dev server start script | Fall to Layer 2 — test logic directly |
| Maestro installed but no simulator available | Agent can't detect this from package.json alone — note in README that simulator must be running |
| Spec is purely internal (no user-facing behavior) | SKIP decision in triage — degradation doesn't apply |
