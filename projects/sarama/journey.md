# The Sarama Journey: Upgrading a Hardware Product to Level 4

**Date:** March 23, 2026
**Authors:** Max + Claude
**Audience:** Team (Max, Praful, co-founders)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Challenge: Why Hardware is Different](#2-the-challenge-why-hardware-is-different)
3. [The Assessment: Where Sarama Actually Stood](#3-the-assessment-where-sarama-actually-stood)
4. [What We Built: The Level 4 Harness](#4-what-we-built-the-level-4-harness)
5. [The Road to 4.5: Automated Testing for Hardware + iOS + Server](#5-the-road-to-45-automated-testing-for-hardware--ios--server)
6. [The Scenarios Structure: External Holdout Tests](#6-the-scenarios-structure-external-holdout-tests)
7. [Roadmap: Level 4 → 4.5 → 5](#7-roadmap-level-4--45--5)

---

## 1. Executive Summary

We upgraded the Sarama CollarPrototype monorepo from Level 3.5 to Level 4 on the Joysmith framework. This is a distributed hardware+software system — a dog collar (firmware/MicroPython), relay server (Python), intelligence service (Gemini AI), and iOS app (Swift/UIKit) — which makes it significantly harder to automate than a typical web app.

**What we did:**
- Ran 6 parallel analysis agents across every component (firmware, iOS, server, upscale service, Tauri lab, root)
- Interviewed Max on goals, pain points, and architectural preferences
- Designed and implemented a top-down harness upgrade: boundary framework → interface contracts → cross-component skills → component upgrades → deployment runbook
- Delivered 22 files (11 new, 10 modified, 1 design spec) in 6 commits on branch `maksu/joysmith-implementation`
- Researched automated testing strategies for the unique challenges of hardware + iOS + server

**Key insight:** Hardware products can't reach Level 5 through the same path as web apps. You need a **layered testing strategy** — protocol-level simulation for the hardware, mock services for iOS, and integration testing for the server — rather than trying to automate everything end-to-end.

---

## 2. The Challenge: Why Hardware is Different

The Pie journey (our first Level 4 upgrade) was a server + Mac app. API calls, MCP tools, SSE streams — all testable with HTTP requests and bash scripts. Sarama is fundamentally harder:

### The Five-Layer Problem

```
Layer 1: Firmware (MicroPython on ARM Cortex-M55)
  ↕ BLE + WiFi + Binary Protocol (0xDEADBEEF)
Layer 2: Relay Server (Python asyncio TCP bridge)
  ↕ SSE Events (JSON over HTTP)
Layer 3: Intelligence Service (Gemini AI translations)
  ↕ SSE → iOS
Layer 4: iOS App (Swift/UIKit, CoreML, BLE)
  ↕ User experience
Layer 5: Physical dog wearing the collar
```

Each layer has its own toolchain, deployment target, and testing constraints:

| Layer | Language | Deploy Target | Can Simulate? |
|---|---|---|---|
| Firmware | MicroPython + C | OpenMV AE3 microcontroller | Partially — protocol yes, sensors no |
| Relay Server | Python | DigitalOcean VPS | Yes — pure asyncio, no hardware deps |
| Intelligence | Python + Gemini API | Same VPS | Yes — mock Gemini responses |
| iOS App | Swift | Physical iPhone | Partially — simulator for UI, not BLE/camera |
| The Dog | N/A | Real world | No |

### Why Standard Approaches Break Down

**Can't just "run the tests":**
- Firmware tests require a physical device connected via USB
- iOS BLE tests require a real BLE peripheral (the collar)
- End-to-end tests require collar + server + phone in the same room
- Audio emotion detection requires actual dog bark recordings

**Can't just "mock everything":**
- The WiFi routing bug (EHOSTUNREACH after AP→STA switch) only manifests on real hardware
- BLE connection storms only happen with real Bluetooth radio interference
- Audio DMA callbacks have timing constraints that don't exist in simulation
- Camera + IMU + audio running simultaneously creates memory pressure that mocks can't reproduce

**The Pie approach (bash scripts calling HTTP endpoints) doesn't scale here.** We need a different strategy.

---

## 3. The Assessment: Where Sarama Actually Stood

We ran 6 parallel analysis agents — one per component — to assess the entire monorepo against the Joysmith 5-level framework. Here's what we found.

### Component Ratings

| Component | Level | Key Strength | Critical Gap |
|---|---|---|---|
| **Root (monorepo)** | 3.5-4 | Strong specs (INTELLIGENCE_LAYER.md), dual harness (.claude + .codex) | No unified boundary framework, no E2E tests |
| **Firmware** | 3.5 | Exceptional hardware gotchas docs, real hardware test suite | No skills, no holdout scenarios, boundaries not tiered |
| **iOS App** | 3-3.5 | Rich session docs (16 sessions), strong brand integration | Zero test coverage, no behavioral boundaries |
| **Server** | 3.5-4 | Zero-dep relay server, multi-phase specs | Relay untested (3K LOC, 0 tests), no E2E scenarios |
| **Upscale Service** | 3 | Clean code, clear constraints documented | Zero tests, no scenarios |
| **Tauri (SD Lab)** | 1-2 | Solid Rust streaming architecture | No CLAUDE.md, no tests, no specs at all |

### Cross-Cutting Themes

1. **Testing was the universal gap** — Every component lacked external scenarios. iOS and upscale service had literally zero tests.
2. **Boundaries existed but weren't structured** — Critical rules were scattered across CLAUDE.md files with no consistent Always/Ask First/Never framework.
3. **Skills were firmware-only** — 5 mature firmware skills (build, flash, verify, OTA, dev-deploy). Server, iOS, and cross-component workflows had zero.
4. **Interface contracts were documented but not centralized** — Binary protocol spec existed in firmware docs, but server and iOS had their own partial copies. No single source of truth.
5. **Session management was good but inconsistent** — Firmware and iOS had rich session notes; server had gaps; Tauri had none.

### The Diagnosis

Sarama's harness was **strong within each component** (especially firmware and iOS docs) but **weak at the boundaries between components**. The pain points Max described — context loss, autonomy ceiling, agents modifying the wrong component — all traced back to the same root cause: no system-level coordination layer.

---

## 4. What We Built: The Level 4 Harness

We chose a **top-down approach** — build the root-level "constitution" first, then push patterns into each component. This addresses the coordination problem before touching individual components.

### Phase 1: Root Harness (The Constitution)

**BOUNDARY_FRAMEWORK.md** — Unified behavioral boundaries for the entire system.

Three tiers applied system-wide:
- **ALWAYS:** Commit style, contract references, test before push, tag firmware releases
- **ASK FIRST:** Cross-component changes, dependency additions, protocol modifications, production deployments
- **NEVER:** Hardcode credentials, modify C modules, add deps to relay server, skip CRC validation

Each component then defines additional boundaries specific to its domain (e.g., firmware adds MicroPython constraints, iOS adds UIKit preferences).

**Interface Contract Registry** (`docs/contracts/`) — Four canonical specs:

| Contract | What It Governs | Components |
|---|---|---|
| `binary-protocol.md` | 0xDEADBEEF sync marker, CRC-16, 6 packet types | Firmware → Server → iOS |
| `sse-events.md` | 7 SSE event types (emotion, bark, battery, etc.) | Server → iOS |
| `tcp-streaming.md` | Relay commands (SUB, LIST, STATUS), backpressure | Firmware → Server → iOS |
| `ble-characteristics.md` | Service UUIDs, control commands, mode switching | Firmware ↔ iOS |

These are the **single source of truth**. Component docs reference them, not duplicate them. Any protocol change must update the contract first.

### Phase 2: Cross-Component Skills

Three new skills for both Claude Code (`.claude/skills/`) and Codex (`.codex/skills/`):

| Skill | What It Does |
|---|---|
| `cross-component-change` | Safe workflow for changes spanning multiple components: update contract → implement in dependency order → verify at each step |
| `system-health-check` | Verify all services are running and communicating: relay status, SSE endpoint, collar connection, firmware version |
| `deploy-coordinated` | Safe multi-component deployment: server first → firmware second → iOS last, with rollback at each step |

### Phase 3: Component Upgrades

All 10 CLAUDE.md and AGENTS.md files (root + firmware + server + iOS + upscale) restructured with:
- Explicit Always/Ask First/Never tiers
- References to contract registry
- References to boundary framework
- Verification sections

The existing content wasn't removed — it was reorganized. Battle-tested rules (like "relay_server.py stays zero-dependency") got promoted to the ALWAYS tier.

### Phase 4: Deployment Runbook

`docs/DEPLOYMENT_RUNBOOK.md` — copy-paste-ready operational guide covering:
- Pre-deployment checklist
- Server deployment (relay, intelligence, recording, upscale — each with exact commands)
- Firmware deployment (Python-only fast path vs. full build + DFU flash)
- iOS deployment
- Coordinated release procedure (order: server → firmware → iOS)
- Rollback procedures with time estimates
- Version compatibility matrix
- Monitoring and troubleshooting

### The Delivery

| Metric | Count |
|---|---|
| New files created | 11 |
| Existing files modified | 10 |
| Total commits | 6 |
| Branch | `maksu/joysmith-implementation` |
| PR | [#11](https://github.com/saramaxyz/CollarPrototype/pull/11) |
| Code changes | 0 (all documentation/harness) |
| Time from first assessment to PR | ~2 hours |

---

## 5. The Road to 4.5: Automated Testing for Hardware + iOS + Server

This is where Sarama diverges from the Pie playbook. Level 4.5 requires **automated validation** — scenarios that run without human intervention and feed failures back to Claude. For a hardware product, that means solving three distinct testing problems.

### The Layered Testing Strategy

We can't test everything end-to-end automatically. Instead, we test at **three layers**, each with increasing fidelity and decreasing automation:

```
Layer 1: Protocol Simulation (fully automated, no hardware)
  → Fake collar sends binary packets over TCP
  → Mock SSE server emits test events
  → Validates parsing, routing, event handling
  → Runs in CI, feeds back to Claude

Layer 2: Component Integration (mostly automated, simulator OK)
  → Server: full asyncio stack with mock collar + mock clients
  → iOS: XCTest on simulator for non-hardware features
  → Firmware: host-side logic tests (MicroPython Unix port)
  → Runs locally or in CI

Layer 3: Hardware-in-the-Loop (manual trigger, real devices)
  → Real collar + real phone + real server
  → Soak tests, BLE chaos tests, WiFi transition tests
  → Triggered by human, results captured automatically
```

**The key insight:** Layer 1 catches 80% of regressions and is fully automatable. Layer 2 catches another 15%. Layer 3 catches the remaining 5% (real hardware bugs) but requires human involvement.

### Server Testing (Highest ROI, Start Here)

The server is the easiest to test and the relay server is the biggest risk (3,000+ LOC, zero tests).

**Off-the-shelf tools:**

| Tool | Purpose | Effort |
|---|---|---|
| **pytest + pytest-asyncio** | Async test fixtures for TCP relay server | Low — already used for intelligence service |
| **Hypothesis** | Property-based testing for binary protocol fuzzing | Medium — generates random valid/invalid packets |
| **aiohttp test client** | SSE stream testing for intelligence service | Low — built into aiohttp |
| **Docker Compose** | Spin up full server stack for integration tests | Medium — all services in one `docker-compose.yml` |

**What to build:**

1. **Fake collar simulator** (`scripts/fake_collar.py`) — Python script that connects to relay port 8554 and sends valid binary protocol packets (video frames, emotion events, battery status, audio chunks, distance updates, identity). This already partially exists.

2. **Relay server test suite** (`tests/test_relay_server.py`) — async tests for:
   - Per-client queue overflow (backpressure)
   - Stream routing (SUB commands, auto-subscribe)
   - Protocol state machine (text commands)
   - Multi-client broadcast
   - Estimated: ~400 lines, 6-8 hours

3. **SSE scenario tests** — validate intelligence service event flow:
   - Collar connects → emotion fires → Gemini translates → SSE client receives bark event
   - SSE reconnection with Last-Event-ID replay
   - Calm timer fires when no emotion detected

### iOS Testing (Medium ROI, Strategic)

iOS testing splits into two categories: things that need hardware and things that don't.

**What can run on simulator (no hardware):**

| Tool | Purpose | Effort |
|---|---|---|
| **xcodebuild test** | Run XCTest from command line | Low — standard Xcode tooling |
| **swift-snapshot-testing** | Visual regression testing for UI | Medium — capture reference images |
| **Mock SSE server** | Test BarkEventClient parsing without real server | Low — simple Python script |

**What we can unit test without hardware:**
- BarkEventClient SSE event parsing (JSON → model objects)
- EmotionStateManager state transitions
- JpegStreamClient binary protocol parsing
- Onboarding flow logic

**What still needs real hardware:**
- BLE pairing and mode switching
- Camera + video upscaling pipeline
- Audio playback through speakers
- WiFi direct mode connection

**Strategy:** Build the unit test suite for network/data layer (no hardware needed), accept that BLE/camera tests remain manual (Layer 3).

### Firmware Testing (Complex, Protocol-First)

Firmware is the hardest to test automatically. But we don't need to test everything — we need to test the **interfaces**.

**What we can test without hardware:**

| Approach | What It Tests | Effort |
|---|---|---|
| **Binary protocol validator** | Packet format, CRC-16, field ranges | Low — pure Python, no hardware |
| **MicroPython Unix port** | Logic in collar_logic.py (state transitions, packet assembly) | Medium — need to stub hardware APIs |
| **Pre-recorded audio fixtures** | Emotion detection pipeline (MFCC → TFLite) | Medium — need reference samples + expected outputs |

**What still needs real hardware:**
- WiFi AP/STA switching (the routing bug)
- BLE advertising and connection
- Audio DMA callbacks under real-time constraints
- IMU sampling at 100Hz
- Memory pressure with camera + audio + WiFi running simultaneously

**Strategy:** Build protocol-level tests and host-side logic tests. Hardware-specific tests remain the existing soak tests (already good — 2hr/12hr/60hr presets) triggered manually.

### The Testing Pyramid for Hardware Products

```
        /\
       /  \     Layer 3: Hardware-in-the-Loop
      / 5% \    Manual trigger, real devices, soak tests
     /______\   Existing: firmware soak tests, BLE chaos
    /        \
   /  15%     \  Layer 2: Component Integration
  / Simulator  \ xcodebuild test, pytest full stack,
 /______________\ mock peripherals

/                \
/     80%         \  Layer 1: Protocol Simulation
/ Fake collar,     \ Binary protocol tests, SSE tests,
/  mock SSE, no HW  \ relay server unit tests
/____________________\
```

---

## 6. The Scenarios Structure: External Holdout Tests

Following the StrongDM pattern (and what we did for Pie), scenario tests live **outside** the codebase. The agent building the software can't see them, can't game them.

### Directory Structure

```
~/Developer/scenarios/
├── pie-server/              # Already exists — 4 scenarios, all passing
├── sarama/                  # NEW
│   ├── setup.sh             # Entry point: config, health check, run all
│   ├── .env.test            # Saved config (server IP, test data paths)
│   ├── lib/
│   │   ├── fake_collar.py   # Sends valid binary protocol packets over TCP
│   │   ├── sse_client.py    # Connects to SSE and captures events
│   │   └── protocol.py      # Binary protocol encoder/decoder
│   ├── fixtures/
│   │   ├── bark_samples/    # Pre-recorded dog bark audio (PCM16, 16kHz)
│   │   ├── test_frames/     # Sample JPEG frames (320x200)
│   │   └── expected/        # Expected outputs for validation
│   ├── scenarios/
│   │   ├── 01-relay-health.sh        # Relay accepts connection, responds to STATUS
│   │   ├── 02-binary-protocol.sh     # Fake collar sends all 6 packet types, relay broadcasts
│   │   ├── 03-sse-emotion-flow.sh    # Emotion → Gemini translation → SSE bark event
│   │   ├── 04-sse-reconnection.sh    # SSE client reconnects, gets missed events
│   │   ├── 05-credential-failure.sh  # Bad Gemini key → explicit error (not silent)
│   │   └── 06-multi-client.sh        # Multiple iOS clients, SUB/UNSUB, backpressure
│   └── results/             # Test run output (timestamped, gitignored)
```

### Scenario Script Pattern

Each scenario follows the same structure:

```bash
#!/bin/bash
# scenario-02-binary-protocol.sh
# QUESTION: Does the relay correctly receive and broadcast all 6 binary packet types?
# PASS CRITERIA:
# 1. Fake collar connects to port 8554
# 2. Test client connects to port 8555 and subscribes
# 3. All 6 packet types received by client with valid CRC
# 4. Emotion packet contains correct emotion char (A/L/P)
# 5. Battery packet contains valid percent and voltage

source "$(dirname "$0")/../lib/common.sh"

# Setup
start_scenario "Binary Protocol Broadcast"

# Execute
python3 ../lib/fake_collar.py --server "$RELAY_HOST" --packets all --count 10 &
COLLAR_PID=$!
sleep 1
RESULT=$(python3 ../lib/test_client.py --server "$RELAY_HOST" --timeout 5 --expect-types "0x01,0x02,0x03,0x04,0x05,0x06")

# Evaluate
assert_contains "$RESULT" "video_frames: 10"
assert_contains "$RESULT" "emotion_events: 10"
assert_contains "$RESULT" "crc_valid: true"

# Cleanup
kill $COLLAR_PID 2>/dev/null
end_scenario
```

### CLI Integration

The `setup.sh` entry point supports two modes:

**Interactive mode** (human runs manually):
```bash
cd ~/Developer/scenarios/sarama
./setup.sh
# Prompts for config on first run, then runs all scenarios with colored output
```

**CI mode** (Claude Code hook or GitHub Actions):
```bash
./setup.sh --ci
# No prompts (loads .env.test), JSON output, non-zero exit on failure
```

**Single scenario** (debugging):
```bash
./setup.sh --scenario 03-sse-emotion-flow
```

### Hooking Into Claude Code (Level 4.5)

Once scenarios are built, the automation loop looks like:

```json
// .claude/settings.json (in CollarPrototype repo)
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "if echo '$TOOL_INPUT' | grep -q 'pytest\\|test'; then cd ~/Developer/scenarios/sarama && ./setup.sh --ci --scenario server-only; fi",
        "timeout": 120000
      }]
    }]
  }
}
```

When Claude runs tests, the external scenarios auto-run. Failures feed back into the conversation. Claude iterates until green.

---

## 7. Roadmap: Level 4 → 4.5 → 5

### Where We Are Now: Level 4

```
Human → writes spec → Claude executes →
Human runs scenarios → Human reviews → Ship
```

**What we have:**
- Unified boundary framework across all components
- Interface contracts as single source of truth
- Cross-component skills for safe multi-component work
- Deployment runbook with rollback procedures
- Rich session notes and design specs per component

**What's still manual:**
- Running tests and scenarios
- Feeding results back to Claude
- Hardware verification (always manual for real device)

### Level 4.5: Automate What Can Be Automated

```
Human → writes spec → Claude executes →
Layer 1+2 scenarios run automatically → failures feed back →
Claude iterates → automated layers green →
Human runs Layer 3 (hardware) → Ship
```

**Step 1: Build the scenario infrastructure** (1-2 days)
- `~/Developer/scenarios/sarama/` with fake collar, SSE client, protocol library
- 6 initial scenarios covering relay, protocol, SSE, reconnection, errors, multi-client

**Step 2: Build server test suite** (2-3 days)
- pytest-asyncio tests for relay server (the biggest untested risk)
- Mock Gemini for intelligence service integration tests
- Binary protocol property-based tests with Hypothesis

**Step 3: Build iOS unit tests** (2-3 days)
- XCTest for BarkEventClient, EmotionStateManager, JpegStreamClient
- Mock SSE server for network layer testing
- Run via `xcodebuild test` from command line

**Step 4: Hook scenarios into Claude Code** (1 hour)
- PostToolUse hook runs Layer 1 scenarios after test commands
- CI mode with JSON output for machine parsing
- Non-zero exit feeds failures back to Claude

**Step 5: CI/CD integration** (1 day)
- GitHub Actions runs Layer 1+2 tests on every push
- Protocol tests + server tests + iOS simulator tests
- Results posted to PR

### Level 5: The Hardware Dark Factory

Level 5 for hardware products looks different from Level 5 for web apps. Full autonomy over Layers 1+2, human-in-the-loop for Layer 3.

```
Spec drops → Claude implements → Layer 1+2 auto-validated →
All protocol/server/iOS-simulator tests green →
Human triggers Layer 3 (real collar + phone) → Ship
```

**Why this is still Level 5:**
- Human writes WHAT (spec) and WHY (product vision)
- Claude writes ALL the code
- Automated tests catch 95% of regressions
- Human only touches hardware for the final 5% that can't be simulated
- The human role shifts from "developer reviewing code" to "QA engineer running hardware tests"

**What makes it different from web app Level 5:**
- Can't fully eliminate human from the loop (hardware requires physical presence)
- But the human effort drops from "writing/reviewing all code" to "plugging in a collar and pressing a button"
- That's still a massive productivity gain — spec to working software in hours, not days

### The StrongDM Comparison

StrongDM's dark factory works because their product is pure software — APIs, databases, CLI tools. They can build "digital twin universes" (behavioral clones of Okta, Jira, Slack) to test everything in simulation.

**We can't clone a dog.** But we can:
- Clone the binary protocol (fake collar simulator)
- Clone the server stack (Docker Compose)
- Clone the SSE stream (mock intelligence service)
- Clone BLE behavior (CoreBluetooth mock framework)
- Test 95% of the software this way

The remaining 5% — real sensors, real WiFi, real BLE radio, real dog barks — will always need hardware. And that's OK. Level 5 for hardware means **automating everything that CAN be automated** and making the hardware testing as push-button as possible.

---

## Artifacts Reference

All artifacts from this upgrade:

**In CollarPrototype repo** (branch: `maksu/joysmith-implementation`):

| File | Purpose |
|---|---|
| `BOUNDARY_FRAMEWORK.md` | Unified behavioral boundaries |
| `docs/contracts/*.md` | Interface contract registry (4 contracts) |
| `.claude/skills/*.md` | Cross-component skills (3 skills) |
| `.codex/skills/*/SKILL.md` | Same skills for Codex harness |
| `docs/DEPLOYMENT_RUNBOOK.md` | Coordinated deployment guide |
| `docs/plans/2026-03-23-joysmith-harness-upgrade-design.md` | Design spec |
| All `CLAUDE.md` + `AGENTS.md` files | Restructured with behavioral tiers |

**In Joysmith repo:**

| File | Purpose |
|---|---|
| `projects/sarama/assessment.md` | Full assessment with component ratings |
| `projects/sarama/journey.md` | This document |
| `templates/CLAUDE_MD_TEMPLATE.md` | New — full CLAUDE.md template |
| `templates/AGENTS_MD_TEMPLATE.md` | New — AGENTS.md template |
| `templates/INTERFACE_CONTRACTS_TEMPLATE.md` | New — multi-component contract template |
| `templates/ASSESSMENT_TEMPLATE.md` | New — 5-level assessment template |
| `templates/claude-kit/skills/cross-component-change.md` | New reusable skill |
| `templates/claude-kit/skills/system-health-check.md` | New reusable skill |
| `templates/claude-kit/skills/deploy-coordinated.md` | New reusable skill |

**PR:** [CollarPrototype #11](https://github.com/saramaxyz/CollarPrototype/pull/11)

---

*"The dark factory doesn't need to clone a dog. It needs to clone the protocol, the server, and the stream. Test what you can simulate. Touch hardware only when physics demands it."*
