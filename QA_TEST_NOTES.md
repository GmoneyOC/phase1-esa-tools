# QA Test Notes — Phase I ESA Toolkit
**Tested:** 2026-03-22
**URL:** https://phase1-esa-tools.vercel.app
**Deployment:** Commit 4279ab4, Vercel (all 4 deployments READY)

---

## BUGS (Must Fix)

### BUG-1: Database checklist counters not updating
**Page:** generator.html — Tab 2 (Databases)
**Steps:** Check any database checkbox, select a Finding value
**Expected:** Summary counters (TOTAL CHECKED, FEDERAL, CA STATE, COMPLETE %) and section counters (e.g. "0 / 15") should update
**Actual:** All counters remain at 0 despite checkboxes being checked and findings being set. The tab percentage badge DOES update (Databases shows 4%), so scoring logic works — it's the in-tab counter display that's broken.
**Severity:** High — core UX feature is non-functional

### BUG-2: Database date auto-fill not working
**Page:** generator.html — Tab 2 (Databases)
**Steps:** Check a database checkbox
**Expected:** Per the description ("Dates auto-fill when checked"), the date field should populate with today's date
**Actual:** Date field remains empty (mm/dd/yyyy placeholder)
**Severity:** Medium — described feature not working

### BUG-3: Service worker not auto-registering
**Page:** All pages
**Steps:** Load any page, check `navigator.serviceWorker.getRegistration()`
**Expected:** SW should be registered automatically on page load
**Actual:** SW is not registered. Manual `navigator.serviceWorker.register('/sw.js')` succeeds. The `.catch()` in the registration code silently swallows errors.
**Fix:** Add `console.warn` in the catch block to surface errors. May also be a Vite build / path issue on first load.
**Severity:** Medium — PWA offline functionality not available until manually triggered

### BUG-4: Report date shows tomorrow (timezone issue)
**Page:** generator.html — Tab 1 (Site Info)
**Steps:** Load generator, check REPORT DATE field
**Expected:** Should show today's date (2026-03-22)
**Actual:** Shows 03/23/2026 (tomorrow). Likely using `new Date()` without timezone consideration — Vercel server or `toISOString()` returns UTC which is +1 day.
**Severity:** Low — cosmetic but could confuse users

---

## UI/UX Issues (Should Fix)

### UX-1: Dashboard table not scrollable on mobile
**Page:** dashboard.html at 375px width
**Issue:** The data table columns (GIS, STATUS, DESCRIPTION) are cut off on mobile. No horizontal scroll available.
**Fix:** Add `overflow-x: auto` wrapper around the table, or switch to a card layout on mobile.
**Severity:** Medium

### UX-2: Dashboard doughnut chart legend clipped on mobile
**Page:** dashboard.html at 375px width
**Issue:** Agency legend second column (DWR, CGS, Cal/EPA, State of CA, UC Davis, Stanford) not visible on mobile.
**Fix:** Set Chart.js legend `position: 'bottom'` on mobile or reduce font size.
**Severity:** Low

### UX-3: Availability chart axis label clipped on mobile
**Page:** dashboard.html at 375px width
**Issue:** "GIS / WMS" x-axis label renders as "GIS / WM" (truncated).
**Fix:** Shorter label on mobile or rotate labels.
**Severity:** Low

### UX-4: Dashboard filter bar takes excessive vertical space on mobile
**Page:** dashboard.html at 375px width
**Issue:** Filter labels and dropdowns stack vertically consuming ~40% of the viewport before any content.
**Fix:** Consider collapsible filter panel or horizontal scroll filter row on mobile.
**Severity:** Low

### UX-5: GitHub link on landing page missing target/rel attributes
**Page:** index.html
**Issue:** GitHub link in footer opens in same tab and has no `rel="noopener noreferrer"` or `target="_blank"`.
**Fix:** Add `target="_blank" rel="noopener noreferrer"` to external GitHub link.
**Severity:** Low

### UX-6: No export success feedback
**Page:** generator.html — Preview tab
**Issue:** Clicking "Export JSON" or "Export Database Checklist (CSV)" triggers a download but shows no toast/notification confirming success.
**Fix:** Show a brief toast "Exported successfully" when download triggers.
**Severity:** Low

---

## Working Well (Confirmed)

- **Landing page**: Clean layout, responsive at 375px, all links work, 4 template downloads present
- **Dashboard charts**: All 4 charts render (doughnut, bar, availability, radar). Data is accurate.
- **Dashboard filters**: Category, Data Type, API, GIS dropdowns all filter correctly. Stats/charts/table update in sync.
- **Dashboard search**: Debounced search works (tested "PFAS" → 2 results). Charts and stats update correctly.
- **Dashboard map**: Leaflet renders with color-coded circle markers. Popups show agency, description, API/GIS badges, and source links.
- **Dashboard API status**: Live status checking works. Shows green Online, gray Unknown, red Timeout with accurate real-world results.
- **Dashboard table**: 29 sources with sortable columns, source links, category badges, API/GIS badges, status indicators, descriptions.
- **Generator tabs**: 5-tab form with percentage badges. Tab switching works. Progress bar updates.
- **Generator scoring**: Selecting site type, filling fields all update percentages correctly.
- **Generator site types**: 3 cards (Commercial/Industrial, Undeveloped/Agricultural, Residential/Mixed-Use) with proper selection highlighting.
- **Generator preview**: Full ASTM E1527-21 structured report with sections 1.0-10.0, placeholder templates, red italic prompts, signature block.
- **Generator export**: JSON and CSV exports run without console errors. Downloads trigger correctly.
- **Report structure**: Follows ASTM E1527-21 section numbering (1.0 Executive Summary, 3.0 Site Description, 5.0 Records Review, 6.0 Physical Setting, 9.0 Findings, 10.0 Conclusions).
- **Database checklist**: 28 databases with checkboxes, API/GIS badges, finding dropdowns (5 options), date pickers. Federal (15) and CA State (13) sections.
- **PWA manifest**: Present and correctly linked (Vite hashes filename but works).
- **Theme color**: Correctly set to #1b3a5c.
- **No console errors**: Zero JS errors across all three pages.
- **Responsive landing page**: Cards stack, badges wrap, template grid adapts. No overflow issues.

---

## Recommended Priority Order

1. **BUG-1** — Database counters (breaks core workflow)
2. **BUG-2** — Date auto-fill (described feature not working)
3. **UX-1** — Mobile table scroll (accessibility on mobile)
4. **BUG-3** — Service worker registration (PWA broken)
5. **BUG-4** — Report date timezone
6. **UX-5** — GitHub link security
7. **UX-6** — Export feedback toast
8. **UX-2/3/4** — Mobile chart/filter polish
