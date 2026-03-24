# [Project Name] — Joysmith Assessment

> Use this template when assessing a project against the 5 Levels of Vibe Coding.
> Fill out by reading the project's CLAUDE.md, docs, code, and git history.
> Save to Joysmith: `projects/[project-name]/assessment.md`

---

**Date:** YYYY-MM-DD
**Repo:** [repo name and location]
**Assessed by:** [who/what performed the assessment]

## Product Summary

[1-2 sentences: what is this project, what does it do]

## Current Level: [X.X]

> Use Dan Shapiro's 5 Levels: 0 (Autocomplete), 1 (Intern), 2 (Junior Dev), 3 (Developer as Manager), 4 (Developer as PM), 5 (Joysmith)

### Component Breakdown (if multi-component)

| Component | Level | Key Strength | Critical Gap |
|---|---|---|---|
| [Component A] | X.X | [What's working] | [What's blocking next level] |

### Dimension Scores

| Dimension | Score (1-5) | Evidence |
|---|---|---|
| **Spec Quality** | X/5 | [Design specs? Atomic specs? Acceptance criteria? Feature briefs?] |
| **Spec Granularity** | X/5 | [Are specs small and self-contained? Can Claude execute without questions? Or are they monolithic?] |
| **Behavioral Boundaries** | X/5 | [Always/Ask First/Never tiers? Explicit decision rules?] |
| **Skills & Hooks** | X/5 | [Custom Claude Code skills? Automated hooks? Interview → decompose flow?] |
| **Documentation** | X/5 | [CLAUDE.md actionable? Reference docs? Interface contracts?] |
| **Knowledge Capture** | X/5 | [Discoveries documented? Gotchas preserved? Decision records? Do surprises from past work inform future specs?] |
| **Testing & Validation** | X/5 | [Test coverage? External scenarios? Automated checks?] |

## Cross-Cutting Themes

1. [Pattern that appears across multiple dimensions]
2. [Another pattern]

## Strengths

1. [What's working well — be specific]
2. [Another strength]

## Gaps (Blocking Next Level)

1. [Critical gap — what's missing and why it matters]
2. [Another gap]

## Recommendations (Top 5)

### 1. [Title] (Effort: Low/Medium/High, Impact: Low/Medium/High/Critical)
[What to do, why, and roughly how]

### 2. [Title]
[...]

### 3-5. [...]

## Upgrade Path

| Target Level | Key Requirements | Estimated Effort |
|---|---|---|
| [Current + 0.5] | [What needs to happen] | [Time estimate] |
| [Current + 1.0] | [What needs to happen] | [Time estimate] |

---

## Template Usage Notes

**How to assess:** Spin up subagents (one per component) to read CLAUDE.md, AGENTS.md, docs, code, tests, and git history. Synthesize findings across all agents.

**Key signals per level:**
- **Level 2:** Has CLAUDE.md, agent can make multi-file changes with guidance
- **Level 3:** Has design specs, agent is primary developer, some knowledge capture
- **Level 3.5:** Has boundary framework, interface contracts, decision records
- **Level 4:** Has atomic specs, interview → decompose → execute workflow, external scenarios, discoveries feed back into future specs
- **Level 4.5:** Automated validation (CI), prompt regression tests, spec granularity is consistently high
- **Level 5:** Automated feedback loop, spec queue, autonomous execution, discoveries auto-generate new specs

**Scoring rubric:**
- 1/5: Absent or broken
- 2/5: Exists but minimal/generic
- 3/5: Functional, some gaps
- 4/5: Strong, actionable, battle-tested
- 5/5: Exemplary, could be a template for others

**Spec Granularity scoring guide:**
- 1/5: No specs, or specs are verbal/informal
- 2/5: Monolithic specs that cover entire features
- 3/5: Specs exist but mix concerns or are too large for single-session execution
- 4/5: Atomic specs — each is self-contained, single-session, independently testable
- 5/5: Specs are decomposed from Feature Briefs, sized for context windows, with clear dependency graphs

**Knowledge Capture scoring guide:**
- 1/5: No documentation of surprises or decisions
- 2/5: Session notes exist but are narrative/ritual (step-by-step logs nobody re-reads)
- 3/5: Decision records exist, some gotchas captured ad-hoc
- 4/5: Discoveries captured per-spec, travel with PRs, inform future specs
- 5/5: Discoveries automatically surface in relevant contexts (CLAUDE.md gotchas, boundary updates, spec constraints)
