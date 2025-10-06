'use client';
import { useEffect } from 'react';
export default function ApiQueueBoot() {
  useEffect(() => {
    import('@/lib/api').then(m => m.startQueueAutoFlush()).catch(() => {});
  }, []);
  return null;
}
