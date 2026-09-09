# Release checklist

## Passed in repository validation
- Measured and modeled crane values are explicitly separated.
- Model benchmark beats strongest naive baseline by more than 10% median absolute error.
- Source timestamps/freshness semantics are implemented.
- Upstream source failures do not silently become zero crane abundance.
- Severe-weather warning logic caps the trip recommendation.
- Public map contains only public/controlled-access anchors; no private roost coordinates.
- Core operation requires no paid API and no always-on runtime.
- Unit tests cover scoring boundaries, safety, pulse logic, provenance, uncertainty ordering, DST and the official-zero edge case.

## Production gates still required before declaring release-ready
- Vercel production build succeeds.
- Production live NWS/USGS requests verified.
- Playwright desktop + 390x844 production journey passes.
- Lighthouse production: Performance >=90, Accessibility >=95, Best Practices >=95, SEO >=95.
- robots.txt, sitemap.xml, canonical, structured data, Open Graph verified on production URL.
- Runtime error log clean under representative interactions.

Do not mark production-ready while any production gate is unverified.
