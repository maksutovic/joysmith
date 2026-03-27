# Update Scenario Agent Prompt — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-stack-aware-scenario-testing-draft.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 3 files / ~200 lines
> **Depends on:** `extend-stackinfo-with-testing-strategy` (spec 1)

---

## What

Update the scenario agent prompt (`docs/templates/scenarios/prompts/scenario-agent.md`) to be stack-aware. Instead of always generating CLI-based vitest scenarios, the agent now receives the project's testing strategy (from `StackInfo.testingStrategy`) and selects the appropriate template and test format. For web apps it generates Playwright specs, for mobile apps it generates Maestro YAML flows, for APIs it generates HTTP request tests, and for CLIs/libraries it continues generating the existing vitest+spawnSync tests.

## Why

The scenario agent prompt is the brain of the holdout testing system. It currently has a single code path: "invoke the built binary via `spawnSync`." Without stack-aware routing, the agent generates useless tests for web and mobile projects — tests that try to run `node dist/cli.js` against a Next.js app.

## Acceptance Criteria

- [ ] `scenario-agent.md` prompt includes a "Stack Detection" section that explains the testing strategy metadata
- [ ] Prompt includes a decision matrix: backbone → template → test format → assertions
- [ ] When backbone is `playwright`: agent is instructed to generate `.spec.ts` files using Playwright test syntax, testing against a running server URL
- [ ] When backbone is `maestro`: agent is instructed to generate `.yaml` flow files using Maestro syntax, testing against a simulator
- [ ] When backbone is `api`: agent is instructed to generate `.test.ts` files using fetch-based HTTP requests against a running server
- [ ] When backbone is `native` (or unset): agent uses the existing CLI/binary testing approach (current behavior preserved)
- [ ] The testing strategy is passed to the agent via the `repository_dispatch` payload in the generate workflow
- [ ] `docs/templates/scenarios/workflows/generate.yml` updated to accept and forward `testing_strategy` in the dispatch payload
- [ ] `docs/templates/scenarios/prompts/scenario-agent.md` includes template snippets for each backbone type (so the agent has examples to follow)
- [ ] The triage decision tree (SKIP/NEW/UPDATE) remains unchanged — it's stack-independent
- [ ] Existing CLI test generation behavior is preserved when backbone is `native` or unset
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| Prompt contains stack detection section | Read prompt template, assert contains "Stack Detection" or "Testing Strategy" | unit |
| Prompt contains all four backbone instructions | Read prompt, assert contains 'playwright', 'maestro', 'api', 'native' | unit |
| Prompt has template snippets for each backbone | Read prompt, assert contains Playwright import, Maestro launchApp, fetch, spawnSync | unit |
| Generate workflow accepts testing_strategy | Read generate.yml, assert `testing_strategy` in inputs or dispatch payload | unit |
| Triage decision tree preserved | Read prompt, assert SKIP/NEW/UPDATE sections still present | unit |
| Native backbone instructions match existing | Compare native section to current prompt content — should be equivalent | unit |

**Execution order:**
1. Write all tests above — they should fail (prompt doesn't have stack-aware content yet)
2. Run tests to confirm they fail (red)
3. Update the prompt and workflow templates
4. Run tests until all pass (green)

**Smoke test:** `pnpm test --run -- init` — checks bundled files content.

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL
2. Each test reads the actual bundled template content
3. Identify your smoke test — it must run in seconds

## Constraints

- MUST: Preserve the existing triage decision tree (SKIP/NEW/UPDATE) unchanged
- MUST: The native/CLI path must produce identical behavior to the current prompt — no regressions
- MUST: Each backbone section includes a complete test file template (not just instructions)
- MUST: The prompt must be self-contained — the scenario agent can't read other files for guidance
- MUST NOT: Make the prompt overly long — keep each backbone section concise with one template example
- MUST NOT: Change the holdout principle — the agent still cannot import from main repo source

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Modify | `docs/templates/scenarios/prompts/scenario-agent.md` | Add stack detection section, backbone-specific instructions, template snippets |
| Modify | `docs/templates/scenarios/workflows/generate.yml` | Accept `testing_strategy` in dispatch payload, pass to agent prompt |
| Modify | `src/bundled-files.ts` | Updated content for modified templates |

## Approach

The prompt is restructured into sections:

1. **Header** (unchanged): "You are a QA engineer..."
2. **Stack Detection** (new): Explains what `testingStrategy` means and how to use it
3. **Triage Decision Tree** (unchanged): SKIP/NEW/UPDATE
4. **Test Writing Rules — by Backbone** (new): Four sections, one per backbone, each with:
   - What tool to use
   - What file format to generate
   - A complete template example
   - Assertion patterns specific to that backbone
5. **Checklist** (updated): Add "Correct backbone selected" to the checklist

The generate workflow passes `testing_strategy` as a JSON string in the `repository_dispatch` client payload. The prompt template includes a `$TESTING_STRATEGY` placeholder that gets substituted.

**Rejected alternative:** Creating four separate prompt files (one per backbone). This would complicate the generate workflow and make it harder to maintain consistent triage logic. A single prompt with backbone sections is more maintainable.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| `testing_strategy` not provided in dispatch | Default to `native` backbone (backwards compatible) |
| Unknown backbone value | Default to `native` backbone with a warning comment in generated test |
| Spec describes both API and UI changes | Agent picks the deepest testable layer — UI if available, else API |
| Monorepo with multiple stacks | The dispatch includes the strategy for the specific app being tested |
