---
name: cross-component-change
description: Workflow for changes that affect multiple components in a multi-component system
---

# Cross-Component Change Workflow

Use this skill when making changes that affect multiple components (e.g., protocol changes, shared API modifications, interface contract updates).

## When to Use
- Changing a wire protocol or API contract
- Changing event schemas (SSE, WebSocket, message queue)
- Changing shared types or interfaces consumed by multiple components
- Any change where modifying one component could break another

## Steps

1. **Identify Impact**
   - Which components are affected?
   - Which contract spec in `/docs/contracts/` governs this interface?
   - Read the contract spec first.

2. **Update Contract First**
   - Edit the relevant contract spec in `/docs/contracts/`
   - Document: what's new, what's deprecated, migration path
   - Commit the contract change separately

3. **Implement in Dependency Order**
   - Producer first (the component that generates the data)
   - Bridge/middleware second (anything that passes data through)
   - Consumer last (the component that reads the data)
   - Each component change should be a separate commit

4. **Backward Compatibility**
   - During transition, parsing code should handle BOTH old and new formats
   - Add version detection where possible
   - Remove old format support only after all components are deployed

5. **Verify at Each Step**
   - After each component change: run that component's tests
   - After all changes: verify end-to-end

6. **Update Session Notes**
   - Create a session note in each affected component's `docs/claude-sessions/`
   - Reference the contract change and cross-link between components
