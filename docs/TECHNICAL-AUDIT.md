# L2 DPS Calculator

## 1. Purpose

Client-side web application that parses Lineage 2 game combat log files (`.log`) and computes Damage Per Second (DPS) statistics. It extracts skill names, individual damage values, and critical hit events from raw log text, then aggregates min/max/average damage, hit counts, and critical hit rates per skill. Users can save, rank, compare, and export results.

No backend. No network requests to external APIs. All processing runs in the browser.

## 2. Architecture

- **Type**: Single-Page Application (SPA), purely client-side.
- **Pattern**: Flat component hierarchy with a single active "page" component (`LogProcessor`). No routing library; component switching is controlled by state in `App.js` (only one component is currently active).
- **State management**: Local `useState`/`useEffect` hooks per component. No global state library (Redux, Zustand, etc.). Cross-component data sharing is done via props drilling and React Context (for i18n only).
- **Persistence**: Browser `localStorage` — used as the sole data layer.
- **Build**: Create React App (CRA) with default Webpack configuration; no eject, no custom build modifications.
- **Deployment target**: GitHub Pages (static hosting).

```
index.js (entry)
  └── LanguageProvider (Context)
        └── App
              ├── SEO (meta tag manager, renders null)
              ├── LogProcessor (active main view)
              │     ├── Onboarding (modal)
              │     ├── ComparisonDisplay (table)
              │     └── LanguageSelector (dropdown, also in footer)
              └── BuffDebuffChecker (imported, conditionally rendered, currently dead code)
```

No backend/frontend separation — this is a monolithic frontend application.

## 3. Core Technical Components

### LogProcessor (`LogProcessor.js`, ~680 lines)
The central component. Handles:
- **File ingestion**: Drag-and-drop or file picker for `.log` files, read via `FileReader` API. Also accepts manual text paste.
- **Log parsing** (`calculateDPS` function): Regex-based line-by-line parser. Matches three patterns:
  - `You have used (.+?)[.]` → skill identification
  - `landed a critical hit` / `M. Critical!` → critical hit flag (applies to the *next* damage line)
  - `has dealt ([\d,]+) damage` → damage extraction (ignores values ≤ 1)
- **DPS calculation**: `totalDamage / fightDuration` where `fightDuration` is user-supplied (default 60s). Not auto-detected from timestamps.
- **Result persistence**: Save to `localStorage` with user-provided name.
- **Export**: Copy results as formatted text to clipboard, or render as PNG image via `html2canvas` and copy to clipboard.

### ComparisonDisplay (`ComparisonDisplay.js`, ~270 lines)
Sortable table for comparing skill statistics across saved runs. Supports:
- Sort by min, max, or average damage (toggleable asc/desc).
- Expandable rows showing raw damage log lines.
- Export comparison as text or image (builds a temporary off-screen DOM element for `html2canvas` capture).

### Onboarding (`Onboarding.js`, ~190 lines)
6-slide tutorial modal. Auto-shows on first visit (checks `localStorage` flag). Supports navigation, skip, and re-open via help button. Fully internationalized.

### LanguageSelector (`LanguageSelector.js`, ~65 lines)
Dropdown for switching between 10 supported languages. Closes on outside click via `mousedown` event listener on `document`.

### SEO (`components/SEO.js`, ~170 lines)
Headless component (renders `null`). Dynamically updates `<title>`, `<meta>`, Open Graph, and Twitter Card tags based on current language. Also exports a `useSEO` hook for programmatic meta tag updates (not currently used outside the component).

### i18n System (`i18n/`)
Custom-built internationalization layer (no external i18n library):
- 10 language JSON files with nested key structure.
- `LanguageContext.js`: React Context provider with `t()` translation function supporting dot-notation keys and `{{variable}}` interpolation.
- Language preference persisted to `localStorage`.

### BuffDebuffChecker (`BuffDebuffChecker.js`)
Stub component — imports and renders a title, but contains no functional logic. Imported in `App.js` but only rendered when `activeComponent === "buffDebuffChecker"`, which is never set in the current code. **Dead code / placeholder.**

## 4. Data Layer

- **Database**: None. All data stored in browser `localStorage`.
- **Schema**: Unstructured key-value pairs in `localStorage`. Each saved result is a JSON blob keyed by user-provided name:
  ```
  {
    dps: number,
    skillInfo: { [skillName]: { min, max, average, criticalHits, hits, damageLines[], validDamages[] } },
    saveName: string,
    fightDuration: number
  }
  ```
- **Data retrieval**: On mount, `LogProcessor` iterates *all* `localStorage` keys, attempts `JSON.parse` on each, and collects valid DPS data objects. Non-DPS keys (e.g., `appVersion`, `l2dps_language`) that fail parsing are caught silently.
- **Data migration**: On load, retroactively computes `average` for saved entries missing it (backward compatibility patch).
- **No data validation schema**: No schema enforcement on write or read beyond try/catch on `JSON.parse`.

## 5. Automation & Infrastructure

- **CI/CD**: No CI pipeline files detected (no `.github/workflows`, no other CI config).
- **Deployment**: Manual via `npm run deploy` which runs `gh-pages -d build` to push the `/build` directory to GitHub Pages.
- **Build**: Standard CRA pipeline (`react-scripts build`).
- **SEO assets**: Static `robots.txt`, `sitemap.xml`, `llms.txt`, and extensive JSON-LD structured data in `index.html`. This is atypical for a small game tool and suggests SEO optimization effort.
- **No cron jobs, background tasks, or scheduled processes.**
- **No environment-specific configuration** (no `.env` files, no environment branching).

## 6. Security & Reliability

- **Authentication/Authorization**: None required — fully client-side tool with no user accounts.
- **Input handling**: Log file content is read as text and processed via regex. No sanitization of log content before rendering — some damage log lines are rendered directly in the UI via `.map()` in JSX. The onboarding component uses `dangerouslySetInnerHTML` for translated content (controlled strings from bundled JSON files, not user input).
- **File validation**: Only checks file extension (`.endsWith(".log")`). No MIME type validation, no file size limits.
- **Error handling**: Minimal. `try/catch` around `JSON.parse` for localStorage reads. `html2canvas` errors are caught and logged. No global error boundary.
- **XSS surface**: Low risk in practice since the app is client-only and log content comes from local files, but raw log lines are rendered as text nodes (safe). Translation files use `dangerouslySetInnerHTML` but are bundled (not user-supplied).
- **No rate limiting, no CORS concerns** (no network requests).
- **Logging**: `console.log`/`console.error` only. No structured logging or observability.

## 7. External Integrations

| Dependency | Purpose |
|---|---|
| `html2canvas` (1.4.1) | Renders DOM elements to canvas for image export to clipboard |
| `@fortawesome/react-fontawesome` + `free-solid-svg-icons` | Icon library (trash, sort, expand/collapse icons) |
| `web-vitals` (2.1.4) | Core Web Vitals measurement (default CRA inclusion; `reportWebVitals()` called but no handler configured) |
| `gh-pages` (dev) | Deployment to GitHub Pages |

No external API calls. No analytics SDKs. No third-party auth. No backend services.

## 8. Notable Engineering Decisions

- **Custom i18n over established libraries**: Built a bespoke translation system instead of using `react-i18next` or `react-intl`. Simpler but lacks features (pluralization, number formatting, date formatting, namespace loading).
- **`localStorage` as primary database**: Deliberate choice for a zero-backend architecture. Trade-off: no cross-device sync, data limit (~5-10 MB), data loss on browser clear.
- **Fight duration is manually specified**: DPS calculation requires user to input fight duration rather than parsing timestamps from logs. This may be a limitation of the Lineage 2 log format or a simplification.
- **Image export via off-screen DOM rendering**: `ComparisonDisplay` creates a temporary `<div>` with inline styles at `position: fixed; top: -9999px`, renders with `html2canvas`, then removes it. This avoids CSS class dependency issues during capture.
- **Clipboard API for image export**: Uses `ClipboardItem` with `image/png` blob — modern API, not supported in all browsers. No fallback for browsers without the Async Clipboard API.
- **Damage values ≤ 1 are filtered out**: Explicit decision in the parser (`if (damage > 1)`), presumably to skip shield/absorb results.
- **Critical hit tracking uses a lookahead flag**: Critical hit lines set `nextHitIsCritical = true`, which applies to the subsequent damage line. This assumes critical hit messages always precede their corresponding damage line in the log — a fragile coupling to the game's log format.
- **Aggressive SEO investment**: For a niche game tool, the project includes structured data (JSON-LD), sitemap, robots.txt with per-crawler rules, `llms.txt` for AI crawlers, Open Graph tags, Twitter Cards, and dynamic meta tag management. This is disproportionate to the application size.
- **Dependency overrides**: `package.json` contains 22 transitive dependency overrides, patching known vulnerabilities in CRA's dependency tree (e.g., `ws`, `cross-spawn`, `postcss`, `node-forge`). This is a practical workaround for CRA's unmaintained dependency graph.

## 9. Current State

**Production-deployed** — live on GitHub Pages with a build artifact in the repository.

### Complete and functional:
- Log file parsing and DPS calculation
- Per-skill statistical breakdown (min/max/avg/hits/crits/crit%)
- Save/load/delete results from localStorage
- Skill comparison across saved results with sortable table
- Export to clipboard (text and image)
- 10-language i18n with persistence
- 6-slide onboarding tutorial
- Dynamic SEO meta tag management
- Responsive design (mobile/desktop)
- Version management with data migration prompt

### Scaffolded but unused:
- `BuffDebuffChecker` component — exported, imported, conditionally rendered, but the render condition is never triggered. Contains no logic beyond a translated title.
- `activeComponent` state in `App.js` with conditional rendering for component switching — the setter is never called in the UI (no tabs/navigation). The component switching mechanism exists but is inert.
- `useSEO` hook exported from `SEO.js` — defined but not imported or used anywhere.

### Missing / weak:
- **Test coverage**: Single test file (`App.test.js`) with a boilerplate CRA test that asserts "learn react" text exists — this test **will fail** against the current UI (the text "learn react" does not appear in the app). Effectively zero test coverage.
- No error boundaries.
- No input validation on save name (empty string or localStorage key collision possible).
- No data export/import (backup/restore) capability.
- No fight duration auto-detection from log timestamps.
- No TypeScript — all JavaScript with no type annotations.

## 10. Technical Level Assessment

**Junior to Mid level.**

Justification:
- **Flat architecture**: Single-component monolith (`LogProcessor` at ~680 lines) handling file I/O, parsing, state management, persistence, and rendering. No separation of concerns between data processing and presentation.
- **No abstraction layers**: Business logic (log parsing, DPS calculation) is embedded directly in the component function body, not extracted into hooks, utilities, or services.
- **Naive data layer**: Iterating all `localStorage` keys on mount and trying `JSON.parse` on each is a brute-force approach with no key namespacing.
- **No testing**: The sole test is a broken CRA boilerplate. Zero unit tests for the parser, which is the most critical and testable piece.
- **No TypeScript**: For a data-processing application, the lack of type safety on the skill data schema is a reliability risk.
- **Duplicated code**: File upload handling (drag-drop and file picker) duplicates the same `FileReader` logic. Number formatting regex (`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")`) is copy-pasted ~15 times across components.
- **Custom i18n shows initiative** but the implementation is straightforward (key lookup + simple string interpolation).
- **SEO work is thorough** and demonstrates awareness of web standards beyond basic React development.
- **Dependency vulnerability management** (overrides block) shows awareness of supply chain security, which is a positive signal.

The project is a functional, deployed tool that solves a real problem for its target audience. It demonstrates competence with React fundamentals, browser APIs, and web deployment, but lacks the structural patterns (separation of concerns, testability, type safety, error handling) expected at a senior level.
