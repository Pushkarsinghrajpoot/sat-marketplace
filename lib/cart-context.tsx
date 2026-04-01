'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    currency: string;
    stock_status: string;
    images: string[];
    organization_id: string;
    min_order_quantity: number;
  };
}

interface CartContextType {
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

async function getAuthHeader(): Promise<Record<string, string> | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);

  const refresh = useCallback(async () => {
    const headers = await getAuthHeader();
    if (!headers) { setItems([]); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/cart', { headers });
      if (res.ok) {
        const json = await res.json();
        setItems(json.items || []);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') refresh();
      if (event === 'SIGNED_OUT') setItems([]);
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  const addToCart = async (productId: string, quantity = 1) => {
    const headers = await getAuthHeader();
    if (!headers) { toast.error('Please sign in to add items to cart'); return; }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers,
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add to cart');
      await refresh();
      toast.success('Added to cart');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const removeFromCart = async (itemId: string) => {
    const headers = await getAuthHeader();
    if (!headers) return;
    setItems(prev => prev.filter(i => i.id !== itemId));
    await fetch(`/api/cart?item_id=${itemId}`, { method: 'DELETE', headers });
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const headers = await getAuthHeader();
    if (!headers) return;
    if (quantity < 1) { await removeFromCart(itemId); return; }
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    await fetch('/api/cart', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ item_id: itemId, quantity }),
    });
  };

  const clearCart = async () => {
    const headers = await getAuthHeader();
    if (!headers) return;
    setItems([]);
    await fetch('/api/cart?clear=true', { method: 'DELETE', headers });
  };

  return (
    <CartContext.Provider value={{ items, count, subtotal, loading, addToCart, removeFromCart, updateQuantity, clearCart, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
