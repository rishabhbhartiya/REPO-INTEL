# REPO·INTEL

> GitHub Codebase Intelligence Engine — understand any public repository instantly, entirely rule-based, no AI required for analysis.

![Version](https://img.shields.io/badge/version-3.1-blue?style=flat-square&labelColor=161b22&color=58a6ff)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite-blue?style=flat-square&labelColor=161b22&color=3fb950)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square&labelColor=161b22&color=a371f7)

---

## What It Does

Paste any public GitHub URL. REPO·INTEL fetches the repository, classifies every file by role, deep-reads up to 30 key files, extracts symbols, maps import/export relationships, traces dependency chains, and renders a full interactive dashboard — all without any AI API call for the analysis itself.

---

## Features

### 14 Analysis Views

| View | What it shows |
|---|---|
| **Dashboard** | Repo card with stars, forks, issues, watchers, deploy link, language, topics, entry points, top deps |
| **File Tree** | Collapsible directory tree, role-badged, click filename → GitHub confirm dialog |
| **Priority** | Files ranked by role + import frequency + connectivity score |
| **Dep Graph** | Physics-settled force graph, drag nodes, scroll zoom, click to inspect imports/exports |
| **Sunburst** | Directory structure as nested rings, click file → GitHub, click folder → focus |
| **Symbols** | Per-file accordion: exports with cross-file usage, local imports, external imports |
| **Symbol Search** | Global search across all exported functions, classes, and import paths |
| **Complexity** | Heatmap scored by exports + import frequency + depth (no file sizes) |
| **Dead Code** | Files with zero inbound imports **and** whose exports don't appear in any other file's content |
| **Circular Deps** | Import cycle detection via transitive DFS — shows full chain |
| **Bundle Estimator** | Traces import graph from each entry point, sums raw sizes as upper-bound estimate |
| **Dependencies** | Categorised package grid (UI / Framework / Server / Database / State / Auth / Testing / Build…) |
| **Git History** | Last commit date, author, churn rate per file (fetched from GitHub commits API) |
| **Insights** | Framework detection, architecture pattern, test coverage signal, deploy status, suggested reading order |
| **AI Chat** | Chat with the repo context using your own API key — Claude, GPT-4o, or Gemini |

### 20+ File Role Badges

Every file is classified into one of: `ENGINE` `ROUTE` `COMPONENT` `HOOK` `STATE` `SERVICE` `MODEL` `MIDDLEWARE` `UTIL` `TYPES` `CONFIG` `TEST` `STORY` `MANIFEST` `LOCKFILE` `CI/CD` `DOCKER` `INFRA` `STYLE` `SCRIPT` `DOC` `META` and asset variants.

Classification is rule-based: path patterns, filename conventions, directory names, and file extensions — no heuristic guessing.

### Languages Supported for Symbol Extraction

| Language | Extracts |
|---|---|
| JavaScript / TypeScript | Named imports, default imports, namespace imports, require(), export declarations, export blocks |
| Python | `from x import y`, `import x`, `def`, `class` |
| Go | Import blocks, exported functions (`func`), exported types (`type ... struct/interface`) |
| Java / Kotlin | Import statements, class/interface/enum/object declarations |
| Rust | `use` statements, `pub fn/struct/enum/trait/mod` |

### Dead Code Detection (Enhanced)

Two-pass detection — a file is flagged only if **both** conditions are true:
1. No other file imports it (zero inbound import references)
2. None of its exported symbol names appear as identifiers in any other file's content

This catches files that are dynamically referenced by name in content but never statically imported, reducing false positives significantly compared to import-only checks.

---

## Tech Stack

- **React 18** — UI
- **Vite 4** — build tool
- **GSAP** — homepage and page transition animations
- **Canvas API** — dep graph physics simulation, sunburst chart
- **GitHub REST API v3** — all data (no auth required for public repos)

No other runtime dependencies.

---

## Getting Started

```bash
unzip repo-intel-final.zip
cd repo-intel
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

To build for production:
```bash
npm run build
npm run preview
```

---

## GitHub API Usage

REPO·INTEL makes the following API calls per scan:

| Call | Purpose |
|---|---|
| `GET /repos/{owner}/{repo}` | Repo metadata, default branch, stars, forks, issues, topics, homepage |
| `GET /repos/{owner}/{repo}/pages` | Check for GitHub Pages deployment URL |
| `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1` | Full file tree (up to 100k nodes) |
| `GET /repos/{owner}/{repo}/contents/{path}` | File content — up to 30 key files |
| `GET /repos/{owner}/{repo}/commits?path={path}` | Git history — up to 10 files, 10 commits each |

All unauthenticated. GitHub's rate limit for unauthenticated requests is **60 requests/hour**. A typical scan uses ~45 requests. If you hit the limit, wait an hour or add a `Authorization: token YOUR_PAT` header in `src/utils/github.js`.

---

## AI Chat

The AI Chat tab uses **your own API key** — it is never stored, never sent to any server other than the chosen AI provider directly from your browser.

| Provider | Models | Where to get key |
|---|---|---|
| Anthropic | Claude Sonnet 4.5, Claude Haiku 4.5 | [console.anthropic.com](https://console.anthropic.com) |
| OpenAI | GPT-4o, GPT-4o mini | [platform.openai.com](https://platform.openai.com) |
| Google | Gemini 1.5 Pro, Gemini 1.5 Flash | [aistudio.google.com](https://aistudio.google.com) |

The chat is seeded with a structured context: repo metadata, file list with roles, symbol data for all analysed files, dependency list, cycle count, dead code count, and deploy URL.

---

## Project Structure

```
repo-intel/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                          Entry point
    ├── App.jsx                           Phase controller (home → scanning → dashboard)
    ├── styles/
    │   └── global.css                    GitHub color palette + animations
    ├── utils/
    │   └── github.js                     API calls, classification engine, symbol extractor,
    │                                     dep parsing, dead code detection, bundle estimator
    └── components/
        ├── Badge.jsx                     Role badge with GitHub-palette colors
        ├── ui.jsx                        Shared primitives: PageHeader, Toggle, SearchInput,
        │                                 FilterBtn, EmptyState, GhLink (confirm dialog)
        ├── HomePage.jsx                  Animated landing, centered input, feature cards
        ├── ScanningPage.jsx              Terminal log while scanning
        ├── DashboardPage.jsx             Grouped nav, repo card, view router
        └── tabs/
            ├── FileTree.jsx
            ├── Priority.jsx
            ├── Graph.jsx
            ├── Sunburst.jsx
            ├── Symbols.jsx
            ├── SymbolSearch.jsx
            ├── Complexity.jsx
            ├── DeadCode.jsx
            ├── CircularDeps.jsx
            ├── BundleSize.jsx
            ├── Dependencies.jsx
            ├── GitHistory.jsx
            ├── Insights.jsx
            └── AIChat.jsx
```

---

## Color Palette

Uses the exact GitHub dark theme color system:

```
--gh-canvas-default    #0d1117   Page background
--gh-canvas-overlay    #161b22   Cards, panels
--gh-border-default    #30363d   Borders
--gh-fg-default        #e6edf3   Primary text
--gh-fg-muted          #7d8590   Secondary text
--gh-accent-fg         #58a6ff   Links, active states
--gh-success-fg        #3fb950   Engine, test, success states
--gh-attention-fg      #d29922   Config, warnings
--gh-danger-fg         #f85149   Errors, middleware, cycles
--gh-done-fg           #a371f7   State management, done states
--gh-severe-fg         #db6d28   Manifests, high severity
--gh-sponsors-fg       #db61a2   Models, sponsors color
```

---

## Known Limitations

- **Rate limit**: 60 unauthenticated requests/hour from GitHub API. Large repos may hit this.
- **Tree truncation**: GitHub truncates recursive trees at 100,000 nodes. A warning is shown.
- **Symbol extraction**: Only static imports/exports are parsed. Dynamic `import()`, `__import__`, `importlib`, and runtime registration patterns are not detected.
- **Bundle estimator**: Uses raw file sizes, not minified/tree-shaken output. Treat as an upper bound only.
- **Dead code**: Cannot detect files loaded via Webpack `require.context`, Vite glob imports, or string-based dynamic loaders.
- **Private repos**: Not supported without adding a GitHub Personal Access Token.

---

## License

MIT