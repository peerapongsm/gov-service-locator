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
  - 3 tests PASS (unique ids, officeTypes valid, persona refs valid)
  - 1 test RED intentionally ("every service is complete and sourced") — placeholders empty; later task fills them

## 4. File Map
- `lib/classify.ts` — OfficeType enum + classifyOffice()
- `lib/geo.ts` — geo utilities
- `lib/distance.ts` — distance utilities
- `config/services.ts` — Service type, PERSONAS array, SERVICES array (16 entries)
- `config/services.test.ts` — catalog integrity tests (4 tests, 1 intentionally red)
