# Sarama Automated Testing Research

**Date:** 2026-03-23
**Purpose:** Research findings for Level 4.5/5 automated validation across firmware, iOS, and server.

---

## The Core Challenge

Sarama is a 5-layer distributed hardware+software system. Unlike web apps (where you can test everything with HTTP requests), each layer has different testing constraints:

| Layer | Can Fully Automate? | Blocker |
|---|---|---|
| Server (relay, intelligence, recording) | Yes | Nothing — pure Python asyncio |
| Binary Protocol | Yes | Need fake collar simulator |
| iOS UI + Network | Mostly | Need Mac with Xcode for simulator |
| iOS BLE | Partially | Need mock BLE framework (CoreBluetoothMock) |
| Firmware Logic | Partially | Need MicroPython Unix port + hardware abstraction |
| Real Hardware (sensors, WiFi radio, BLE radio) | No | Physical device required |

---

## Server Testing (Highest ROI — Start Here)

### Relay Server (3,000+ LOC, 0 tests — critical risk)

**Framework:** pytest + pytest-asyncio

**Approach:** Custom async fixtures that simulate collar and iOS client connections:
1. Start relay on unused port
2. `asyncio.open_connection()` as fake collar — sends binary packets
3. `asyncio.open_connection()` as fake iOS client — reads forwarded data
4. Assert client received what collar sent

**Key tests needed:**
- Per-client queue overflow (backpressure — when queue full, oldest drops)
- Stream routing (SUB commands, auto-subscribe, UUID binding)
- Protocol state machine (text commands: PING, STATUS, LIST, etc.)
- Multi-client broadcast
- Disconnect handling (HALTED events, reconnection)

**Binary Protocol Testing:**
- **Hypothesis** (property-based testing) — generates random valid/invalid packets
  - Properties: `parse(serialize(packet)) == packet` for all valid packets
  - Corrupted CRC always raises parse error
  - Parser recovers after garbage bytes before next sync marker
  - Truncated packets don't crash
- **construct** library — declarative binary protocol definition, used for both parsing and building packets
- **Boofuzz** — protocol fuzzer for security/robustness testing (run overnight)

### Intelligence Service (SSE)

**Framework:** httpx-sse for SSE client testing, respx for mocking Gemini API

**Key tests:**
- SSE event format validation (all 7 event types)
- Replay buffer (disconnect, reconnect with Last-Event-ID, verify missed events received)
- Calm timer (no emotion for 12s → observation event)
- Gemini API failure handling (mock returns error → explicit error event, not silent failure)

### External Dependencies Mocking

| Service | Mock Strategy |
|---|---|
| Supabase | respx mock or local supabase Docker container |
| OneSignal | respx mock (simple HTTP POST) |
| Gemini API | respx with recorded response fixtures |

---

## iOS Testing

### What Can Run on Simulator (No Hardware)

| Tool | What It Tests | Effort |
|---|---|---|
| **xcodebuild test** (CLI) | All XCTest suites from command line | Low — ships with Xcode |
| **CoreBluetoothMock** (Nordic) | BLE pairing, commands, notifications without real collar | Medium — need to define mock peripheral |
| **Swifter** or **Embassy** | Mock SSE server for BarkEventClient testing | Low |
| **Protocol abstraction** | Mock TCP transport for binary protocol parsing | Medium — refactor needed |
| **swift-snapshot-testing** | Visual regression of emotion displays, onboarding | Low |
| **Maestro** (YAML flows) | E2E UI flows — AI-agent-friendly (YAML, not code) | Low-Medium |
| **CoreML in simulator** | Model loading + inference correctness | Low |

### CoreBluetoothMock (The Single Most Impactful Addition)

**URL:** https://github.com/NordicSemiconductor/IOS-CoreBluetooth-Mock

Drop-in replacement for CoreBluetooth that runs on simulator. Define a `CBMPeripheralSpec` that mimics the collar's GATT profile — service UUIDs, characteristic UUIDs, command/response behavior. Tests run via standard `xcodebuild test` with zero hardware.

**What it unlocks:** BLE connection flow, mode switching (ENABLE_DIRECT/DISABLE_DIRECT), status queries, identity retrieval — all testable in CI.

**Setup:**
1. Abstract BLE layer to use `CBMCentralManager` (API-compatible with `CBCentralManager`)
2. Write `CBMPeripheralSpec` matching collar's GATT profile
3. Write delegate methods simulating collar responses

### Maestro (Best for Level 5 — AI-Agent-Friendly)

**URL:** https://maestro.dev/

YAML-based E2E testing. No code required — flows like `tapOn: "Get Started"`, `assertVisible: "Welcome"`. An AI agent can write, debug, and iterate on Maestro flows without understanding XCUITest APIs. CLI output is clean pass/fail.

### Unit Tests (Immediate Wins)

These can be written TODAY with zero infrastructure:
- BarkEventClient: SSE event JSON parsing → model objects
- EmotionStateManager: state transitions (Neutral → Agitated → back)
- JpegStreamClient: binary protocol packet parsing
- Onboarding flow: phase completion logic

### What Still Needs Real Hardware

- BLE radio communication (actual advertising, connection, interference)
- Camera + video upscaling pipeline
- Audio playback through speakers
- WiFi direct mode (SoftAP connection from phone)

### CI Requirement

**A Mac with Xcode is required.** Options:
- GitHub Actions macOS runners (~$0.08/min, M1 available)
- Self-hosted Mac Mini (~$600 one-time, best for always-on CI)
- MacStadium (~$50-150/month, managed Mac cloud)

---

## Firmware Testing

### What Can Run Without Hardware

| Approach | What It Tests | Effort |
|---|---|---|
| **MicroPython Unix port** | Pure logic: state machines, protocol parsing, CRC, config validation | Low |
| **construct** library (Python) | Binary protocol roundtrip testing | Low |
| **TFLite runtime on host** | ML model inference with pre-recorded audio | Low |
| **librosa** (Python MFCC reference) | MFCC feature extraction validation vs C module | Medium |
| **Fake collar simulator** | Complete protocol simulation over TCP | Medium |

### MicroPython Unix Port (Biggest "Free" Win)

Runs MicroPython on Linux/macOS as a native process. No hardware needed. Test all pure logic:
- Protocol parsing (sync marker detection, CRC validation, packet assembly)
- State machine transitions (CLIENT → DIRECT mode, emotion detection flow)
- Configuration validation
- Distance/step calculation math

**Prerequisite:** Clean separation between hardware-dependent and hardware-independent code. If `collar_logic.py` has functions that only take data inputs and return data outputs, they're testable on Unix port today.

### TFLite Model Testing on Host

Full pipeline test without hardware:
1. Load pre-recorded bark WAV file
2. Extract MFCC features with Python `librosa` (matching C module parameters)
3. Run TFLite interpreter with those features
4. Assert emotion label matches expected output

This validates the ML pipeline end-to-end. Run on every model update.

### Hardware-in-the-Loop (When You Need Real Device)

**mpremote + pytest** — Script device interactions:
```
mpremote exec "import config; print(config.FIRMWARE_VERSION)"
mpremote exec "import collar_logic; print(collar_logic.run_self_test(state))"
```

**Bleak** (Python BLE client) — Test BLE services from host:
- Discover collar, connect, subscribe to notifications
- Send commands via write characteristic, verify responses
- Replaces manual iOS app testing for protocol-level validation

**Golioth model** (gold standard for embedded CI):
- Raspberry Pi as self-hosted GitHub Actions runner
- Collar connected via USB
- pytest fixtures handle flash/connect/reset
- 530+ tests per PR (their numbers)

### What Still Needs Physical Testing

- WiFi AP/STA routing bug (only manifests on real hardware)
- Audio DMA callback timing
- IMU sampling at 100Hz under real sensor noise
- Memory pressure with camera + audio + WiFi simultaneously
- Existing soak tests (2hr/12hr/60hr) cover this well

---

## External Scenario Structure

### Directory Layout

```
~/Developer/scenarios/sarama/
├── setup.sh                        # Entry point: config, health check, run all
├── .env.test                       # Server IP, test data paths (gitignored)
├── lib/
│   ├── fake_collar.py              # Sends binary protocol packets over TCP
│   ├── sse_client.py               # Captures SSE events
│   ├── ios_client_sim.py           # Fake iOS relay client
│   ├── packet_builder.py           # Binary protocol encoder (uses construct)
│   └── common.sh                   # Shared helpers (assert, report, config)
├── fixtures/
│   ├── bark_samples/               # Pre-recorded dog bark audio (PCM16, 16kHz)
│   ├── test_frames/                # Sample JPEG frames (320x200)
│   └── expected/                   # Expected outputs for validation
├── scenarios/
│   ├── 01-relay-health.sh          # Relay responds to STATUS command
│   ├── 02-binary-protocol.sh       # All 6 packet types sent and received correctly
│   ├── 03-sse-emotion-flow.sh      # Emotion → Gemini translation → bark event
│   ├── 04-sse-reconnection.sh      # Last-Event-ID replay works
│   ├── 05-credential-failure.sh    # Bad Gemini key → explicit error
│   ├── 06-multi-client.sh          # Multiple iOS clients, SUB/UNSUB, backpressure
│   ├── 07-protocol-integrity.sh    # CRC validation, sync marker recovery
│   └── 08-end-to-end.sh           # Full collar→relay→intelligence→SSE
└── results/                        # JSON output per run (gitignored)
```

### CLI Interface

```bash
# Interactive (first run prompts for config)
./setup.sh

# CI mode (no prompts, JSON output, exit code = failures)
./setup.sh --ci --output results/run-$(date +%s).json

# Single scenario
./setup.sh --scenario 03-sse-emotion-flow

# Server-only scenarios (skip hardware-dependent ones)
./setup.sh --ci --tag server
```

### JSON Output Format

```json
{
  "suite": "sarama",
  "timestamp": "2026-03-23T14:30:00Z",
  "scenarios": [
    {"id": "01-relay-health", "status": "pass", "duration_ms": 1200},
    {"id": "04-relay-backpressure", "status": "fail",
     "message": "Queue overflowed: expected graceful drop, got OOM",
     "expected": "relay drops oldest packets when queue full",
     "actual": "relay process killed after 10s"}
  ],
  "summary": {"total": 8, "passed": 7, "failed": 1}
}
```

### Claude Code Hook (Level 4.5)

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "if echo '$TOOL_INPUT' | grep -q 'pytest\\|test'; then cd ~/Developer/scenarios/sarama && ./setup.sh --ci --tag server 2>&1 | tail -20; fi",
        "timeout": 120000
      }]
    }]
  }
}
```

---

## Priority Implementation Order

| Priority | What | Tools | Effort | Impact |
|---|---|---|---|---|
| **1** | Relay server tests | pytest-asyncio + Hypothesis | 2-3 days | Tests the biggest risk (3K LOC, 0 tests) |
| **2** | Fake collar simulator | construct + asyncio TCP | 1-2 days | Enables all protocol-level testing |
| **3** | External scenario scripts | Shell + Python lib | 2-3 days | Enables Level 4.5 feedback loop |
| **4** | iOS unit tests | XCTest + xcodebuild CLI | 2-3 days | SSE parsing, state transitions, protocol |
| **5** | CoreBluetoothMock integration | Nordic framework | 3-4 days | BLE testing without collar |
| **6** | CI/CD pipeline | GitHub Actions | 1 day | Automated gate on every push |
| **7** | Firmware host tests | MicroPython Unix port | 2-3 days | Logic testing without hardware |
| **8** | Maestro UI flows | YAML-based E2E | 1-2 days | AI-agent-friendly UI testing |

**Total to Level 4.5:** ~15-20 days of engineering effort, starting with the server (priorities 1-3).

---

## Key Tools Reference

| Tool | URL | Layer | Cost |
|---|---|---|---|
| pytest-asyncio | pypi.org/project/pytest-asyncio | Server | Free |
| Hypothesis | hypothesis.works | Server/Protocol | Free |
| construct | construct.readthedocs.io | Protocol | Free |
| httpx-sse | github.com/florimondmanca/httpx-sse | Server SSE | Free |
| respx | lundberg.github.io/respx | Server mocking | Free |
| CoreBluetoothMock | github.com/NordicSemiconductor/IOS-CoreBluetooth-Mock | iOS BLE | Free |
| swift-snapshot-testing | github.com/pointfreeco/swift-snapshot-testing | iOS UI | Free |
| Maestro | maestro.dev | iOS E2E | Free |
| Bleak | github.com/hbldh/bleak | Firmware BLE | Free |
| Boofuzz | boofuzz.readthedocs.io | Protocol fuzzing | Free |
| MicroPython Unix port | docs.micropython.org | Firmware logic | Free |
| tflite-runtime | pypi.org/project/tflite-runtime | ML pipeline | Free |

---

## Sources

### Hardware/Firmware
- Golioth HIL Testing: blog.golioth.io/golioth-hil-testing-part1/
- Golioth pytest for hardware: blog.golioth.io/automated-hardware-testing-using-pytest/
- Particle CI/CD for firmware: particle.io/blog/how-to-implement-ci-cd-automation-for-firmware-development-with-particle/
- Memfault Renode testing: interrupt.memfault.com/blog/test-automation-renode
- Altium MicroPython CI: resources.altium.com/p/automating-micropython-development-and-testing-using-continuous-integration

### iOS
- Nordic CoreBluetoothMock: github.com/NordicSemiconductor/IOS-CoreBluetooth-Mock
- Fitbit Golden Gate: github.com/Fitbit/golden-gate
- swift-snapshot-testing: github.com/pointfreeco/swift-snapshot-testing
- Maestro: maestro.dev

### Server
- Armin Ronacher on async pressure: lucumr.pocoo.org/2020/1/1/async-pressure/
- httpx-sse: github.com/florimondmanca/httpx-sse
- respx: lundberg.github.io/respx
