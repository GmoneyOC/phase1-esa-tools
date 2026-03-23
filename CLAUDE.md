# CLAUDE.md — Phase I ESA Tools Project Rules

## Project Overview
- **Name:** phase1-esa-tools
- **Version:** 1.0.0
- **Type:** 100% client-side static site (no backend, no database)
- **Stack:** Vanilla HTML5/CSS3/JavaScript, Chart.js 4.5.1 (CDN), DOMPurify 3.3.3 (CDN), Leaflet 1.9.4 (CDN), Vite 8.0.1 build tool, Vercel hosting
- **PWA:** Service worker (sw.js), manifest.json, SVG icons — installable offline-capable app
- **Build:** `npm run build` → Vite outputs to `build/` directory
- **License:** MIT
- **Standard:** ASTM E1527-21 / E1527-13 Phase I Environmental Site Assessments

## File Locations
```
phase1-esa-tools/
├── public/
│   ├── index.html          — Landing page, template downloads
│   ├── dashboard.html      — Data sources dashboard, Chart.js, Leaflet map, filters
│   ├── generator.html      — 5-tab ESA report generator
│   ├── manifest.json       — PWA manifest (app name, icons, display mode)
│   ├── sw.js               — Service worker (offline caching)
│   ├── icons/              — PWA icons (192, 512, maskable SVGs)
│   └── templates/          — 4 downloadable .docx templates
├── .github/workflows/ci.yml — GitHub Actions CI (lint, test, build)
├── tests/
│   ├── validation.test.js   — 36 validation rule tests
│   ├── storage.test.js      — 11 localStorage logic tests
│   └── data_integrity.test.js — 20 data structure + cross-file tests
├── package.json             — Scripts: dev, build, preview, lint, test
├── eslint.config.js         — ESLint v10 flat config (HTML + JS)
├── vite.config.js           — Multi-page build config, asset copy plugin
├── vercel.json              — Vite build config, cache + security headers + CSP
├── .gitignore               — node_modules/, build/, dist/, .env
├── README.md
├── LICENSE
└── CLAUDE.md                — THIS FILE
```

## Supporting Docs (parent directory)
- `../ARCHITECTURE_NOTES.md` — Detailed architecture, data schemas, dependency maps, breakage risks
- `../IMPLEMENTATION_CHECKLIST.md` — 230-item phased checklist (P1.1–P5.4 + verification)
- `../Water_Project_Buildout_Plan.docx` — Strategic roadmap document
- `../Water_Project_Implementation_Plan.xlsx` — 5-sheet detailed plan

---

## CRITICAL RULES

### 1. Data Schema Mismatch — NEVER Forget
Two separate data source arrays exist with INCOMPATIBLE schemas:
- **generator.html** (L409-441): `{ name, url, desc, api: true/false, gis: true/false }` — 28 sources in 2 arrays (FEDERAL_DBS, STATE_DBS), **booleans**
- **dashboard.html** (L249-628): `{ name, url, agency, category, dataType, hasAPI: "Yes"/"No", hasGIS: "Yes"/"No", apiUrl, gisUrl, description, detail }` — 29 sources in 1 array (DATA), **strings**

**Rule:** Until P2.5 consolidation, any data source change must be made in BOTH files with correct types. After P2.5, dashboard's rich schema becomes canonical in `src/data/sources.js`.

### 2. XSS Injection Points — 4 Locations
All use raw `innerHTML` assignment with unsanitized user input:
| File | Line | Context |
|------|------|---------|
| generator.html | L686 | `report-output` innerHTML (preview) |
| generator.html | L513 | `container.innerHTML` (checklist render) |
| dashboard.html | L840 | `container.innerHTML` (table render) |
| dashboard.html | L890 | `container.innerHTML` (detail cards) |

**Rule:** P1.1 fixes these with DOMPurify. Every future innerHTML write MUST sanitize first. After P2.5, use safe DOM APIs from `src/utils/dom.js`.

### 3. vercel.json CSP — Update on Every CDN Addition
The Content-Security-Policy header in vercel.json must be updated whenever a new external script, stylesheet, or connection is added. See ARCHITECTURE_NOTES.md §5 for the full CSP evolution table.

**Current CSP allows:** cdn.jsdelivr.net (Chart.js, DOMPurify), unpkg.com (Leaflet), tile.openstreetmap.org (map tiles), `worker-src 'self'` (SW), `connect-src 'self' https:` (API status checks).

**Rule:** Before adding ANY external resource (CDN script, API endpoint, font, etc.), update the CSP in vercel.json FIRST.

### 4. Inline Event Handlers — Map Before Changing
- generator.html has 16 inline handlers (onclick, onchange) — checkbox onchange removed in QA fix
- dashboard.html has 8 inline handlers (onchange, oninput, onclick)
- Full map in ARCHITECTURE_NOTES.md §4

**Rule:** Do NOT randomly remove inline handlers. They are replaced systematically in P2.6 using event delegation. Any handler change before P2.6 must update the map in §4.

### 11. DOMPurify Strips Event Handlers
DOMPurify removes ALL inline event attributes (onclick, onchange, oninput, etc.) by default. The database checklist in generator.html uses `data-check-id` attributes + programmatic `addEventListener()` after sanitization. Any future dynamically-rendered HTML that needs event handlers MUST use this same pattern — never rely on inline handlers surviving DOMPurify.

### 12. Date Formatting — Use localDateString()
Never use `new Date().toISOString().split("T")[0]` for user-facing dates — it returns UTC which can be off by 1 day. Use the `localDateString()` helper in generator.html which uses `getFullYear()/getMonth()/getDate()`.

### 5. localStorage Architecture
- Key: `phase1-esa-form-data`
- MUST include `version: "1.0"` field for future migration (P4.1 export)
- JSON.parse MUST be wrapped in try/catch — corrupt data triggers graceful reset
- localStorage.setItem() can throw QuotaExceededError — MUST catch and warn user
- REC entries: DOM elements must be recreated BEFORE filling values on restore
- Checklist IDs: `fed-0` through `fed-14`, `st-0` through `st-12` — changing these breaks restore

### 6. Dynamic Elements — Event Delegation Required
- **REC entries** (generator.html): Created by `addREC()`, append-only (no delete in v1). Delegation target: `#rec-list`
- **Checklist items** (generator.html): Created by `renderChecklistGroup()`. Delegation targets: `#federal-list`, `#state-list`
- **Dashboard table** (dashboard.html): Recreated on every filter/sort. Delegation target: `<thead>`

### 7. Chart.js Instances
3 instances stored in `this.charts`: `agency` (doughnut), `datatype` (horizontal bar), `availability` (grouped bar). Update pattern: modify data arrays + `.update('none')`. Dark mode must update `Chart.defaults.color`, `Chart.defaults.borderColor`, then `.update()` all 3.

### 8. Print CSS Preservation
generator.html L148-154 hides everything except preview panel for `@media print`. This MUST be preserved through all restructuring.

### 9. Template Download Links
index.html template links (L198-L219) use `download` attribute, NOT `target="_blank"`. These are NOT part of P1.6 security fixes. Do not modify them.

### 10. Deprecated APIs to Replace
- `document.execCommand("copy")` at generator.html L696 → Replace with `navigator.clipboard.writeText()` in P1.8
- String-based `hasAPI`/`hasGIS` in dashboard → Keep as canonical; generator derives booleans

---

## IMPLEMENTATION ORDER (Critical Path)

```
P1.1-P1.9 (Security) → P2.5 (Modularize/Vite) → P3.2/P3.3/P3.6 (Tests) → P3.4 (CI)
P3.1 (GitHub repo) can start in parallel with Phase 1
```

### Phase 1 (Weeks 1-2): Security & Stability ✅ COMPLETE
- P1.1–P1.9: All done. DOMPurify XSS fixes, input validation, CSP headers, localStorage auto-save, error handling, link security, favicon/meta, Clipboard API, site type validation.

### Phase 2 (Weeks 3-5): Accessibility & Code Quality ✅ COMPLETE
- P2.1: Label `for=` attributes on all forms ✅
- P2.2: Full ARIA — tabs, tabpanels, radiogroup, live regions, expanded states ✅
- P2.3: Keyboard nav — arrow keys, Home/End, Enter/Space, skip links, focus-visible ✅
- P2.4: Semantic HTML — `<header>`, `<main>`, `<nav>`, `<footer>` ✅
- P2.5: Vite build tooling — multi-page config, template copy plugin, build verified ✅
- P2.6: Inline event handler removal — DEFERRED to module extraction
- P2.7: JSDoc documentation — DEFERRED to module extraction

### Phase 3 (Weeks 6-9): Testing & CI/CD ✅ COMPLETE (core items)
- P3.1: GitHub repo ✅ — github.com/GmoneyOC/phase1-esa-tools
- P3.2: E2E tests — DEFERRED (needs CI environment)
- P3.3: Unit tests ✅ — 67 tests (validation, storage, data integrity) using Node.js test runner
- P3.4: GitHub Actions CI ✅ — .github/workflows/ci.yml (lint → test → build)
- P3.5: Vercel ✅ — Connected to GitHub, auto-deploy on push
- P3.6: ESLint ✅ — eslint.config.js, eslint-plugin-html, zero errors/warnings

### Phase 4 (Weeks 10-14): Feature Expansion ✅ COMPLETE (core items)
- P4.1: JSON/CSV export ✅ — exportJSON, importJSON, exportCSV in generator.html
- P4.2: PWA offline ✅ — sw.js, manifest.json, SVG icons, all pages registered
- P4.3: Leaflet map ✅ — Interactive map on dashboard, colored markers, filter sync
- P4.4: API status ✅ — Live status checks with sessionStorage cache, batched HEAD requests
- P4.5: Report scoring ✅ — SVG progress ring, weighted scoring, tab badges
- P4.6: Enhanced charts ✅ (partial) — Radar chart for agency capabilities, 2x2 layout
- P4.7: Debounce ✅ (partial) — 300ms debounce on auto-save and dashboard search

### QA Bug Fixes (Post Phase 4) ✅ COMPLETE
- BUG-1/2: DOMPurify was stripping checkbox onchange handlers — switched to data attributes + programmatic listeners
- BUG-3: SW registration .catch() now logs warnings instead of silent failure
- BUG-4: Date fields use local time (localDateString()) instead of UTC toISOString()
- UX-1: Dashboard table scrollable on mobile (min-width: 900px)
- UX-2/3: Responsive chart legend (bottom on mobile), tighter padding
- UX-5: GitHub link has target="_blank" rel="noopener noreferrer"

---

## CODING STANDARDS

1. **No pseudocode.** All code must be syntactically correct and runnable.
2. **Double-check syntax** before writing any file.
3. **File naming:** Use underscores between words for downloadable artifacts.
4. **Facts only.** Never fabricate API endpoints, data sources, or capabilities.
5. **Ask before coding** anything new (per user preference).
6. **Working code only.** Test or verify before marking complete.
7. **Preserve existing functionality** — no regressions.
8. **Comment non-obvious logic** but don't over-document.

---

## DECISIONS LOG

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | GitHub repo account | `GmoneyOC` personal account | github.com/GmoneyOC/phase1-esa-tools |
| 2 | REC deletion feature | Append-only for v1 | Simpler localStorage schema, no orphan data risk |
| 3 | Multi-tab editing | Ignore for v1 | Edge case, low user impact for single-user tool |
| 4 | ASTM disclaimer | Add to footer of generator and templates | Professional liability protection, industry standard |
| 5 | DOMPurify vs DOM API | DOMPurify now (P1.1), refactor to safe DOM APIs in P2.5 | Fastest XSS fix without restructuring; DOM APIs better long-term |
| 6 | Template versioning | No version in filenames for v1 | Clean download names; track versions via git tags instead |
| 7 | Test deploy timing | Deploy during Phase 1 (after P1.3) | Early validation of Vercel config + security headers |
| 8 | DOMPurify + event handlers | Use data attributes + programmatic listeners | DOMPurify strips all inline event attrs by design; this pattern preserves XSS protection |
| 9 | Date formatting | localDateString() helper | toISOString() returns UTC, off by 1 day in western timezones |

---

## SKILLS & TOOLS REFERENCE

| Task | Skill/Tool |
|------|-----------|
| XSS / security review | `engineering:code-review` |
| Accessibility audit | `design:accessibility-review` |
| Module architecture | `engineering:system-design` |
| Test strategy | `engineering:testing-strategy` |
| Documentation | `engineering:documentation` |
| Chart.js API docs | Context7 MCP → `/chartjs/chart.js` |
| Leaflet API docs | Context7 MCP → resolve "leaflet" |
| Vercel config docs | `mcp__vercel__search_vercel_documentation` |
| Code search | Grep tool |
| File modification | Edit tool |
| New files | Write tool |
| Commands | Bash tool |
| Latest docs | WebSearch tool |

---

## REMINDERS
- Read ARCHITECTURE_NOTES.md §12 ("Things That Will Break") before ANY structural change
- Read IMPLEMENTATION_CHECKLIST.md before starting any phase task
- The two files above are the source of truth — keep them updated as work progresses
