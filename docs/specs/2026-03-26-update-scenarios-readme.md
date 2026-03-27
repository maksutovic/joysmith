# Update Scenarios README — Atomic Spec

> **Parent Brief:** `docs/briefs/2026-03-26-stack-aware-scenario-testing-draft.md`
> **Status:** Ready
> **Date:** 2026-03-26
> **Estimated scope:** 1 session / 2 files / ~150 lines
> **Depends on:** `add-web-scenario-template` (spec 2), `add-mobile-scenario-template` (spec 3), `add-api-scenario-template` (spec 4)

---

## What

Update the scenarios repo README template (`docs/templates/scenarios/README.md`) with stack-specific sections explaining how scenario tests are structured for each testing backbone. The README is the primary documentation the QA scenario agent (and human contributors) read when working in the scenarios repo. It needs to explain not just the holdout pattern but also which test format to use for which kind of project.

## Why

The current scenarios README only explains CLI/binary testing. When the scenarios repo is used for a web app or mobile app, contributors (both human and AI) need to understand: what template to follow, what tools are available, how tests are structured differently for Playwright vs Maestro vs HTTP requests. Without this guidance, the README becomes misleading — it describes a pattern that doesn't match the actual tests in the repo.

## Acceptance Criteria

- [ ] README template has a "Testing by Stack Type" section with subsections for each backbone
- [ ] Web (Playwright) subsection: explains browser-based testing, shows example test structure, links to `example-scenario-web.spec.ts`
- [ ] Mobile (Maestro) subsection: explains YAML flow testing, shows example flow structure, links to `example-scenario-mobile.yaml`, links to `README-mobile.md` for setup
- [ ] API subsection: explains HTTP request testing, shows example test structure, links to `example-scenario-api.test.ts`
- [ ] CLI/Binary subsection: preserved from current README, links to `example-scenario.test.ts`
- [ ] The "Adding scenarios" rules section updated to be stack-aware: "Behavioral, not structural" still applies, but examples are given for each backbone
- [ ] File layout section updated to show the expanded template structure (web, mobile, API files)
- [ ] Internal vs scenario test comparison table updated with web/mobile columns
- [ ] The "How the CI pipeline works" section updated to mention that the backbone determines which test runner and format are used
- [ ] Template registered/updated in `src/bundled-files.ts`
- [ ] Build passes
- [ ] Tests pass

## Test Plan

| Acceptance Criterion | Test | Type |
|---------------------|------|------|
| README contains stack type section | Read bundled README, assert contains "Testing by Stack Type" or "Stack-Specific Testing" | unit |
| README mentions Playwright | Read bundled README, assert contains "Playwright" | unit |
| README mentions Maestro | Read bundled README, assert contains "Maestro" | unit |
| README mentions API testing | Read bundled README, assert contains "API" and "fetch" | unit |
| README preserves CLI section | Read bundled README, assert still contains `spawnSync` or `execSync` | unit |
| README has updated file layout | Read bundled README, assert contains `example-scenario-web` and `example-scenario-mobile` | unit |

**Execution order:**
1. Write all tests above — they should fail (README doesn't have stack-specific content yet)
2. Run tests to confirm they fail (red)
3. Update the README template
4. Run tests until all pass (green)

**Smoke test:** `pnpm test --run -- init` — checks bundled file content.

**Before implementing, verify your test harness:**
1. Run all tests — they must FAIL
2. Each test reads the actual bundled README content
3. Identify your smoke test — it must run in seconds

## Constraints

- MUST: Preserve all existing README content — this is additive, not a rewrite
- MUST: Each backbone section includes a concrete example (not just description)
- MUST: The holdout principle explanation remains front and center — it applies to all backbones
- MUST: File layout section shows which files exist for each backbone type
- MUST NOT: Make the README excessively long — aim for ~250 lines total (currently 150)
- MUST NOT: Include tool installation instructions in the README — those go in `README-mobile.md` for Maestro and are standard for Playwright

## Affected Files

| Action | File | What Changes |
|--------|------|-------------|
| Modify | `docs/templates/scenarios/README.md` | Add stack-specific testing sections, update file layout, update comparison table |
| Modify | `src/bundled-files.ts` | Updated content for modified README |

## Approach

Restructure the README to flow:

1. **What is the holdout pattern?** (existing, unchanged)
2. **Why a separate repository?** (existing, unchanged)
3. **How the CI pipeline works** (existing, updated to mention backbone selection)
4. **Testing by Stack Type** (new section):
   - **Web Apps (Playwright):** Brief description + example structure + link to template
   - **Mobile Apps (Maestro):** Brief description + example YAML + link to template + link to setup guide
   - **API Backends (HTTP):** Brief description + example structure + link to template
   - **CLI Tools & Libraries (vitest):** Existing content moved under this subsection
5. **Adding scenarios — Rules** (existing, updated with stack-aware examples)
6. **File layout** (existing, expanded)
7. **Internal tests vs scenario tests** (existing, expanded with web/mobile)
8. **Relationship to Joycraft** (existing, unchanged)

**Rejected alternative:** Creating separate README files per backbone. This would fragment the documentation and force contributors to find the right README. One README with clear sections is better.

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Project uses multiple backbones (web + API) | README explains that tests can mix formats — Playwright for UI, fetch for API |
| New contributor reads README without context | The holdout pattern section at the top provides sufficient context before stack-specific details |
| Scenarios repo has only one backbone installed | Irrelevant sections are informational — they don't break anything |
