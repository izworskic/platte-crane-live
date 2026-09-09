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

The historical aggregate is reconstructed automatically from versioned year shards before development, tests, backtests, and builds. No hidden data file is required.

No paid API is required. Core live sources are NOAA/NWS and USGS; Crane Trust public updates are the observational anchor. MapLibre uses a no-key public style. The Rowe Sanctuary camera is linked to Explore.org and does not auto-load.

## Architecture

- Next.js App Router / TypeScript
- Vercel serverless deployment target
- normalized source adapters under `lib/sources`
- deterministic scoring/model functions under `lib/models`
- provenance-bearing Crane Trust survey shards under `data/`
- reproducible leave-one-year-out benchmark under `scripts/backtest.mjs`
- live-source graceful degradation; an outage never becomes a zero crane estimate
- MapLibre corridor map with public/controlled-access anchors only

## Release posture

Development began in September 2026, so the home page launches in **2027 Migration Watch** mode. Full between-survey abundance modeling activates only after at least two current-season official observations and expires when the survey anchor becomes too stale. Production readiness additionally requires a successful Vercel build, production Playwright journey, live-source verification, and Lighthouse release gates. See `docs/release-checklist.md`.
