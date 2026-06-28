'use client';

import { useState } from 'react';
import { loadOffices, nearbyForTypes, byProvince } from '@/lib/offices';
import type { Office } from '@/lib/distance';
import type { Service } from '@/config/services';

interface Props {
  service: Service;
}

type NearbyOffice = Office & { km: number };

type Phase =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'nearby'; offices: NearbyOffice[] }
  | { state: 'province-select'; all: Office[]; provinces: string[] }
  | { state: 'province-results'; all: Office[]; provinces: string[]; offices: Office[]; province: string }
  | { state: 'error' };

function mapsLink(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

export function Locator({ service }: Props) {
  const [phase, setPhase] = useState<Phase>({ state: 'idle' });

  async function handleFind() {
    setPhase({ state: 'loading' });

    let all: Office[];
    try {
      all = await loadOffices();
    } catch {
      setPhase({ state: 'error' });
      return;
    }

    if (!navigator.geolocation) {
      showProvincePicker(all);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const from = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const offices = nearbyForTypes(all, service.officeTypes, from, 5);
        setPhase({ state: 'nearby', offices });
      },
      () => {
        // Denied or unavailable — fall back to province picker
        showProvincePicker(all);
      },
      { timeout: 8000 },
    );

    function showProvincePicker(offices: Office[]) {
      const set = new Set<string>(service.officeTypes);
      const provinces = Array.from(
        new Set(
          offices
            .filter((o) => set.has(o.type) && o.province)
            .map((o) => o.province!),
        ),
      ).sort((a, b) => a.localeCompare(b, 'th'));
      setPhase({ state: 'province-select', all: offices, provinces });
    }
  }

  function handleProvinceChange(province: string) {
    if (!province) return;
    if (phase.state !== 'province-select' && phase.state !== 'province-results') return;
    const { all, provinces } = phase;
    const offices = byProvince(all, service.officeTypes, province);
    setPhase({ state: 'province-results', all, provinces, offices, province });
  }

  const selectedProvince =
    phase.state === 'province-results' ? phase.province : '';

  return (
    <div className="locator" aria-label="ค้นหาสำนักงานใกล้ฉัน">
      <p className="locator__heading">หาสำนักงานที่ให้บริการ</p>

      {/* ── Idle: show trigger button ── */}
      {phase.state === 'idle' && (
        <button
          type="button"
          className="btn btn-primary locator__trigger"
          onClick={handleFind}
        >
          📍 หาสำนักงานใกล้ฉัน
        </button>
      )}

      {/* ── Loading ── */}
      {phase.state === 'loading' && (
        <div className="locator__status" aria-live="polite" aria-label="กำลังโหลดข้อมูล">
          <span className="locator__spinner" aria-hidden="true" />
          <span>กำลังโหลดข้อมูล...</span>
        </div>
      )}

      {/* ── Geolocation success: nearby ranked list ── */}
      {phase.state === 'nearby' && (
        <>
          {phase.offices.length === 0 ? (
            <div className="locator__empty" role="status">
              ไม่พบสำนักงานในระบบ — ดูลิงก์ทางการด้านล่าง
            </div>
          ) : (
            <ul
              className="locator__office-list"
              aria-label="สำนักงานใกล้เคียง เรียงตามระยะทาง"
            >
              {phase.offices.map((o, i) => (
                <li key={`${o.name}-${i}`} className="locator__office-item">
                  <span className="locator__office-name">{o.name}</span>
                  <span className="locator__office-km">{o.km.toFixed(1)} กม.</span>
                  <a
                    href={mapsLink(o.lat, o.lon)}
                    className="btn btn-outline btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`นำทางไปยัง ${o.name}`}
                  >
                    นำทาง
                  </a>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: 'var(--sp-3)' }}
            onClick={() => setPhase({ state: 'idle' })}
          >
            ← ค้นใหม่
          </button>
        </>
      )}

      {/* ── Geolocation denied: province picker ── */}
      {(phase.state === 'province-select' || phase.state === 'province-results') && (
        <>
          <p className="locator__province-label">เลือกจังหวัดเพื่อค้นหา</p>
          <select
            className="locator__province-select"
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            aria-label="เลือกจังหวัด"
          >
            <option value="" disabled>
              -- เลือกจังหวัด --
            </option>
            {phase.provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {phase.state === 'province-results' && (
            <>
              {phase.offices.length === 0 ? (
                <div className="locator__empty" role="status">
                  ไม่พบสำนักงานในระบบ — ดูลิงก์ทางการด้านล่าง
                </div>
              ) : (
                <ul
                  className="locator__office-list"
                  aria-label={`รายการสำนักงานใน${phase.province}`}
                >
                  {phase.offices.map((o, i) => (
                    <li key={`${o.name}-${i}`} className="locator__province-office">
                      <span className="locator__province-office-name">{o.name}</span>
                      <a
                        href={mapsLink(o.lat, o.lon)}
                        className="btn btn-outline btn-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`นำทางไปยัง ${o.name}`}
                      >
                        นำทาง
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: 'var(--sp-3)' }}
            onClick={() => setPhase({ state: 'idle' })}
          >
            ← ลองใหม่
          </button>
        </>
      )}

      {/* ── Error loading offices ── */}
      {phase.state === 'error' && (
        <div className="locator__empty" role="alert">
          <p>เกิดข้อผิดพลาดในการโหลดข้อมูลสำนักงาน</p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: 'var(--sp-3)' }}
            onClick={() => setPhase({ state: 'idle' })}
          >
            ลองใหม่
          </button>
        </div>
      )}

      {/* ── Always-shown caveat ── */}
      <div className="locator__caveat">
        ตำแหน่งจาก OpenStreetMap อาจไม่ครบ — หากไม่พบ โปรดดูลิงก์ทางการ
        <br />
        <a
          href={service.officialUrl}
          className="btn btn-outline btn-sm"
          style={{ marginTop: 'var(--sp-2)' }}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`เปิดเว็บไซต์ทางการของ ${service.title}`}
        >
          เว็บไซต์ทางการ
        </a>
      </div>
    </div>
  );
}
