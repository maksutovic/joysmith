# Add API Scenario Template — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-stack-aware-scenario-testing-draft.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 2 files / ~100 lines

---

## What

Create an HTTP request-based scenario test template for API-only backends (Express, FastAPI, Django, Flask, Gin, etc.). This template shows the QA scenario agent how to generate tests that start the server, send HTTP requests, and assert on responses — without importing any source code. It bridges the gap between the CLI template (binary invocation) and the web template (browser-based) for projects whose primary interface is an API.

## Why

API-only backends don't have a UI to test with Playwright and aren't CLI binaries to test with `spawnSync`. They need HTTP request testing — start the server, hit endpoints, check responses. This is the most universal testing approach and also serves as the "Layer 3" fallback for web/mobile apps when browser/simulator testing isn't available.

## Acceptance Criteria

- [ ] New template file exists at `docs/templates/scenarios/example-scenario-api.test.ts`
- [ ] Template starts the server from `../main-repo` before tests run (using `child_process.spawn`)
- [ ] Template uses `fetch` (Node.js built-in) for HTTP requests — no additional dependencies
- [ ] Template demonstrates: GET, POST with JSON body, response status assertions, response body assertions, error case testing (404, 400)
- [ ] Template includes setup/teardown for the server process (start before all, kill after all)
- [ ] Template has configurable base URL via `BASE_URL` env var (same pattern as web template)
- [ ] Template comments explain holdout pattern for APIs — test the running server, never import route handlers
- [ ] Template registered in `src/bundled-files.ts` for installation
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| Template file exists | Check file exists at expected path in bundled-files | unit |
| Template registered in bundled-files | Grep for `example-scenario-api` in bundled-files.ts | unit |
| Template uses fetch (not axios/etc) | Read template, assert contains `fetch` and does not contain `axios` or `got` | unit |
| Template has BASE_URL configuration | Read template, assert contains `BASE_URL` env var handling | unit |
| Template has server start/stop | Read template, assert contains `spawn` and process cleanup | unit |

**Execution order:**
1. Write all tests above — they should fail (files don't exist yet)
2. Run tests to confirm they fail (red)
3. Create the template file and register it
4. Run tests until all pass (green)

**Smoke test:** `pnpm test --run -- init` — checks bundled files are registered.

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL
2. Each test checks real bundled content
3. Identify your smoke test — it must run in seconds

## Constraints

- MUST: Use only Node.js built-in `fetch` — no HTTP client dependencies (no axios, got, supertest)
- MUST: Use vitest as the test runner (consistent with existing CLI template)
- MUST: Server start helper must work for any framework (generic `npm run dev` or `npm start`)
- MUST NOT: Import from `../main-repo/src` — same holdout rule as all other templates
- MUST NOT: Add any dependencies to the scenarios repo beyond vitest

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Add | `docs/templates/scenarios/example-scenario-api.test.ts` | API scenario test template |
| Modify | `src/bundled-files.ts` | Register new template file |

## Approach

The API scenario template follows the same structure as the CLI template but replaces `spawnSync` with HTTP `fetch`:

1. **Setup:** `spawn('npm', ['start'], { cwd: '../main-repo' })` — start the server, poll until ready
2. **Tests:** `fetch(`${BASE_URL}/api/endpoint`)` — send requests, assert on status and body
3. **Teardown:** Kill the server process

Shares the server start/poll/teardown pattern with the web template (both need a running server). The key difference: no browser, just HTTP requests.

**Rejected alternative:** Using `supertest` which can test Express apps without starting a server. This breaks the holdout pattern — supertest imports the app directly. We need the server running as a black box.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Server takes >30s to start | Configurable timeout (default 60s) with clear error message |
| Server runs on non-default port | `BASE_URL` env var overrides default `http://localhost:3000` |
| POST endpoint expects auth header | Template shows Bearer token pattern with env var for token |
| Response is not JSON | Template shows text/plain assertion alternative |
| Server start command differs | Comment in template: "Adjust the start command for your framework" |
