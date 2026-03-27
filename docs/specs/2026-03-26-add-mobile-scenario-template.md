# Add Mobile Scenario Template — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-stack-aware-scenario-testing-draft.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 3 files / ~120 lines

---

## What

Create a Maestro YAML-based scenario template for mobile apps (React Native, Flutter, native iOS/Android). This template shows the QA scenario agent how to generate declarative YAML test flows that interact with a running app on a simulator/emulator. The template covers the core Maestro commands and demonstrates the holdout pattern applied to mobile: test the built app's behavior, never reference source code.

## Why

Mobile apps cannot be tested by running a CLI binary or hitting HTTP endpoints — they need a simulator/emulator with the app installed. Without a mobile-specific template, the QA scenario agent has no guidance for generating meaningful holdout tests for the ~50% of projects that include a mobile component. Maestro's YAML format is the most LLM-friendly mobile testing format available (15 core commands, declarative, no code).

## Acceptance Criteria

- [ ] New template file exists at `docs/templates/scenarios/example-scenario-mobile.yaml`
- [ ] Template demonstrates core Maestro commands: `launchApp`, `tapOn`, `inputText`, `assertVisible`, `assertNotVisible`, `scroll`, `back`
- [ ] Template includes metadata section with `appId` placeholder and descriptive `name`
- [ ] Template includes comments explaining the holdout pattern for mobile — test the running app, never reference source
- [ ] Template shows how to use `assertWithAI` for natural-language assertions
- [ ] Template shows how to use `runFlow` for modular test composition
- [ ] New `docs/templates/scenarios/example-scenario-mobile-login.yaml` shows a reusable sub-flow (login) that other flows reference
- [ ] A `docs/templates/scenarios/README-mobile.md` explains Maestro setup (install CLI, boot simulator, run flows) and CI options
- [ ] Templates registered in `src/bundled-files.ts` for installation
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| Mobile template file exists | Check file exists at expected path in bundled-files | unit |
| Login sub-flow template exists | Check file exists in bundled-files | unit |
| Templates registered in bundled-files | Grep for `example-scenario-mobile` in bundled-files.ts | unit |
| Mobile template contains core commands | Read template, assert contains `launchApp`, `tapOn`, `assertVisible` | unit |
| Mobile template contains assertWithAI | Read template, assert contains `assertWithAI` | unit |
| README-mobile template exists | Check file exists in bundled-files | unit |

**Execution order:**
1. Write all tests above — they should fail (files don't exist yet)
2. Run tests to confirm they fail (red)
3. Create the template files and register them
4. Run tests until all pass (green)

**Smoke test:** `pnpm test --run -- init` — checks bundled files are registered.

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL
2. Each test checks real bundled content
3. Identify your smoke test — it must run in seconds

## Constraints

- MUST: Use Maestro's current YAML syntax (v2.3+) — spaces for indentation, never tabs
- MUST: Keep templates framework-agnostic — they should work for React Native, Flutter, and native apps
- MUST: Include `assertWithAI` examples since this is the most LLM-friendly assertion mechanism
- MUST: The README-mobile template must clearly state that Maestro + simulator setup is the user's responsibility, not Joycraft's
- MUST NOT: Include Detox templates — Maestro is the single mobile testing backbone
- MUST NOT: Assume any paid services (Maestro Cloud is mentioned as optional, never required)

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Add | `docs/templates/scenarios/example-scenario-mobile.yaml` | Main Maestro scenario template |
| Add | `docs/templates/scenarios/example-scenario-mobile-login.yaml` | Reusable login sub-flow template |
| Add | `docs/templates/scenarios/README-mobile.md` | Mobile testing setup guide |
| Modify | `src/bundled-files.ts` | Register new template files |

## Approach

The Maestro templates demonstrate the holdout pattern for mobile: the scenario agent generates YAML flows that exercise the app through its UI, asserting on visible text and screen state. The templates cover:

1. **Main flow template:** A complete example testing a core user journey (e.g., "sign up, see dashboard, navigate to settings")
2. **Sub-flow template:** A reusable login flow that other flows include via `runFlow`
3. **README:** Setup instructions for Maestro CLI, simulator/emulator, and CI options

The `appId` is a placeholder (`com.example.myapp`) that the scenario agent replaces based on the project's actual bundle identifier.

**Rejected alternative:** Generating both Maestro YAML and Detox JavaScript templates. Maestro covers all mobile stacks (RN, Flutter, native) with a simpler format. Supporting two frameworks would double the template surface for marginal benefit.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| App requires login for all flows | Template shows `runFlow: login.yaml` pattern at the start of each flow |
| App has no text-based elements (game, canvas) | `assertWithAI` handles this — "verify the game board is visible" |
| Simulator not running | Maestro errors clearly — README explains this prerequisite |
| iOS physical device | README notes this is not supported (simulator only) |
| App uses non-English locale | Template shows `assertVisible` with locale-aware text matching |
