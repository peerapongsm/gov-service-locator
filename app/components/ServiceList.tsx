'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Service } from '@/config/services';

function SearchIcon() {
  return (
    <svg
      className="service-search-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m14 14 3 3" />
    </svg>
  );
}

interface Props {
  services: Service[];
}

export function ServiceList({ services }: Props) {
  const [localQuery, setLocalQuery] = useState('');

  const displayed =
    localQuery.trim() !== ''
      ? services.filter((s) =>
          s.title.toLowerCase().includes(localQuery.toLowerCase().trim())
        )
      : services;

  return (
    <div>
      <div className="service-search-wrap">
        <SearchIcon />
        <input
          className="field field--light"
          type="search"
          placeholder="กรองในรายการนี้..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          aria-label="กรองบริการในรายการนี้"
        />
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state" role="status">
          <span className="empty-state__icon" aria-hidden="true">
            🔍
          </span>
          <p className="empty-state__text">ไม่พบบริการที่ตรงกัน</p>
        </div>
      ) : (
        <div className="service-grid" role="list">
          {displayed.map((s) => (
            <Link
              key={s.id}
              href={`/service/${s.id}/`}
              className="service-card"
              role="listitem"
            >
              <span className="service-card__group">{s.group}</span>
              <h3 className="service-card__title">{s.title}</h3>
              <div className="service-card__badges" aria-label="ข้อมูลเพิ่มเติม">
                {s.channel.includes('online') && (
                  <span className="badge badge--online">ออนไลน์ได้</span>
                )}
                {s.locatorAvailable && (
                  <span className="badge badge--locator">หาสำนักงาน</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
