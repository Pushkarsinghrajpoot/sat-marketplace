'use client';

import { useEffect } from 'react';
import { initializeLocalStorage } from '@/lib/dummy-data';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeLocalStorage();
  }, []);

  return <>{children}</>;
}
