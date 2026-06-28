import { describe, it, expect } from 'vitest';
import { nearbyForTypes, byProvince } from './offices';
import type { Office } from './distance';

const all: Office[] = [
  { type: 'district', name: 'A', lat: 13.7, lon: 100.5, province: 'กรุงเทพมหานคร' },
  { type: 'local', name: 'B', lat: 13.8, lon: 100.6, province: 'กรุงเทพมหานคร' },
  { type: 'dlt', name: 'C', lat: 18.8, lon: 99.0, province: 'เชียงใหม่' },
];

describe('nearbyForTypes', () => {
  it('filters to requested types and ranks', () => {
    const r = nearbyForTypes(all, ['district', 'local'], { lat: 13.75, lon: 100.5 });
    expect(r.map((o) => o.name)).toEqual(['A', 'B']);
  });
});
describe('byProvince', () => {
  it('filters by province and types', () => {
    expect(byProvince(all, ['dlt'], 'เชียงใหม่').map((o) => o.name)).toEqual(['C']);
    expect(byProvince(all, ['district'], 'เชียงใหม่')).toEqual([]);
  });
});
