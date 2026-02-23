'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Organization } from './types';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  login: (user: User, organization?: Organization | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      organization: null,
      get isAuthenticated() {
        return !!get().user;
      },
      login: (user: User, organization?: Organization | null) => {
        set({ user, organization: organization || null });
      },
      logout: () => set({ user: null, organization: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface CartState {
  items: string[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addToCart: (productId) =>
    set((state) => ({ items: [...state.items, productId] })),
  removeFromCart: (productId) =>
    set((state) => ({ items: state.items.filter((id) => id !== productId) })),
  clearCart: () => set({ items: [] }),
}));

interface CompareState {
  products: string[];
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  products: [],
  addToCompare: (productId) =>
    set((state) => {
      if (state.products.length >= 4) return state;
      if (state.products.includes(productId)) return state;
      return { products: [...state.products, productId] };
    }),
  removeFromCompare: (productId) =>
    set((state) => ({ products: state.products.filter((id) => id !== productId) })),
  clearCompare: () => set({ products: [] }),
}));
