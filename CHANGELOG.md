# Changelog

All notable changes to REPO·INTEL are documented here.

## [3.1.0] — 2025

### Added
- GitHub exact color palette throughout (canvas-default, accent, success, attention, danger, done, severe, sponsors)
- Deployment detection — checks GitHub Pages API and `homepage` field, shows live link in dashboard and Insights
- Repo card on dashboard: stars, forks, open issues, watchers, license, topics, last updated, primary language
- `GhLink` confirm dialog — clicking a filename shows "Open this file on GitHub?" popup instead of navigating immediately
- Dead code detection now checks both import references AND content usage (identifier scanning across all file contents)
- Sunburst chart centered on page with solid hex colors (CSS vars don't apply to canvas)
- Grouped navigation: Overview / Code / Visuals / Analysis / Deps & Insights / AI Chat
- Bundle size estimator shows totals without per-file sizes
- Complexity heatmap uses exports + import frequency + depth (removed file size from scoring)
- GSAP animations on homepage: title, subtitle, input, feature cards stagger in

### Changed
- Sidebar removed — replaced with top grouped tab bar + sub-nav per section
- Homepage redesigned: centered input, particle canvas background, feature card grid
- Scanning page uses animated concentric spinner
- Dashboard home shows quick-navigation cards and entry point list

### Fixed
- Graph physics no longer scatters nodes on hover — physics stops on hover, resumes for 30 ticks after drag release
- Sunburst colors now render correctly (was using CSS variables which canvas cannot read)
- File tree correctly places files under their actual parent directories

## [3.0.0] — 2025

### Added
- 14 analysis views: File Tree, Priority, Dep Graph, Sunburst, Symbols, Symbol Search, Complexity, Dead Code, Circular Deps, Bundle Size, Dependencies, Git History, Insights, AI Chat
- 20+ role badge types with classification engine
- Physics-based dependency graph with drag, zoom, pan
- AI Chat with Claude / GPT-4o / Gemini using user-provided API keys
- Git history with churn rate per file
- Circular dependency detection via DFS
- Bundle size estimation from entry point import chains

## [1.0.0] — 2025

### Added
- Initial release: file tree, dependency graph, import/export analysis