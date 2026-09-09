# Platte Crane Live

A standalone, serverless Nebraska Sandhill Crane migration decision engine. The product deliberately distinguishes **official Crane Trust aerial abundance indices** from **modeled between-survey estimates**.

## Local development

```bash
npm install
npm run dev
npm test
npm run backtest
npm run build
```

No paid API is required. Core live sources are NOAA/NWS and USGS; Crane Trust public updates are the observational anchor. MapLibre uses the no-key OpenFreeMap public style. The Rowe Sanctuary camera is prominently linked to Explore.org and does not auto-load.

## Architecture

- Next.js App Router / TypeScript
- Vercel serverless deployment
- normalized source adapters under `lib/sources`
- deterministic scoring/model functions under `lib/models`
- provenance-bearing static Crane Trust survey archive in `data/crane-counts.json`
- live-source graceful degradation (never converts an outage to a zero)
- MapLibre corridor map with verified public anchors only

## Release posture

Development started in September 2026, so the home page launches in **2027 Migration Watch** mode. Full live abundance modeling only activates after sufficient current-year official observations. See `docs/release-checklist.md`.
