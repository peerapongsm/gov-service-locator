import { describe, it, expect } from 'vitest';
import { haversineKm, rankNearby, type Office } from './distance';

const bangkok = { lat: 13.7563, lon: 100.5018 };
const chiangmai = { lat: 18.7883, lon: 98.9853 };

describe('haversineKm', () => {
  it('Bangkok→Chiang Mai ≈ 580km (±15)', () => {
    expect(haversineKm(bangkok, chiangmai)).toBeGreaterThan(565);
    expect(haversineKm(bangkok, chiangmai)).toBeLessThan(595);
  });
  it('zero distance to self', () => {
    expect(haversineKm(bangkok, bangkok)).toBeCloseTo(0, 5);
  });
});

describe('rankNearby', () => {
  const offices: Office[] = [
    { type: 'dlt', name: 'far', lat: 18.79, lon: 98.98 },
    { type: 'dlt', name: 'near', lat: 13.76, lon: 100.50 },
    { type: 'dlt', name: 'mid', lat: 14.97, lon: 102.10 },
  ];
  it('sorts ascending by distance and attaches km', () => {
    const r = rankNearby(offices, bangkok);
    expect(r.map((o) => o.name)).toEqual(['near', 'mid', 'far']);
    expect(r[0].km).toBeLessThan(r[1].km);
  });
  it('respects limit', () => {
    expect(rankNearby(offices, bangkok, 2)).toHaveLength(2);
  });
  it('empty input → empty', () => {
    expect(rankNearby([], bangkok)).toEqual([]);
  });
});
