# TwinSpec Console

TwinSpec Console is an interactive, dataset-aware **GIWAXS lab console** that unifies:

- a **Data Twin** (synthetic GIWAXS generation + metrics),
- an **Instrument Twin** (parameterized experimental state),
- and a **Visual Twin** (Unity-based instrument geometry),

into a single, persistent, browser-based environment.

This repository contains the **console application** only. It is designed to orchestrate state, visualization, and backend services — not to perform first-principles simulation.

---

## What this repo is (and is not)

### ✅ This repo **is**
- A **lab-console shell** for operating a GIWAXS digital twin
- A **single source of truth** for experiment state (`InstrumentState`)
- A **UI orchestrator** that:
  - binds controls → data twin output
  - pipes geometry state → Unity WebGL
  - surfaces metrics, warnings, and provenance
- Dataset-aware and state-persistent

### ❌ This repo is **not**
- A DFT engine
- A full GIWAXS reconstruction pipeline
- A Unity project (Unity builds are embedded, not authored here)

---

## Architecture overview

```
src/
├─ app/
│  ├─ console/
│  │  ├─ instrument/   # Instrument Console page
│  │  └─ data/         # Data Viewer page
│  └─ api/             # Mock APIs (/simulate, /priors)
│
├─ components/
│  └─ console/         # Console UI components
│
├─ state/
│  └─ InstrumentStateContext.tsx
│
└─ lib/
   ├─ types.ts         # Canonical state + API types
   ├─ defaults.ts     # Default instrument state
   └─ storage.ts      # Local persistence
```



**Key design rule:**  
The console owns state. Unity and the backend are pure functions of that state.

---

## Console modes

The console exposes two primary modes, navigable via a persistent sidebar:

### 1. Instrument Console
- Operate the GIWAXS instrument
- Modify geometry and acquisition parameters
- View live geometry (Unity) + synthetic detector output
- Run planner recommendations
- Inspect warnings and logs

### 2. Data Viewer
- Data-first view
- Inspect simulated frames, linecuts, metrics
- Review provenance and dataset context
- Minimal controls (no instrument “operation”)

Both modes share the same underlying state and dataset selection.

---

## Tech stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React context (single source of truth)
- **Visualization:** Unity WebGL (embedded)
- **Backend (external):** GIWAXS data twin service (mocked locally)

---

## Getting started

### Prerequisites
- Node.js ≥ 18
- npm

### Install & run
```bash
npm install
npm run dev
```