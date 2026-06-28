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

const FLOORS: Partial<Record<OfficeType, number>> = { district: 300, dlt: 40, local: 50 };

// English province name (from apisit GeoJSON) → Thai name
const PROVINCE_EN_TO_TH: Record<string, string> = {
  'Amnat Charoen': 'อำนาจเจริญ',
  'Ang Thong': 'อ่างทอง',
  'Bangkok Metropolis': 'กรุงเทพมหานคร',
  'Bueng Kan': 'บึงกาฬ',
  'Buri Ram': 'บุรีรัมย์',
  'Chachoengsao': 'ฉะเชิงเทรา',
  'Chai Nat': 'ชัยนาท',
  'Chaiyaphum': 'ชัยภูมิ',
  'Chanthaburi': 'จันทบุรี',
  'Chiang Mai': 'เชียงใหม่',
  'Chiang Rai': 'เชียงราย',
  'Chon Buri': 'ชลบุรี',
  'Chumphon': 'ชุมพร',
  'Kalasin': 'กาฬสินธุ์',
  'Kamphaeng Phet': 'กำแพงเพชร',
  'Kanchanaburi': 'กาญจนบุรี',
  'Khon Kaen': 'ขอนแก่น',
  'Krabi': 'กระบี่',
  'Lampang': 'ลำปาง',
  'Lamphun': 'ลำพูน',
  'Loei': 'เลย',
  'Lop Buri': 'ลพบุรี',
  'Mae Hong Son': 'แม่ฮ่องสอน',
  'Maha Sarakham': 'มหาสารคาม',
  'Mukdahan': 'มุกดาหาร',
  'Nakhon Nayok': 'นครนายก',
  'Nakhon Pathom': 'นครปฐม',
  'Nakhon Phanom': 'นครพนม',
  'Nakhon Ratchasima': 'นครราชสีมา',
  'Nakhon Sawan': 'นครสวรรค์',
  'Nakhon Si Thammarat': 'นครศรีธรรมราช',
  'Nan': 'น่าน',
  'Narathiwat': 'นราธิวาส',
  'Nong Bua Lam Phu': 'หนองบัวลำภู',
  'Nong Khai': 'หนองคาย',
  'Nonthaburi': 'นนทบุรี',
  'Pathum Thani': 'ปทุมธานี',
  'Pattani': 'ปัตตานี',
  'Phangnga': 'พังงา',
  'Phatthalung': 'พัทลุง',
  'Phayao': 'พะเยา',
  'Phetchabun': 'เพชรบูรณ์',
  'Phetchaburi': 'เพชรบุรี',
  'Phichit': 'พิจิตร',
  'Phitsanulok': 'พิษณุโลก',
  'Phra Nakhon Si Ayutthaya': 'พระนครศรีอยุธยา',
  'Phrae': 'แพร่',
  'Phuket': 'ภูเก็ต',
  'Prachin Buri': 'ปราจีนบุรี',
  'Prachuap Khiri Khan': 'ประจวบคีรีขันธ์',
  'Ranong': 'ระนอง',
  'Ratchaburi': 'ราชบุรี',
  'Rayong': 'ระยอง',
  'Roi Et': 'ร้อยเอ็ด',
  'Sa Kaeo': 'สระแก้ว',
  'Sakon Nakhon': 'สกลนคร',
  'Samut Prakan': 'สมุทรปราการ',
  'Samut Sakhon': 'สมุทรสาคร',
  'Samut Songkhram': 'สมุทรสงคราม',
  'Saraburi': 'สระบุรี',
  'Satun': 'สตูล',
  'Si Sa Ket': 'ศรีสะเกษ',
  'Sing Buri': 'สิงห์บุรี',
  'Songkhla': 'สงขลา',
  'Sukhothai': 'สุโขทัย',
  'Suphan Buri': 'สุพรรณบุรี',
  'Surat Thani': 'สุราษฎร์ธานี',
  'Surin': 'สุรินทร์',
  'Tak': 'ตาก',
  'Trang': 'ตรัง',
  'Trat': 'ตราด',
  'Ubon Ratchathani': 'อุบลราชธานี',
  'Udon Thani': 'อุดรธานี',
  'Uthai Thani': 'อุทัยธานี',
  'Uttaradit': 'อุตรดิตถ์',
  'Yala': 'ยะลา',
  'Yasothon': 'ยโสธร',
};

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

type ProvFeature = { nameEn: string; polys: Ring[][] };
function loadProvinces(): ProvFeature[] {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'provinces.geojson'), 'utf8'));
  return raw.features.map((f: any) => {
    const nameEn = f.properties.name ?? f.properties.NAME_1 ?? f.properties.pro_th ?? '';
    const g = f.geometry;
    const polys: Ring[][] = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    return { nameEn, polys };
  });
}

function provinceOf(lon: number, lat: number, provs: ProvFeature[]): string {
  for (const p of provs) {
    for (const poly of p.polys) {
      if (pointInPolygon(lon, lat, poly as Ring[])) {
        return PROVINCE_EN_TO_TH[p.nameEn] ?? p.nameEn;
      }
    }
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
