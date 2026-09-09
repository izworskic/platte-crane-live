# Methodology

## Scientific contract
An **official survey** is a Crane Trust observation/abundance index with its date and uncertainty when published. A **modeled estimate** is a probabilistic between-survey estimate and always carries an interval. The application never labels the model a live count.

## Historical climatology
Observed weekly values are retained unchanged. Interpolated values are modeling products only. The model uses comparable 2016–2025 Crane Trust seasons and keeps provenance attached to every observation.

## Abundance ensemble
The inexpensive ensemble samples historical week-to-week analog ratios and blends them with the latest current-season official abundance and calendar-date climatology. Output includes median and p10/p25/p75/p90 bounds. Two current-season observations are required before the abundance projection is enabled.

## Migration pulse
Pulse is based primarily on modeled abundance change: SURGING, RISING, HOLDING, EASING, or DEPARTING RAPIDLY. Wind is explanatory context, not the pulse itself.

## Movement potential
Northbound movement potential is separate from local abundance. It incorporates southerly tailwind, temperature, precipitation and sky/visibility proxies. Late in the season, a high movement score can imply faster local departure.

## River habitat
Discharge is a **proxy**, never a claim of local crane roost depth. Extreme low/high flows and spatial inconsistency reduce the habitat contribution.

## Roost outlook
Initial score weights are abundance 45, weather 20, river 15, timing 10, confidence 10. Severe-weather warning logic can cap the recommendation at LOW regardless of abundance.
