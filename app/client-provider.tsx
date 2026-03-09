'use client';

import { SimpleAuthProvider } from '@/lib/simple-auth';
import { SimpleAuthGuard } from '@/components/simple-auth-guard';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SimpleAuthProvider>
      <SimpleAuthGuard>
        {children}
      </SimpleAuthGuard>
    </SimpleAuthProvider>
  );
}
