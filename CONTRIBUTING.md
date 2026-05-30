# Contributing to REPO·INTEL

Thank you for your interest in contributing! This document explains how to get started.

## Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/repo-intel.git
cd repo-intel
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
src/
├── App.jsx                   Phase controller
├── main.jsx                  Entry point
├── styles/global.css         GitHub color palette + animations
├── utils/github.js           Analysis engine (classification, symbols, deps)
└── components/
    ├── Badge.jsx             Role badge component
    ├── ui.jsx                Shared UI primitives
    ├── HomePage.jsx          Landing page
    ├── ScanningPage.jsx      Scan progress terminal
    ├── DashboardPage.jsx     Main dashboard shell
    └── tabs/                 One file per analysis view
```

## How the Analysis Engine Works

All analysis is in `src/utils/github.js`. No AI is used for analysis.

### File Classification (`classifyFile`)
Rules checked in priority order: assets → noise → manifests → tests → CI → config → entry points → routes → components → state → hooks → middleware → models → services → utils → styles → scripts.

### Symbol Extraction (`extractSymbols`)
Per-language regex parsers for JS/TS, Python, Go, Java/Kotlin, Rust. Returns `{ imports, exports }`.

### Dead Code Detection (`detectDeadCode`)
Two-pass: (1) zero inbound imports, (2) no exported symbol names found as identifiers in any other file's content.

### Circular Dependency Detection (`detectCircularDeps`)
DFS with an in-stack set on the local import adjacency graph.

## Adding a New Analysis Tab

1. Create `src/components/tabs/YourTab.jsx`
2. Import and add a route in `src/components/DashboardPage.jsx`
3. Add a nav entry to the `NAV_GROUPS` array in `DashboardPage.jsx`

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Test against at least 3 different public repos before submitting
- Follow the existing code style (no external CSS, inline styles only, GitHub color vars)
- Do not add new runtime dependencies without discussion

## Reporting Issues

Please include:
- The GitHub repo URL you scanned
- Browser and OS
- Screenshot or console error if applicable

## Language Support

To add symbol extraction for a new language, add a block in the `extractSymbols` function in `src/utils/github.js` and add the file extension to `EXT_LANG`.