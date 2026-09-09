# Data freshness

Platte Crane Live never equates a successful cache read with fresh data.

States: **LIVE**, **RECENT**, **AGING**, **STALE**, **UNAVAILABLE**.

- NWS weather: target refresh 15 minutes.
- USGS instantaneous values: target refresh 15 minutes.
- Crane Trust public updates: target refresh 30–60 minutes during season; displayed freshness is based on the observation/publication timestamp, not cache time.
- Historical survey archive: static/versioned.

Source failure preserves the last defensible observation where available, labels it stale, widens model uncertainty, and lowers confidence. An outage never becomes a zero crane count.
