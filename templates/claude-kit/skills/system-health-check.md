---
name: system-health-check
description: Verify all components of a multi-component system are working together
---

# System Health Check

Use this skill to verify all system components are operational and communicating correctly.

## When to Use
- After deploying changes to any component
- Before starting cross-component work
- When debugging connectivity or integration issues
- When someone reports "something isn't working"

## Process

1. **Check Each Service**
   - For each component, verify it's running (process check, health endpoint, status command)
   - Document: service name, expected state, actual state

2. **Check Connections**
   - Verify components can reach each other (network, ports, protocols)
   - Test with the simplest possible request (ping, status, health check)

3. **Check Data Flow**
   - Verify end-to-end: producer → bridge → consumer
   - Use the simplest data path first (e.g., a status message, not a full payload)

4. **Report Results**
   ```
   System Health Check — [date]
   ✓ [Component A]: running (version X.Y.Z)
   ✓ [Component B]: running, connected to A
   ✗ [Component C]: not responding — [error details]

   Action needed: [what to fix]
   ```

## Customization

Each project should customize this skill with:
- Exact commands to check each service (curl, nc, SSH, mpremote, etc.)
- Expected responses for healthy state
- Troubleshooting table: symptom → likely cause → fix
