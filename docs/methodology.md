# Methodology

## Scientific contract
An **official survey** is a Crane Trust aerial abundance index with its date and published uncertainty when available. A **modeled estimate** is a probabilistic between-survey estimate and always carries uncertainty. Platte Crane Live never labels a modeled estimate a live count.

## Daily historical migration climatology
Observed Crane Trust survey points are retained with provenance and date precision. Exact flight dates remain exact; historical values reconstructed only to survey-week bins remain labeled as such. A shape-preserving PCHIP-style interpolation creates daily trajectories from February 1 through April 20 for modeling and visualization. Interpolated values are never relabeled as observations.

For each calendar day the application derives historical median, p20, p80, minimum, maximum, variance and the fraction of comparable years within 85% of that season's modeled maximum.

## Abundance ensemble
The validated abundance core requires at least two current-season official observations. The latest official survey anchors the state; 2,500 trajectories sample week-to-week transition behavior from comparable 2016–2025 seasons and blend a minority daily-climatology regularization term. Output includes median plus p10/p25/p75/p90 bounds. A survey older than 18 days disables the between-survey estimate rather than projecting indefinitely.

## Historical weather validation
Realized historical weather was reconstructed from ECMWF ERA5 through the Open-Meteo Historical Weather API for Grand Island, Gibbon/Rowe and Kearney for February 1–April 15 of 2016–2025. The experiment used warmth, southerly wind, precipitation, cloud and sunshine aggregated only over elapsed days between surveys. In each held-out year, standardization and coefficient fitting used non-held-out years only.

Weather modestly improved median absolute error by 2.55% and directional accuracy, but worsened mean error, median log error, peak-window classification and p10–p90 coverage. It therefore **does not alter modeled abundance in this release**. This is deliberate model governance, not a missing feature.

## Migration pulse and movement potential
Migration Pulse is based primarily on modeled abundance change: SURGING, RISING, HOLDING, EASING or DEPARTING RAPIDLY. Northbound Movement Potential is separate from cranes present. It uses current southerly tailwind, temperature, precipitation and sky/visibility-relevant conditions. Favorable movement weather can support arrivals early in spring but can accelerate local departure late in spring.

## Season Timing Pressure
Before sufficient current-season surveys exist, timing pressure uses broad seasonal context including overwintering evidence and U.S. Drought Monitor conditions in representative migration states. Once two current-season official observations exist, actual survey timing takes precedence over the preseason signal.

## Temperature departure
The preferred comparison is forecast daily maximum temperature against NOAA/NCEI 1991–2020 `DLY-TMAX-NORMAL` for representative Grand Island and Kearney stations. If the daily service is unavailable, the static fallback is used only for March, the only month represented by the versioned fallback file. Otherwise departure is reported unavailable rather than invented.

## River habitat
USGS discharge/stage at Overton, Kearney and Grand Island are a corridor roost-habitat **proxy**, not a deterministic water-depth estimate. Extreme low/high flows and spatial inconsistency reduce the habitat contribution; no single cfs value is described as universally ideal.

## Public-site ranking
Only verified public or controlled-access anchors are eligible. Ranking combines dawn/dusk/daytime suitability, local forecast quality, corridor river context, access friction and coarse Crane Trust distribution language when available. Vague narrative is never converted into a heat map, and private/sensitive roost coordinates are excluded.

## Roost outlook and safety
The initial viewing score weights are abundance 45, weather 20, river 15, timing 10 and confidence 10. Severe-weather warnings override or cap trip recommendations regardless of crane abundance. Score arithmetic is deterministic and component totals must add exactly.
