# Add Web Scenario Template — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-stack-aware-scenario-testing-draft.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 4 files / ~150 lines

---

## What

Create a Playwright-based scenario test template for web apps. This template replaces the CLI-oriented `example-scenario.test.ts` for projects where the artifact under test is a running web server, not a binary. The scenario agent uses this template to generate tests that navigate pages, interact with UI elements, and assert on visible content — all via Playwright running headlessly.

## Why

The existing scenario template (`example-scenario.test.ts`) only supports testing CLI binaries via `spawnSync`. Web apps (Next.js, Vite, Nuxt, etc.) need a browser to test meaningfully. Without a web-specific template, the QA scenario agent cannot write meaningful holdout tests for the most common type of project.

## Acceptance Criteria

- [ ] New template file exists at `docs/templates/scenarios/example-scenario-web.spec.ts`
- [ ] Template starts a dev server (or connects to a provided URL) before tests run
- [ ] Template uses Playwright's test runner (`@playwright/test`) for assertions and browser control
- [ ] Template demonstrates: page navigation, element interaction (click, fill), content assertion, screenshot capture
- [ ] Template includes setup/teardown for the dev server process (start before all, kill after all)
- [ ] Template has a helper for configurable base URL (env var `BASE_URL` or default to `http://localhost:3000`)
- [ ] Template comments explain the holdout pattern for web apps — test the running app, never import source
- [ ] New `docs/templates/scenarios/playwright.config.ts` template provides sensible defaults (headless, chromium, base URL from env)
- [ ] `package.json` template updated: `docs/templates/scenarios/package-web.json` with `@playwright/test` as dev dependency
- [ ] Template registered in `src/bundled-files.ts` for installation
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| Template file exists | Check file exists at expected path in bundled-files | unit |
| Template registered in bundled-files | Grep for `example-scenario-web` in bundled-files.ts | unit |
| Template contains Playwright imports | Read template content, assert contains `@playwright/test` | unit |
| Template has BASE_URL configuration | Read template content, assert contains `BASE_URL` env var handling | unit |
| Playwright config template exists | Check file exists in bundled-files | unit |
| Package-web.json has playwright dep | Parse template JSON, assert `@playwright/test` in devDependencies | unit |

**Execution order:**
1. Write all tests above — they should fail (files don't exist yet)
2. Run tests to confirm they fail (red)
3. Create the template files and register them
4. Run tests until all pass (green)

**Smoke test:** `pnpm test --run -- init` — checks bundled files are registered.

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL
2. Each test checks real bundled content — not hardcoded strings
3. Identify your smoke test — it must run in seconds

## Constraints

- MUST: Use `@playwright/test` (not raw Playwright) for the template — it has the best test runner integration
- MUST: Template must work without modifications for Next.js apps (the most common web stack)
- MUST: Keep the existing CLI template (`example-scenario.test.ts`) untouched — this is additive
- MUST NOT: Require any cloud services or paid tools
- MUST NOT: Add Playwright as a dependency of Joycraft itself — it's a template that gets copied into the scenarios repo

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Add | `docs/templates/scenarios/example-scenario-web.spec.ts` | Playwright-based web scenario template |
| Add | `docs/templates/scenarios/playwright.config.ts` | Playwright configuration template |
| Add | `docs/templates/scenarios/package-web.json` | Package.json with Playwright dependency |
| Modify | `src/bundled-files.ts` | Register new template files |

## Approach

The web scenario template follows the same holdout principle as the CLI template but tests against a running server instead of a binary:

1. **Setup:** Start the dev server from `../main-repo` using `child_process.spawn` (e.g., `npm run dev`), wait for it to be ready (poll the URL)
2. **Tests:** Use Playwright's `page.goto()`, `page.click()`, `page.fill()`, `expect(page.locator(...))` to interact with the running app
3. **Teardown:** Kill the dev server process

The base URL is configurable via `BASE_URL` env var so the same tests can run against localhost (CI with dev server) or a preview deploy URL.

**Rejected alternative:** Using Playwright's Agents API (`--loop=claude`) in the template itself. The template should be a standard Playwright test that the scenario agent generates — the agent's intelligence lives in the prompt, not the template.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Dev server takes >30s to start | Template includes a configurable timeout (default 60s) with clear error message |
| Port 3000 already in use | Template checks if server is reachable before starting a new one |
| BASE_URL env var provided | Skip starting dev server, test against provided URL directly |
| Non-Next.js web app (Vite, Nuxt) | Template uses generic `npm run dev` — works for any framework with a dev script |
| Dev server crashes mid-test | Playwright test fails with connection error — expected behavior |
