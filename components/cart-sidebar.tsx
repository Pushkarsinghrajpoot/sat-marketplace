'use client';

import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, subtotal, removeFromCart, updateQuantity, loading } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#6366F1]" />
            <h2 className="text-[16px] font-bold text-[#09090B]">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-[#6366F1] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F4F4F5] flex items-center justify-center text-[#71717A] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-7 h-7 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ShoppingCart className="h-12 w-12 text-[#D4D4D8] mb-3" />
              <p className="font-semibold text-[#09090B] mb-1">Your cart is empty</p>
              <p className="text-[13px] text-[#71717A]">Add products to start an order</p>
              <Button
                onClick={() => { onClose(); router.push('/categories'); }}
                className="mt-4 h-9 px-5 text-[13px]"
                style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const img = item.product?.images?.[0];
                const lineTotal = (item.product?.price ?? 0) * item.quantity;
                return (
                  <div key={item.id} className="flex gap-3 p-3 bg-[#F8F9FF] rounded-xl border border-[#EEF2FF]">
                    {/* Product image */}
                    <div className="w-16 h-16 rounded-lg bg-white border border-[#E4E4E7] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {img ? (
                        <img src={img} alt={item.product?.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingCart className="h-6 w-6 text-[#D4D4D8]" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px] text-[#09090B] leading-tight line-clamp-2">{item.product?.name}</p>
                      {item.product?.sku && (
                        <p className="text-[11px] text-[#A1A1AA] mt-0.5">SKU: {item.product.sku}</p>
                      )}
                      <p className="text-[12px] font-bold text-[#6366F1] mt-1">
                        ${(item.product?.price ?? 0).toLocaleString()} / unit
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#E4E4E7] rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-[13px] font-semibold text-[#09090B]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-[#09090B]">${lineTotal.toLocaleString()}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 flex items-center justify-center text-[#F87171] hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E4E4E7] px-5 py-4 space-y-3 bg-white">
            <div className="flex justify-between text-[14px]">
              <span className="text-[#71717A]">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-bold text-[#09090B]">${subtotal.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">Taxes and shipping calculated at checkout</p>
            <Button
              onClick={handleCheckout}
              className="w-full h-11 font-semibold text-[14px] flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
