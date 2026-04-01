'use client';

import { SimpleAuthProvider } from '@/lib/simple-auth';
import { SimpleAuthGuard } from '@/components/simple-auth-guard';
import { CartProvider } from '@/lib/cart-context';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SimpleAuthProvider>
      <CartProvider>
        <SimpleAuthGuard>
          {children}
        </SimpleAuthGuard>
      </CartProvider>
    </SimpleAuthProvider>
  );
}
