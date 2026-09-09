# Model benchmark

The reproducible leave-one-year-out benchmark is `scripts/backtest.mjs`; machine-readable output is stored in `artifacts/model-benchmark.json`.

## Current result

Across **72 eligible holdouts** from the comparable 2016–2025 Crane Trust series:

- Historical calendar-date baseline median absolute error: **101,750 cranes**
- Previous-count baseline median absolute error: **96,000 cranes**
- Candidate analog ensemble median absolute error: **64,370 cranes**
- Improvement over strongest naive baseline: **32.95%**
- Candidate symmetric MAPE: **55.73%**
- Candidate median log-abundance error: **0.483**
- Directional accuracy (rising / holding / falling): **80.56%**
- Peak-window classification accuracy: **81.94%**
- Calibrated p10–p90 interval coverage: **86.11%**

The candidate therefore clears the release requirement of at least 10% lower median error.

## Method

For each held-out year/week, the candidate uses the previous official observation from that year, historical week-to-week transition ratios from **other years only**, and the other-year calendar-date median. Its uncertainty radius is calibrated with nested predictions using only the non-held-out years. Peak classification uses non-held-out-year peak climatology.

## Limitations

Aerial survey values are abundance indices with observation error, not exact censuses. Many historical records are week-bin dates rather than exact flight dates. Very small late-season counts make ordinary MAPE unstable, so symmetric MAPE and log error are emphasized alongside absolute error. Weather covariates are not credited in historical validation unless they can be reconstructed without look-ahead.
