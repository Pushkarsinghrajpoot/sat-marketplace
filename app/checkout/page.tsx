'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  ShoppingCart, CheckCircle, Package, MapPin,
  CreditCard, FileText, ArrowLeft, Loader2
} from 'lucide-react';
import Link from 'next/link';

const PAYMENT_METHODS = [
  { id: 'INVOICE', label: 'Invoice / Net 30', description: 'Pay within 30 days of delivery' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer', description: 'Direct bank wire transfer' },
  { id: 'CREDIT_CARD', label: 'Credit / Debit Card', description: 'Processed securely via Stripe' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useSimpleAuth();
  const { items, subtotal, clearCart, loading: cartLoading } = useCart();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCompany, setBuyerCompany] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('INVOICE');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState({
    street: '', city: '', state: '', postal_code: '', country: '',
  });

  useEffect(() => {
    if (!user) router.push('/auth/login?redirect=/checkout');
  }, [user, router]);

  const handlePlaceOrder = async () => {
    if (!user) { toast.error('Please sign in first'); return; }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setPlacing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            product_id: i.product_id,
            product_name: i.product?.name,
            quantity: i.quantity,
            unit_price: i.product?.price,
          })),
          buyer_phone: buyerPhone || undefined,
          buyer_company: buyerCompany || undefined,
          payment_method: paymentMethod,
          notes: notes || undefined,
          shipping_address: Object.values(address).some(v => v.trim())
            ? address : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to place order');

      setOrderId(json.order.id);
      setOrderNumber(json.order.order_number);
      setPlaced(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  // ── Order confirmation screen ────────────────────────────
  if (placed) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#09090B] mb-2">Order Placed!</h1>
          <p className="text-[#71717A] mb-1">Your order has been received.</p>
          <p className="text-[13px] text-[#A1A1AA] mb-6">
            Reference: <span className="font-mono font-bold text-[#09090B]">{orderNumber}</span>
          </p>
          <div className="bg-[#F8F9FF] rounded-xl border border-[#EEF2FF] p-4 mb-6 text-left">
            <p className="text-[13px] text-[#71717A] mb-1">A reseller will reach out to confirm your order and arrange fulfillment.</p>
            <p className="text-[13px] text-[#71717A]">Track progress in <strong>My Orders</strong>.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push('/end-user/orders')}
              className="w-full" style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}>
              View My Orders
            </Button>
            <Button variant="outline" onClick={() => router.push('/categories')} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || cartLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366F1]" />
      </div>
    );
  }

  if (items.length === 0 && !cartLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex flex-col items-center justify-center gap-4 p-6">
        <ShoppingCart className="h-16 w-16 text-[#D4D4D8]" />
        <h2 className="text-xl font-bold text-[#09090B]">Your cart is empty</h2>
        <Link href="/categories">
          <Button style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}>Browse Products</Button>
        </Link>
      </div>
    );
  }

  const tax = 0;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] text-[#71717A] hover:text-[#09090B] transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-[28px] font-bold text-[#09090B] mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Contact */}
            <Card className="border-[#E4E4E7]">
              <CardContent className="p-6">
                <h2 className="text-[16px] font-bold text-[#09090B] mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#6366F1]" /> Contact Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-semibold text-[#09090B] mb-1.5 block">Full Name</label>
                    <Input value={user?.name || ''} disabled className="h-10 bg-[#F4F4F5]" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#09090B] mb-1.5 block">Email</label>
                    <Input value={user?.email || ''} disabled className="h-10 bg-[#F4F4F5]" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#09090B] mb-1.5 block">Phone</label>
                    <Input value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)}
                      placeholder="+1 555 000 0000" className="h-10" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#09090B] mb-1.5 block">Company</label>
                    <Input value={buyerCompany} onChange={e => setBuyerCompany(e.target.value)}
                      placeholder="Your company" className="h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-[#E4E4E7]">
              <CardContent className="p-6">
                <h2 className="text-[16px] font-bold text-[#09090B] mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#6366F1]" /> Shipping Address
                  <span className="text-[12px] font-normal text-[#A1A1AA] ml-1">(optional)</span>
                </h2>
                <div className="space-y-3">
                  <Input value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))}
                    placeholder="Street address" className="h-10" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                      placeholder="City" className="h-10" />
                    <Input value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                      placeholder="State / Province" className="h-10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={address.postal_code} onChange={e => setAddress(a => ({ ...a, postal_code: e.target.value }))}
                      placeholder="Postal code" className="h-10" />
                    <Input value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
                      placeholder="Country" className="h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card className="border-[#E4E4E7]">
              <CardContent className="p-6">
                <h2 className="text-[16px] font-bold text-[#09090B] mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#6366F1]" /> Payment Method
                </h2>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(m => (
                    <label key={m.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === m.id
                          ? 'border-[#6366F1] bg-[#F2F3FF]'
                          : 'border-[#E4E4E7] hover:border-[#6366F1]/40'
                      }`}>
                      <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)} className="mt-0.5 accent-[#6366F1]" />
                      <div>
                        <p className="text-[13px] font-semibold text-[#09090B]">{m.label}</p>
                        <p className="text-[12px] text-[#71717A]">{m.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-[#E4E4E7]">
              <CardContent className="p-6">
                <h2 className="text-[16px] font-bold text-[#09090B] mb-3">Order Notes</h2>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Special instructions, delivery preferences…"
                  className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[13px] resize-none outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]" />
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Order summary ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 space-y-4">
              <Card className="border-[#E4E4E7]">
                <CardContent className="p-5">
                  <h2 className="text-[16px] font-bold text-[#09090B] mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#6366F1]" /> Order Summary
                  </h2>
                  <div className="space-y-3 mb-4">
                    {items.map(item => {
                      const img = item.product?.images?.[0];
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-12 bg-[#F4F4F5] rounded-lg flex-shrink-0 overflow-hidden">
                            {img
                              ? <img src={img} alt={item.product?.name} className="w-full h-full object-cover" />
                              : <Package className="h-5 w-5 m-auto text-[#D4D4D8]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[#09090B] line-clamp-1">{item.product?.name}</p>
                            <p className="text-[12px] text-[#71717A]">Qty: {item.quantity} × ${(item.product?.price ?? 0).toLocaleString()}</p>
                          </div>
                          <p className="text-[13px] font-bold text-[#09090B] flex-shrink-0">
                            ${((item.product?.price ?? 0) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-[#F4F4F5] pt-3 space-y-2">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#71717A]">Subtotal</span>
                      <span className="font-medium text-[#09090B]">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#71717A]">Tax</span>
                      <span className="text-[#71717A]">TBD by reseller</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#71717A]">Shipping</span>
                      <span className="text-[#71717A]">TBD by reseller</span>
                    </div>
                    <div className="flex justify-between text-[15px] font-bold pt-2 border-t border-[#F4F4F5]">
                      <span className="text-[#09090B]">Estimated Total</span>
                      <span className="text-[#6366F1]">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handlePlaceOrder}
                disabled={placing || items.length === 0}
                className="w-full h-12 text-[15px] font-bold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}
              >
                {placing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order…</>
                ) : (
                  <><CheckCircle className="h-4 w-4" /> Place Order</>
                )}
              </Button>
              <p className="text-[11px] text-center text-[#A1A1AA]">
                A verified reseller will confirm and fulfill your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
