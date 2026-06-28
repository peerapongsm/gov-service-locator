'use client';

import { useState, useEffect } from 'react';

interface Props {
  lastVerified: string;
}

/**
 * Evaluates freshness in the browser so static-export pages
 * pick up staleness as the deploy ages, not just at build time.
 * Renders nothing until mounted to avoid hydration mismatch.
 */
export function FreshnessBanner({ lastVerified }: Props) {
  const [mounted, setMounted] = useState(false);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStale(Date.now() - Date.parse(lastVerified) > 1000 * 60 * 60 * 24 * 183);
  }, [lastVerified]);

  if (!mounted || !stale) return null;

  return (
    <div className="freshness-banner" role="alert" aria-live="polite">
      <span aria-hidden="true" style={{ flexShrink: 0 }}>⚠️</span>
      <span>
        ข้อมูลตรวจล่าสุดนานแล้ว อาจเปลี่ยน — โปรดยืนยันที่ลิงก์ทางการ
      </span>
    </div>
  );
}
