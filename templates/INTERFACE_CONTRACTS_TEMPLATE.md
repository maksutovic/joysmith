# Interface Contracts Template

> For multi-component systems (monorepos, microservices, distributed systems).
> Create a `docs/contracts/` directory with one file per interface.
> These are the SINGLE SOURCE OF TRUTH — component docs reference, not duplicate.

---

## Directory Structure

```
docs/contracts/
├── README.md                    # How contracts work, change process
├── [interface-1].md             # e.g., binary-protocol.md, api-v1.md
├── [interface-2].md             # e.g., sse-events.md, graphql-schema.md
└── [interface-3].md             # e.g., ble-characteristics.md, mqtt-topics.md
```

---

## README.md Template

```markdown
# Interface Contract Registry

Single source of truth for all cross-component interfaces.

## Rules

1. **Reference, don't duplicate** — Component docs link here, not copy content
2. **Contract-first changes** — Update the contract spec BEFORE implementing
3. **Multi-owner approval** — Changes affecting N components need N approvals
4. **Backward compatibility** — Support both old and new formats during transition

## Contracts

| Contract | File | Components Affected |
|---|---|---|
| [Interface Name] | `[filename].md` | [Component A], [Component B] |
```

---

## Individual Contract Template

```markdown
# [Interface Name] Contract

**Version:** 1.0 | **Updated:** YYYY-MM-DD
**Components:** [Producer] (producer), [Consumer] (consumer), [Bridge] (passthrough)

> Consolidated from [original location] as the canonical cross-component spec.

---

## Overview

[What this interface does, transport mechanism, key properties]

## Message/Event Types

| Type | Format | Purpose |
|---|---|---|
| [type 1] | [JSON/binary/text] | [description] |
| [type 2] | [JSON/binary/text] | [description] |

## Detailed Specifications

### [Type 1]

[Fields, formats, constraints, examples]

### [Type 2]

[Fields, formats, constraints, examples]

## Connection / Transport

- [Protocol (TCP, HTTP, WebSocket, BLE, etc.)]
- [Endpoints / ports / addresses]
- [Authentication if applicable]
- [Reconnection behavior]

## Change Process

1. Update this contract spec
2. Get approval from all affected component owners
3. Implement in dependency order: [producer → bridge → consumer]
4. Support both old and new formats during transition period
5. Remove old format support after all components are deployed
```

---

## When to Use This Template

- Multi-component systems (monorepos or separate repos)
- Any system where changing an interface in one place can break another
- APIs consumed by multiple clients
- Hardware/firmware ↔ software interfaces
- Event-driven systems (SSE, WebSocket, message queues)

## When NOT to Use

- Single-component projects with no external interfaces
- Internal interfaces that only one file consumes (just use code comments)
