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
│ ├─ (site)/ # Public site routes (optional grouping)
│ │ ├─ page.tsx # /
│ │ ├─ docs/
│ │ │ └─ page.tsx # /docs
│ │ └─ console/
│ │ └─ page.tsx # /console (demo landing, optional)
│ │
│ ├─ app/
│ │ ├─ console/
│ │ │ ├─ layout.tsx # ConsoleShell wrapper (sidebar + content)
│ │ │ ├─ page.tsx # /app/console (index/redirect)
│ │ │ ├─ modea/
│ │ │ │ └─ page.tsx # Mode A
│ │ │ ├─ modeb/
│ │ │ │ └─ page.tsx # Mode B
│ │ │ └─ modec/
│ │ │ └─ page.tsx # Mode C (primary demo)
│ │ │
│ │ └─ data/
│ │ └─ page.tsx # /app/data (data viewer)
│ │
│ └─ api/
│ ├─ priors/
│ │ └─ route.ts # GET priors (dataset registry + lakehouse binding)
│ └─ simulate/
│ └─ route.ts # POST simulate (returns SimResult)
│
├─ components/
│ ├─ shell/
│ │ ├─ SiteShell.tsx # Top nav + footer (global)
│ │ └─ ConsoleShell.tsx # Console layout grid (sidebar + main)
│ │
│ ├─ console/
│ │ ├─ ConsoleSidebar.tsx # Left nav inside /app/console
│ │ ├─ DatasetPicker.tsx # Dataset dropdown (wired to priors/store)
│ │ ├─ SimIndicator.tsx # Last OK + sim status
│ │ ├─ InstrumentControls.tsx # Sample/Geometry/Acquisition inputs
│ │ ├─ PlannerPanel.tsx # “Recommend patch” staging UI
│ │ ├─ UnityPanel.tsx # Unity placeholder panel (image + payload snapshot)
│ │ ├─ GiWaxsViewer.tsx # 2D pattern canvas renderer
│ │ ├─ MetricsPanel.tsx # scalar metrics + linecut preview
│ │ ├─ WarningsPanel.tsx # warnings list
│ │ ├─ ProvenancePanel.tsx # simId/model/hash/timestamp
│ │ └─ LogsPanel.tsx # logs stream
│ │
│ └─ ui/
│ ├─ Card.tsx / index.ts # Card, CardBody, Button, Label wrappers
│ └─ ... # shared UI primitives
│
├─ state/
│ └─ instrumentStore.ts # Zustand store (canonical state + persistence + sim result)
│
├─ lib/
│ ├─ types.ts # Shared types (PriorsResponse, SimResult, InstrumentState)
│ ├─ utils.ts # cn(), clamp(), nowISO(), formatting helpers
│ └─ lakehouse.ts # (optional) helpers for lakehouse bindings/paths
│
└─ public/
└─ images/
└─ unity/
└─ giwaxs-instrument-placeholder.png
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
