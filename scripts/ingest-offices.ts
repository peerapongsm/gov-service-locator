import fs from 'node:fs';
import path from 'node:path';
import { classifyOffice, type OfficeType } from '../lib/classify';
import { pointInPolygon, type Ring } from '../lib/geo';

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="TH"][admin_level=2]->.th;
(
  node["office"="government"](area.th);
  node["amenity"="townhall"](area.th);
  node["government"](area.th);
  way["office"="government"](area.th);
  way["amenity"="townhall"](area.th);
  way["government"](area.th);
);
out center;`;

// District-level admin boundaries: supplement tagged offices with boundary centroids
const ADMIN_QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="TH"][admin_level=2]->.th;
relation["admin_level"="6"]["boundary"="administrative"]["name"](area.th);
out center;`;

const FLOORS: Partial<Record<OfficeType, number>> = { district: 800, dlt: 40, local: 50 };

async function fetchOverpass(query: string): Promise<any[]> {
  for (const url of ENDPOINTS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'gov-service-locator/1.0',
          },
          body: `data=${encodeURIComponent(query)}`,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.elements?.length) return json.elements;
        throw new Error('empty elements');
      } catch (e) {
        console.warn(`overpass ${url} attempt ${attempt}: ${e}`);
        await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
      }
    }
  }
  return [];
}

async function overpass(): Promise<any[]> {
  const els = await fetchOverpass(QUERY);
  if (!els.length) throw new Error('all overpass endpoints failed');
  return els;
}

type ProvFeature = { name: string; polys: Ring[][] };
function loadProvinces(): ProvFeature[] {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'provinces.geojson'), 'utf8'));
  return raw.features.map((f: any) => {
    const name = f.properties.name ?? f.properties.NAME_1 ?? f.properties.pro_th;
    const g = f.geometry;
    const polys: Ring[][] = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    return { name, polys };
  });
}

function provinceOf(lon: number, lat: number, provs: ProvFeature[]): string {
  for (const p of provs) {
    for (const poly of p.polys) if (pointInPolygon(lon, lat, poly as Ring[])) return p.name;
  }
  return '';
}

async function main() {
  const provs = loadProvinces();
  const elements = await overpass();
  const seen = new Set<string>();
  const offices: any[] = [];
  for (const el of elements) {
    const type = classifyOffice(el.tags ?? {});
    if (!type) continue;
    const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
    const name = el.tags.name;
    if (!name) continue;
    const key = `${name}@${lat.toFixed(3)},${lon.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    offices.push({ type, name, lat, lon, province: provinceOf(lon, lat, provs) });
  }

  // Supplement: add district boundary centroids for any district not yet represented.
  // OSM Thailand has ~927 admin_level=6 boundaries but only ~443 tagged office nodes/ways.
  console.log('fetching district admin boundaries to supplement tagged offices...');
  const adminEls = await fetchOverpass(ADMIN_QUERY);
  const seenDistrictNames = new Set(offices.filter((o) => o.type === 'district').map((o) => o.name));
  let adminAdded = 0;
  for (const el of adminEls) {
    const lat = el.center?.lat, lon = el.center?.lon;
    if (!lat || !lon) continue;
    const name = el.tags?.name;
    if (!name) continue;
    if (seenDistrictNames.has(name)) continue; // already have a tagged office by this name
    const key = `${name}@${lat.toFixed(3)},${lon.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    seenDistrictNames.add(name);
    offices.push({ type: 'district', name, lat, lon, province: provinceOf(lon, lat, provs) });
    adminAdded++;
  }
  console.log(`admin boundaries added: ${adminAdded}`);

  const counts: Record<string, number> = {};
  for (const o of offices) counts[o.type] = (counts[o.type] ?? 0) + 1;
  console.log('counts:', counts);
  for (const [t, floor] of Object.entries(FLOORS)) {
    if ((counts[t] ?? 0) < floor!) throw new Error(`floor fail: ${t}=${counts[t] ?? 0} < ${floor}`);
  }
  const noProv = offices.filter((o) => !o.province).length;
  console.log(`offices: ${offices.length}, missing province: ${noProv}`);
  fs.mkdirSync(path.join(__dirname, '../public/data'), { recursive: true });
  fs.writeFileSync(
    path.join(__dirname, '../public/data/offices.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), offices }),
  );
}
main();
