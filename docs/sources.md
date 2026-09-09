# Sources

## Crane Trust
Primary observational anchor: Crane Trust crane-count reporting and the report *Spring Aerial Sandhill Crane Counts of the Central Platte River Valley, Nebraska: Weekly Public Updates from 2016 to 2025*. Appendix A supplies the comparable historical weekly abundance-index series. Verified 2026 public updates are appended with provenance. Current public updates are conservatively parsed for counts and coarse distribution language only.

## NOAA / National Weather Service
`api.weather.gov` point, hourly forecast, grid forecast, latest observation and active alert endpoints across Grand Island, Gibbon/Rowe and Kearney. These remain the operational live-weather source.

## NOAA / NCEI climate normals
Official 1991–2020 U.S. Climate Normals. Representative stations are Grand Island Central Nebraska Regional Airport (`USW00014935`) and Kearney Municipal Airport (`USW00014905`). The preferred comparison uses daily `DLY-TMAX-NORMAL`; a versioned representative March fallback is used only when the daily service is unavailable in March.

## Historical weather validation
ECMWF **ERA5** reanalysis retrieved through the Open-Meteo Historical Weather API. The reproducible workflow downloads daily temperature, precipitation, cloud, wind direction/speed, sunshine and shortwave-radiation fields for Grand Island, Gibbon/Rowe and Kearney from February 1 through April 15 for 2016–2025. ERA5 is used only for retrospective model validation; it does not replace NOAA/NWS for live conditions.

## U.S. Drought Monitor
Official U.S. Drought Monitor state-statistics service. Nebraska and representative southern migration states provide broad preseason timing context only; drought is never converted into a crane count.

## USGS Water Services
Instantaneous values for gauges 06768000 (Overton), 06770200 (Kearney) and 06770500 (Grand Island), using discharge 00060 and gage height 00065, plus water temperature where served.

## Maps and public access
MapLibre GL JS with a public basemap. Versioned viewing-site data contain only verified public or controlled-access anchors. No private or sensitive roost coordinates are shipped.

## Camera
Audubon Rowe Sanctuary crane camera on Explore.org. The product provides a prominent link and does not auto-load or bypass access restrictions.
