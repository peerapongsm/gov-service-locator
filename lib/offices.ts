import { rankNearby, type Office, type LatLon } from './distance';
import type { OfficeType } from './classify';

let cache: Promise<Office[]> | null = null;

export function loadOffices(): Promise<Office[]> {
  if (!cache) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '/gov-service-locator';
    cache = fetch(`${base}/data/offices.json`)
      .then((r) => r.json())
      .then((d: { offices: Office[] }) => d.offices);
  }
  return cache;
}

export function nearbyForTypes(all: Office[], types: OfficeType[], from: LatLon, limit = 5) {
  const set = new Set<string>(types);
  return rankNearby(all.filter((o) => set.has(o.type)), from, limit);
}

export function byProvince(all: Office[], types: OfficeType[], province: string): Office[] {
  const set = new Set<string>(types);
  return all.filter((o) => set.has(o.type) && o.province === province);
}
