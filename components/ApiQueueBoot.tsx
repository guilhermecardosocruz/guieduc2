'use client';
import { useEffect } from 'react';
import { startOutboxAutoFlush } from '@/lib/offline';

export default function ApiQueueBoot() {
  useEffect(() => {
    startOutboxAutoFlush();
  }, []);
  return null;
}
