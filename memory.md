# project-9-gov-service-locator — Memory Log
**Last updated:** 2026-06-28

---

## 1. Project Overview
Thai government service locator — helps users find the right government office for 16 common services, filtered by persona. Next.js 15 + Vitest. No git remote.

## 2. Key Decisions
- `@/` alias resolves to project root (vitest.config.ts + tsconfig.json paths both set this)
- `OfficeType` is the canonical type in `lib/classify.ts`; `config/services.ts` imports from there
- 16 service entries are the fixed catalog; docs/fee/stdHours/officialUrl/hotline/lastVerified are intentionally empty placeholders — a later task fills them

## 3. Current State (Tasks)
- Task 5 DONE (commit d827ce6): `config/services.ts` + `config/services.test.ts` — skeleton catalog + validation tests
- Task 6 DONE (commit 9c9fc72): curated all 16 service entries — docs/fee/stdHours/officialUrl/hotline/lastVerified filled from official agency sources
  - ALL 26 tests GREEN (4 files); "every service is complete and sourced" now passes
  - Sources: bora.dopa.go.th (hotline 1548), consular.mfa.go.th (02 572 8442), dlt.go.th (1584), rd.go.th (1161), sso.go.th (1506), doe.go.th (1694), dsd.go.th (02 245 1707), dbd.go.th (1570), dop.go.th (02 642 4336)
- Task 7 DONE (commit 88d26ea): Overpass ingest + province PiP + baked offices.json
- Task 7b DONE (commit 3727958): Drop centroid padding, Thai province names, floor 300
  - 1145 offices total (real offices only): district=352, local=677, dlt=43, revenue=33, sso=15, skill=7, employment=10, dbd=7, passport=1
  - 11 missing province (0.96%) — acceptable
  - All 26 tests still green

## 4. File Map
- `lib/classify.ts` — OfficeType enum + classifyOffice(); district matched by สำนักงานเขต|ที่ว่าการอำเภอ|ที่ว่าการเขต + townhall fallback (bare อำเภอ removed)
- `lib/geo.ts` — geo utilities
- `lib/distance.ts` — distance utilities
- `config/services.ts` — Service type, PERSONAS array, SERVICES array (16 entries)
- `config/services.test.ts` — catalog integrity tests (4 tests, 1 intentionally red)
- `scripts/ingest-offices.ts` — Overpass ingest; single query (tagged offices only, nodes+ways); form-encoded POST with Accept header; 77-province English→Thai map for province names
- `scripts/provinces.geojson` — apisit/thailand.json (77 provinces, Polygon+MultiPolygon, name= English)
- `public/data/offices.json` — baked office dataset (generatedAt + offices[])

## 5. Ingest Notes
- Overpass requires Accept: application/json + User-Agent headers (Node.js fetch gets 406 without Accept)
- Overpass POST body must be form-encoded: `data=<encodeURIComponent(query)>` not raw body
- Real OSM district offices: ~352 tagged; FLOOR set to 300 (no padding needed)
- Province GeoJSON: apisit/thailand.json at `scripts/provinces.geojson`; property key is `name` (English names); translated to Thai via PROVINCE_EN_TO_TH map in ingest
- out center used (not out body) to get coordinates from way elements
