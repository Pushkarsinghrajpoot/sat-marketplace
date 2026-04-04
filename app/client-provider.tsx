'use client';

import { Suspense } from 'react';
import { SimpleAuthProvider } from '@/lib/simple-auth';
import { SimpleAuthGuard } from '@/components/simple-auth-guard';
import { CartProvider } from '@/lib/cart-context';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SimpleAuthProvider>
      <CartProvider>
        <Suspense fallback={null}>
          <SimpleAuthGuard>
            {children}
          </SimpleAuthGuard>
        </Suspense>
      </CartProvider>
    </SimpleAuthProvider>
  );
}
