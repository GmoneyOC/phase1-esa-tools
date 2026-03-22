# CLAUDE.md — Phase I ESA Tools Project Rules

## Project Overview
- **Name:** phase1-esa-tools
- **Version:** 1.0.0
- **Type:** 100% client-side static site (no backend, no database)
- **Stack:** Vanilla HTML5/CSS3/JavaScript, Chart.js 4.5.1 (CDN), DOMPurify 3.3.3 (CDN), Vite 8.0.1 build tool, Vercel hosting
- **Build:** `npm run build` → Vite outputs to `build/` directory
- **License:** MIT
- **Standard:** ASTM E1527-21 / E1527-13 Phase I Environmental Site Assessments

## File Locations
```
phase1-esa-tools/
├── public/
│   ├── index.html          — Landing page, template downloads
│   ├── dashboard.html      — Data sources dashboard, Chart.js, filters
│   ├── generator.html      — 5-tab ESA report generator
│   └── templates/          — 4 downloadable .docx templates
├── .github/workflows/ci.yml — GitHub Actions CI (lint, test, build)
├── tests/
│   ├── validation.test.js   — 36 validation rule tests
│   ├── storage.test.js      — 11 localStorage logic tests
│   └── data_integrity.test.js — 20 data structure + cross-file tests
├── package.json             — Scripts: dev, build, preview, lint, test
├── eslint.config.js         — ESLint v10 flat config (HTML + JS)
├── vite.config.js           — Multi-page build config, template copy plugin
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

**Rule:** Before adding ANY external resource (CDN script, API endpoint, font, etc.), update the CSP in vercel.json FIRST.

### 4. Inline Event Handlers — Map Before Changing
- generator.html has 17 inline handlers (onclick, onchange)
- dashboard.html has 8 inline handlers (onchange, oninput, onclick)
- Full map in ARCHITECTURE_NOTES.md §4

**Rule:** Do NOT randomly remove inline handlers. They are replaced systematically in P2.6 using event delegation. Any handler change before P2.6 must update the map in §4.

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

### Phase 3 (Weeks 6-9): Testing & CI/CD — IN PROGRESS
- P3.1: GitHub repo creation — PENDING (requires user auth for GmoneyOC)
- P3.2: E2E tests — DEFERRED (needs CI environment)
- P3.3: Unit tests ✅ — 67 tests (validation, storage, data integrity) using Node.js test runner
- P3.4: GitHub Actions CI ✅ — .github/workflows/ci.yml (lint → test → build)
- P3.5: Vercel preview — PENDING (needs P3.1)
- P3.6: ESLint ✅ — eslint.config.js, eslint-plugin-html, zero errors/warnings

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
