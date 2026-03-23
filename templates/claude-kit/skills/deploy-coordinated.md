---
name: deploy-coordinated
description: Safe deployment workflow for changes spanning multiple components
---

# Coordinated Deployment

Use this skill when deploying changes that span multiple components of a distributed system.

## When to Use
- After completing a cross-component change
- When deploying a new feature that touches multiple services
- When rolling out a protocol or interface change

## Pre-Deployment Checklist
- [ ] All changes committed and pushed
- [ ] Contract specs in `/docs/contracts/` are up to date
- [ ] Component tests pass (where they exist)
- [ ] Current production versions documented

## Deployment Order

Deploy in order of dependency and risk:

1. **Backend/server first** — usually safest to update, fastest to rollback
2. **Firmware/embedded second** — may require physical access for rollback
3. **Client apps last** — longest deployment cycle (app store review, user updates)

## At Each Step

```
1. Deploy component
2. Verify component is healthy (run health check)
3. Verify it still works with unchanged components (backward compatibility)
4. Document what was deployed and when
5. Only proceed to next component if this one is green
```

## Rollback Procedure

For each component, document:
- How to rollback (exact commands)
- How long rollback takes (seconds? minutes? days?)
- What state the system is in after rollback

## Version Compatibility

Maintain a version compatibility matrix:

| Component A | Component B | Component C | Notes |
|---|---|---|---|
| v1.0.0 | v1.0.0 | v1.0.0 | Baseline |
| v1.1.0 | v1.0.0 | v1.0.0 | A updated, B/C compatible |

## Customization

Each project should customize this skill with:
- Exact deployment commands per component
- Verification commands
- Rollback commands
- SSH keys, server addresses, service names
