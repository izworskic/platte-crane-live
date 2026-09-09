# Release checklist

## Passed repository gates
- [x] Official Crane Trust observations and modeled abundance are explicitly separated.
- [x] 92 provenance-bearing survey records assemble reproducibly from versioned shards.
- [x] Survey-transition model beats the strongest naive baseline by 32.95% median absolute error.
- [x] Historical ERA5 weather archive reconstructs 2,229 corridor daily-location records reproducibly.
- [x] Weather covariate experiment is leakage-controlled and governed by a separate release decision.
- [x] Mixed weather result is rejected from abundance rather than promoted on a single favorable metric.
- [x] Source timestamps/freshness semantics are implemented.
- [x] Upstream source failures do not silently become zero crane abundance.
- [x] Severe-weather warning logic caps the trip recommendation.
- [x] Public map contains only public/controlled-access anchors; no private roost coordinates.
- [x] Core operation requires no paid API and no always-on runtime.
- [x] 20 deterministic scenario fixtures cover early surge, peak, departure, stale/outage, safety, extreme flows, winter/off-season, DST, malformed upstream data and slow mobile network.
- [x] Lint and production Next.js build passed for the prior release candidate; hardening branch reruns the same gate before merge.

## Production gates still required before declaring release-ready
- [ ] Hardening branch production build passes after latest changes.
- [ ] Final merged SHA deployed to Vercel and public URL resolves.
- [ ] Production live NWS/USGS/Crane Trust source status verified.
- [ ] Playwright desktop + 390×844 production journey passes.
- [ ] Lighthouse production: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95.
- [ ] robots.txt, sitemap.xml, canonical, structured data and Open Graph verified on production URL.
- [ ] Runtime error log clean under representative interactions.

Do not mark production-ready while any production gate remains unverified.
