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

The historical crane aggregate is reconstructed automatically from versioned year shards before development, tests, backtests and builds. No hidden data file is required.

## Historical weather experiment

The repository also contains a reproducible ERA5 experiment:

```bash
npm run weather:fetch
npm run backtest:weather
node scripts/weather-release-decision.mjs
```

It reconstructs 2016–2025 February–April daily weather for Grand Island, Gibbon/Rowe and Kearney and evaluates whether weather improves the leave-one-year-out abundance model without look-ahead. The current result is deliberately **not promoted into abundance**: median error improved only 2.55% while mean error, log error, peak classification and interval coverage worsened. Weather remains active in movement potential, season timing and viewing outlook.

## Architecture

- Next.js App Router / TypeScript
- Vercel serverless deployment target
- Crane Trust public updates as the observational anchor
- NOAA/NWS for operational weather and hazards
- NOAA/NCEI 1991–2020 normals for temperature departure
- USGS Platte River gauges for the river-habitat proxy
- U.S. Drought Monitor for broad preseason timing context
- ERA5 via Open-Meteo for retrospective model validation only
- deterministic scoring/model functions under `lib/models`
- provenance-bearing Crane Trust survey shards under `data/`
- live-source graceful degradation; an outage never becomes a zero crane estimate
- MapLibre corridor map with public/controlled-access anchors only
- Rowe Sanctuary camera linked to Explore.org without auto-loading

## Release posture

Development began in September 2026, so the home page launches in **2027 Migration Watch** mode. Full between-survey abundance modeling activates only after at least two current-season official observations and expires when the survey anchor becomes too stale. The repository includes unique utility routes for crane counts, trip timing and public viewing access. Production readiness additionally requires final Vercel deployment, production Playwright journeys, live-source verification and Lighthouse release gates. See `docs/release-checklist.md`.
