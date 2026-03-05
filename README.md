# Phase I ESA Tools

Free, open-source toolkit for California groundwater site investigations. Interactive dashboards, ASTM E1527-21 report generator, and downloadable Word templates.

**100% client-side** — no server, no database, no sign-up. All data stays in your browser.

## What's Included

### Interactive Tools (HTML)

| Tool | Description |
|------|-------------|
| **Data Sources Dashboard** | 29 federal, state, and geologic databases with filters, charts, API/GIS endpoints |
| **Report Generator** | 5-step Phase I ESA builder with database search tracking and formatted preview |

### Word Templates (.docx)

| Template | Focus |
|----------|-------|
| **Commercial / Industrial** | USTs, RCRA handlers, vapor intrusion, industrial discharge |
| **Undeveloped / Agricultural** | Pesticides, ag wells, wetland delineation, water rights |
| **Residential / Mixed-Use** | Lead paint, asbestos, radon, EJScreen demographics |
| **Master Checklist** | Standalone 28-database investigation checklist for any site type |

## Data Sources Covered

**15 Federal:** USGS NWIS, Water Data APIs, StreamStats, 3DEP, EPA ECHO, Envirofacts, Superfund/CERCLIS, RCRAInfo, UST Finder, Water Quality Portal, EJScreen, FEMA NFHL, USDA Web Soil Survey, National Wetlands Inventory, NOAA Climate Data

**12 California State:** GeoTracker, GAMA, EnviroStor, Cortese List, CASGEM, SGMA Data Viewer, Well Completion Reports, CGS Geologic Hazards, CGS Seismic Hazard Maps, CERS, CA State Geoportal, SWRCB PFAS Program

**2 Geologic/Hydro:** CA SoilWeb (UC Davis), Stanford Groundwater Mapping

## Deploy

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USER/phase1-esa-tools)

Or from the CLI:

```bash
npx vercel
```

### Run locally

```bash
git clone https://github.com/YOUR_USER/phase1-esa-tools.git
cd phase1-esa-tools
npx serve public
```

No build step. No dependencies. Just static files.

## Project Structure

```
phase1-esa-tools/
  public/
    index.html          # Landing page
    dashboard.html      # Data sources dashboard
    generator.html      # Report generator
    templates/
      Phase_I_ESA_Template_Commercial_Industrial.docx
      Phase_I_ESA_Template_Undeveloped_Agricultural.docx
      Phase_I_ESA_Template_Residential_Mixed_Use.docx
      Phase_I_ESA_Master_Data_Source_Checklist.docx
  vercel.json           # Vercel config (clean URLs, download headers)
  package.json
  LICENSE
  README.md
```

## Standards

Templates follow **ASTM E1527-21** (current) and **ASTM E1527-13** (legacy) structure for Phase I Environmental Site Assessments, including all required sections per the standard.

## License

MIT
