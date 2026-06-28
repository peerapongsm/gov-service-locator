import { describe, it, expect } from 'vitest';
import { pointInRing, pointInPolygon, type Ring } from './geo';

const square: Ring = [[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]];

describe('pointInRing', () => {
  it('inside', () => expect(pointInRing(5, 5, square)).toBe(true));
  it('outside', () => expect(pointInRing(15, 5, square)).toBe(false));
});

describe('pointInPolygon with hole', () => {
  const hole: Ring = [[4, 4], [4, 6], [6, 6], [6, 4], [4, 4]];
  it('inside outer, outside hole → true', () => {
    expect(pointInPolygon(2, 2, [square, hole])).toBe(true);
  });
  it('inside hole → false', () => {
    expect(pointInPolygon(5, 5, [square, hole])).toBe(false);
  });
});
