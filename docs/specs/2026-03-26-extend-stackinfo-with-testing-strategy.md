# Extend StackInfo with Testing Strategy — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-stack-aware-scenario-testing-draft.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 3 files / ~80 lines

---

## What

Add a `testingStrategy` field to the `StackInfo` interface returned by `detectStack()`. This field describes the testing backbone appropriate for the detected stack: what tool the QA scenario agent should use (Playwright, Maestro, native runner), what test format it should generate, and which testing layers are available (UI, API, logic, static).

## Why

The Level 5 scenario QA agent currently assumes all projects can be tested by running a CLI binary via `spawnSync`. This breaks for web apps (need a browser), mobile apps (need a simulator), and API backends (need HTTP requests). Without stack-aware testing strategy metadata, the scenario agent has no way to know what kind of tests to generate.

## Acceptance Criteria

- [ ] `StackInfo` interface has a new optional `testingStrategy` field with a defined `TestingStrategy` type
- [ ] `TestingStrategy` type includes: `backbone` (the primary tool name), `testFormat` (file extension/format), `layers` (array of available testing layers from deepest to shallowest)
- [ ] `detectNode()` sets `testingStrategy` based on framework: Next.js/Nuxt/Remix/React/Vue/Svelte/Express/Fastify each get the appropriate backbone
- [ ] Web framework stacks (Next.js, Nuxt, Remix, React, Vue, Svelte) get `backbone: 'playwright'`
- [ ] API-only framework stacks (Express, Fastify) get `backbone: 'api'`
- [ ] Non-framework Node.js projects (libraries/CLIs) get `backbone: 'native'`
- [ ] `detectPython()` sets `testingStrategy`: web frameworks (FastAPI, Django, Flask) get `backbone: 'api'`, others get `backbone: 'native'`
- [ ] `detectRust()`, `detectGo()`, `detectSwift()` set `backbone: 'native'`
- [ ] React Native detection (check for `react-native` in deps) sets `backbone: 'maestro'`
- [ ] Flutter detection (new `detectFlutter()` for `pubspec.yaml`) sets `backbone: 'maestro'`
- [ ] Xcode project detection (`.xcodeproj` or `*.xcworkspace`) sets `backbone: 'maestro'`
- [ ] Existing tests continue to pass
- [ ] New tests cover each detection path
- [ ] Build passes

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| StackInfo has testingStrategy field | Type-check compiles with new field | unit |
| Next.js gets playwright backbone | detectStack on fixture with next dep returns testingStrategy.backbone === 'playwright' | unit |
| Express gets api backbone | detectStack on fixture with express dep returns testingStrategy.backbone === 'api' | unit |
| Plain Node.js gets native backbone | detectStack on fixture with no framework returns testingStrategy.backbone === 'native' | unit |
| React Native gets maestro backbone | detectStack on fixture with react-native dep returns testingStrategy.backbone === 'maestro' | unit |
| Flutter gets maestro backbone | detectStack on fixture with pubspec.yaml returns testingStrategy.backbone === 'maestro' | unit |
| Python FastAPI gets api backbone | detectStack on fixture with fastapi in pyproject.toml returns testingStrategy.backbone === 'api' | unit |
| Rust/Go/Swift get native backbone | detectStack on respective fixtures returns testingStrategy.backbone === 'native' | unit |
| Layers array populated correctly | Web frameworks include all 4 layers, API frameworks include layers 1-3, native includes layers 1-2 | unit |

**Execution order:**
1. Write all tests above — they should fail against current code (no testingStrategy field yet)
2. Run tests to confirm they fail (red)
3. Implement the TestingStrategy type and detection logic
4. Run tests until all pass (green)

**Smoke test:** `pnpm test --run -- detect` — runs only detect tests, fast feedback.

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL (if they pass, you're testing the wrong thing)
2. Each test calls `detectStack()` — not a reimplementation
3. Identify your smoke test — it must run in seconds

## Constraints

- MUST: Keep `testingStrategy` optional on `StackInfo` so existing code that doesn't use it isn't affected
- MUST: Add Flutter detection (`pubspec.yaml`) and Xcode detection (`.xcodeproj`/`.xcworkspace`) as new detectors
- MUST: React Native is detected from `package.json` deps, not a separate detector — it's a Node.js project with `react-native` in deps
- MUST NOT: Change the behavior of any existing detection — this is purely additive
- MUST NOT: Add any runtime dependencies

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Modify | `src/detect.ts` | Add `TestingStrategy` type, `testingStrategy` field to `StackInfo`, populate in each detector, add Flutter/Xcode detectors |
| Modify | `tests/detect.test.ts` | Add tests for each testingStrategy mapping |
| Add | `tests/fixtures/flutter/pubspec.yaml` | Minimal Flutter pubspec fixture |
| Add | `tests/fixtures/react-native/package.json` | Minimal React Native package.json fixture |
| Add | `tests/fixtures/xcode/` | Minimal .xcodeproj marker for detection |

## Approach

Add the `TestingStrategy` interface alongside `StackInfo`:

```typescript
export interface TestingStrategy {
  backbone: 'playwright' | 'maestro' | 'api' | 'native';
  testFormat: string; // e.g., '.spec.ts', '.yaml', '.test.ts'
  layers: ('ui' | 'api' | 'logic' | 'static')[];
}
```

Each existing detector function returns `testingStrategy` as part of its `StackInfo`. For Node.js, the decision depends on both the framework and the presence of `react-native` in deps. React Native takes priority over the framework detection (a project with both `next` and `react-native` is a mobile app).

**Rejected alternative:** Making `testingStrategy` required on `StackInfo`. This would break the `unknown` fallback case and force all detectors to provide a strategy even when one can't be meaningfully determined.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Project has both `next` and `react-native` in deps | `react-native` wins — backbone is `maestro` |
| Unknown language/framework | `testingStrategy` is undefined (not set) |
| Monorepo root with no framework | backbone is `native` based on language |
| Flutter project with no framework field | Detected by `pubspec.yaml` + `flutter` in dependencies |
| Xcode project without Package.swift | Detected by `.xcodeproj` directory presence |
