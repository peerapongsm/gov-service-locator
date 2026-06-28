import { describe, it, expect } from 'vitest';
import { SERVICES, PERSONAS } from './services';

const OFFICE_TYPES = new Set([
  'district','local','passport','dlt','revenue','sso','employment','skill','dbd',
]);

describe('SERVICES catalog integrity', () => {
  it('has unique ids', () => {
    expect(new Set(SERVICES.map((s) => s.id)).size).toBe(SERVICES.length);
  });
  it('every service is complete and sourced', () => {
    for (const s of SERVICES) {
      expect(s.title, s.id).toBeTruthy();
      expect(s.persona.length, s.id).toBeGreaterThan(0);
      expect(s.docs.length, `${s.id} docs`).toBeGreaterThan(0);
      expect(s.fee, `${s.id} fee`).toBeTruthy();
      expect(s.stdHours, `${s.id} stdHours`).toBeTruthy();
      expect(s.channel.length, `${s.id} channel`).toBeGreaterThan(0);
      expect(s.officialUrl, `${s.id} url`).toMatch(/^https:\/\//);
      expect(s.hotline, `${s.id} hotline`).toBeTruthy();
      expect(s.lastVerified, `${s.id} lastVerified`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it('officeTypes are valid; locator services have ≥1', () => {
    for (const s of SERVICES) {
      for (const t of s.officeTypes) expect(OFFICE_TYPES.has(t), `${s.id}:${t}`).toBe(true);
      if (s.locatorAvailable) expect(s.officeTypes.length, s.id).toBeGreaterThan(0);
    }
  });
  it('every persona referenced exists in PERSONAS', () => {
    const ids = new Set(PERSONAS.map((p) => p.id));
    for (const s of SERVICES) for (const p of s.persona) expect(ids.has(p), p).toBe(true);
  });
});
