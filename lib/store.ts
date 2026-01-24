'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Organization } from './types';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  setOrganization: (org: Organization) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      isAuthenticated: false,
      login: (email: string) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: User) => u.email === email);
        if (user) {
          const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
          const org = orgs.find((o: Organization) => o.id === user.organizationId);
          set({ user, organization: org || null, isAuthenticated: true });
        }
      },
      logout: () => set({ user: null, organization: null, isAuthenticated: false }),
      setOrganization: (org) => set({ organization: org }),
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
