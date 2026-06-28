# gov-service-locator — SDD progress

Plan: docs/superpowers/plans/2026-06-28-gov-service-locator.md (12 tasks)

Task 1: complete (commit 584e1f6 + globals.d.ts fix, scaffold builds)
Task 2: complete (7fdcb5a, distance haversine+rankNearby, 5 tests)
Task 3: complete (074eef2, classify 2-layer, 12 tests)
Task 4: complete (8003c3e, geo point-in-polygon, 4 tests)
Tasks 2-4 review: clean (1 Important + 2 Minor fixed in 8d2d607, 22 tests total)
Task 5: complete (d827ce6, services skeleton 16 entries, validation test partial-red as designed)
Task 6: complete (9c9fc72, curated 16 services from official sources, 26/26 tests green) — flags: id_card fee 20-vs-100, elderly hotline 404, verify under review
Tasks 5-6 review: clean (1 Important fixed 3ad451f — elderly hotline; id_card fee 100 & unemployment 1694 confirmed correct)
Task 7: complete (88d26ea ingest, then FIX 3727958) — real offices only per user decision (dropped 920 centroid padding), Thai province names (EN→TH map), floor district 300. Final: 1145 offices (district 352/local 677/dlt 43/revenue 33/sso 15/employment 10/dbd 7/skill 7/passport 1), missing-province 0.96%. 26/26 tests.
Task 8: complete (88ca783, lib/offices loader+nearbyForTypes+byProvince, 2 tests) — trivial verbatim, review deferred to final whole-branch
