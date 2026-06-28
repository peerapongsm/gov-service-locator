'use client';

import { useEffect } from 'react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/gov-service-locator';

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${BASE_PATH}/sw.js`).catch(() => {});
    }
  }, []);
  return null;
}
