# Model benchmark

The reproducible abundance benchmark is `scripts/backtest.mjs`. The historical-weather experiment is `scripts/backtest-weather.mjs`; its independent release decision is `scripts/weather-release-decision.mjs`.

## Validated abundance core

Across **72 leave-one-year-out holdouts** from the comparable 2016–2025 Crane Trust series:

- Historical calendar-date baseline median absolute error: **101,750 cranes**
- Previous-count baseline median absolute error: **96,000 cranes**
- Survey-transition candidate median absolute error: **64,370 cranes**
- Improvement over strongest naive baseline: **32.95%**
- Candidate symmetric MAPE: **55.73%**
- Candidate median log-abundance error: **0.483**
- Directional accuracy: **80.56%**
- Peak-window classification accuracy: **81.94%**
- Calibrated p10–p90 interval coverage: **86.11%**

The survey-transition core clears the release requirement of at least 10% lower median error.

## Historical weather experiment

A separate workflow reconstructed **2,229 ERA5 daily location records** for Grand Island, Gibbon/Rowe and Kearney covering February 1–April 15 of 2016–2025. Weather features were aggregated only over days already elapsed between official surveys. For each held-out year, normalization and the weather coefficient were fit from non-held-out years using nested predictions.

The weather-conditioned candidate produced:

- Median absolute error: **62,731 cranes** versus 64,370 for the core (**2.55% improvement**)
- Mean absolute error: **107,257** versus 102,216 (**worse**)
- sMAPE: **54.55%** versus 55.73% (better)
- Median log error: **0.536** versus 0.483 (**worse**)
- Directional accuracy: **81.94%** versus 80.56% (better)
- Peak-window classification: **77.78%** versus 81.94% (**worse**)
- p10–p90 coverage: **80.56%** versus 86.11% (**worse**)

The exact-date subset was only 11 holdouts and is treated as secondary evidence.

## Release decision

**Weather is not promoted into the abundance estimate in this release.** The modest median-error improvement is not enough to justify worse mean error, log error, peak classification and interval coverage. Weather remains active in Northbound Movement Potential, Season Timing Pressure and the viewing/outlook layer.

The release gate requires at least 5% LOYO median-absolute-error improvement, mean absolute error no more than 2% worse, no worse median log error, peak classification within 2 percentage points, and p10–p90 coverage of at least 80%.

## Limitations

Crane Trust aerial values are abundance indices with observation error, not exact censuses. Many older records are survey-week bins rather than exact flight dates. ERA5 is a reanalysis product rather than an archived point forecast; it is appropriate for testing whether realized weather contains incremental signal, not for claiming historical forecast skill. Very small late-season crane counts make ordinary MAPE unstable, so absolute error, sMAPE, log error, direction and calibration are evaluated together.
