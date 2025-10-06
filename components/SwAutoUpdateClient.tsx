'use client';
import { useEffect } from 'react';
export default function SwAutoUpdateClient() {
  useEffect(() => {
    import('@/lib/sw-update').then(m => m.setupSwAutoUpdate()).catch(() => {});
  }, []);
  return null;
}
