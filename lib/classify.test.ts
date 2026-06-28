import { describe, it, expect } from 'vitest';
import { classifyOffice } from './classify';

const gov = (name: string, extra: Record<string, string> = {}) => ({
  office: 'government', name, ...extra,
});

describe('classifyOffice — positives', () => {
  it.each([
    ['สำนักงานขนส่งจังหวัดเชียงใหม่', 'dlt'],
    ['สำนักงานสรรพากรพื้นที่กรุงเทพมหานคร 1', 'revenue'],
    ['สำนักงานประกันสังคมจังหวัดนนทบุรี', 'sso'],
    ['สำนักงานจัดหางานจังหวัดขอนแก่น', 'employment'],
    ['สำนักงานพัฒนาฝีมือแรงงานภูเก็ต', 'skill'],
    ['สำนักงานพัฒนาธุรกิจการค้าจังหวัดชลบุรี', 'dbd'],
    ['สำนักงานหนังสือเดินทางชั่วคราว เชียงใหม่', 'passport'],
  ])('%s → %s', (name, type) => {
    expect(classifyOffice(gov(name))).toBe(type);
  });
  it('townhall amenity → district', () => {
    expect(classifyOffice({ amenity: 'townhall', name: 'ที่ว่าการอำเภอเมือง' })).toBe('district');
    expect(classifyOffice(gov('สำนักงานเขตจตุจักร'))).toBe('district');
  });
  it('เทศบาล/อบต → local', () => {
    expect(classifyOffice(gov('สำนักงานเทศบาลนครนครราชสีมา'))).toBe('local');
    expect(classifyOffice(gov('องค์การบริหารส่วนตำบลบางพลี'))).toBe('local');
  });
});

describe('classifyOffice — false positives rejected', () => {
  it('school named เทศบาล → null (no gov tag)', () => {
    expect(classifyOffice({ amenity: 'school', name: 'โรงเรียนเทศบาล 1' })).toBeNull();
  });
  it('private logistics ขนส่ง → null (no gov tag)', () => {
    expect(classifyOffice({ office: 'company', name: 'บริษัท ขนส่ง เคอรี่' })).toBeNull();
  });
  it('gov office with unknown name → null (under-include)', () => {
    expect(classifyOffice(gov('สำนักงานอุตสาหกรรมจังหวัด'))).toBeNull();
  });
});
