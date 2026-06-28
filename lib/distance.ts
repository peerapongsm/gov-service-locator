export type LatLon = { lat: number; lon: number };
export type Office = { type: string; name: string; lat: number; lon: number; province?: string };

const R = 6371; // km
const rad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function rankNearby(offices: Office[], from: LatLon, limit = 5): (Office & { km: number })[] {
  return offices
    .map((o) => ({ ...o, km: haversineKm(from, o) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}
