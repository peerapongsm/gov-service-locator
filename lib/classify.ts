export type OfficeType =
  | 'district' | 'local' | 'passport' | 'dlt'
  | 'revenue' | 'sso' | 'employment' | 'skill' | 'dbd';

// order matters: more specific keywords before generic ones
const KEYWORDS: [RegExp, OfficeType][] = [
  [/หนังสือเดินทาง/, 'passport'],
  [/ขนส่ง/, 'dlt'],
  [/สรรพากร/, 'revenue'],
  [/ประกันสังคม/, 'sso'],
  [/จัดหางาน/, 'employment'],
  [/พัฒนาฝีมือแรงงาน/, 'skill'],
  [/พัฒนาธุรกิจการค้า|สำนักงานพาณิชย์/, 'dbd'],
  [/เทศบาล|องค์การบริหารส่วน|อบต\.?|อบจ\.?/, 'local'],
  [/สำนักงานเขต|ที่ว่าการอำเภอ|ที่ว่าการเขต/, 'district'],
];

function isGov(tags: Record<string, string>): boolean {
  return tags.office === 'government' || tags.amenity === 'townhall' || 'government' in tags;
}

export function classifyOffice(tags: Record<string, string>): OfficeType | null {
  if (!isGov(tags)) return null;
  const name = tags.name ?? '';
  for (const [re, type] of KEYWORDS) {
    if (re.test(name)) return type;
  }
  // townhall with no specific keyword is still a district seat
  if (tags.amenity === 'townhall') return 'district';
  return null;
}
