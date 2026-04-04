'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle,
  Truck, AlertCircle, RotateCcw, Mail, Phone, Building2,
  User, FileText, ShoppingBag, Calendar
} from 'lucide-react';
import Link from 'next/link';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; ring: string }> = {
  PENDING:    { label: 'Pending',    icon: Clock,       color: 'text-blue-600',   bg: 'bg-blue-50',   ring: 'ring-blue-200' },
  CONFIRMED:  { label: 'Confirmed',  icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-200' },
  PROCESSING: { label: 'Processing', icon: RotateCcw,   color: 'text-amber-600',  bg: 'bg-amber-50',  ring: 'ring-amber-200' },
  SHIPPED:    { label: 'Shipped',    icon: Truck,       color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-200' },
  DELIVERED:  { label: 'Delivered',  icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50',  ring: 'ring-green-200' },
  CANCELLED:  { label: 'Cancelled',  icon: AlertCircle, color: 'text-red-600',    bg: 'bg-red-50',    ring: 'ring-red-200' },
};

function StatusTimeline({ status }: { status: string }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
        <span className="text-[13px] font-semibold text-red-700">Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, i) => {
          const cfg = STATUS_CONFIG[step];
          const Icon = cfg.icon;
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              {i < STATUS_STEPS.length - 1 && (
                <div className={`absolute left-1/2 top-4 w-full h-0.5 z-0 ${done && i < currentIdx ? 'bg-[#6366F1]' : 'bg-[#E4E4E7]'}`} />
              )}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                active ? 'border-[#6366F1] bg-[#6366F1] text-white scale-110 shadow-md shadow-indigo-200'
                : done ? 'border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]'
                : 'border-[#E4E4E7] bg-white text-[#D4D4D8]'
              }`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <p className={`mt-1.5 text-[10px] font-semibold text-center leading-tight ${
                active ? 'text-[#6366F1]' : done ? 'text-[#52525B]' : 'text-[#A1A1AA]'
              }`}>
                {cfg.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useSimpleAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }
    loadOrder();
  }, [user, authLoading]);

  const loadOrder = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch('/api/orders/my', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (res.ok) {
        const found = (json.orders || []).find((o: any) => o.id === params.id);
        if (found) setOrder(found);
        else toast.error('Order not found');
      }
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <Package className="h-12 w-12 text-[#D4D4D8] mx-auto mb-3" />
        <p className="font-semibold text-[#09090B]">Order not found</p>
        <Link href="/end-user/orders" className="mt-4 inline-block text-[13px] text-[#6366F1] hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const items: any[] = order.items || [];
  const addr = order.shipping_address;
  const hasAddr = addr && Object.values(addr).some((v: any) => v?.toString().trim());

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/end-user/orders"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#71717A] hover:text-[#09090B] mb-5 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[22px] font-bold text-[#09090B] font-mono">{order.order_number}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold ${cfg.bg} ${cfg.color}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#71717A]">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#A1A1AA] uppercase tracking-wide font-semibold">Order Total</p>
          <p className="text-[26px] font-bold text-[#6366F1]">${Number(order.total).toLocaleString()}</p>
        </div>
      </div>

      {/* Status Timeline */}
      <Card className="mb-4 border-[#E4E4E7]">
        <CardContent className="p-5">
          <p className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-4">Order Progress</p>
          <StatusTimeline status={order.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - items + totals */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <Card className="border-[#E4E4E7]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-4 w-4 text-[#6366F1]" />
                <p className="text-[13px] font-bold text-[#09090B]">Order Items ({items.length})</p>
              </div>
              <div className="space-y-3">
                {items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-[#F8F9FF] rounded-xl border border-[#EEF2FF]">
                    <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-[#6366F1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#09090B] truncate">{item.product_name}</p>
                      {item.sku && <p className="text-[11px] text-[#A1A1AA]">SKU: {item.sku}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[12px] text-[#71717A]">{item.quantity} × ${Number(item.unit_price).toLocaleString()}</p>
                      <p className="text-[14px] font-bold text-[#09090B]">${Number(item.line_total).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-[#F4F4F5] space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#71717A]">Subtotal</span>
                  <span className="font-medium text-[#09090B]">${Number(order.subtotal).toLocaleString()}</span>
                </div>
                {Number(order.tax) > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#71717A]">Tax</span>
                    <span className="text-[#09090B]">${Number(order.tax).toLocaleString()}</span>
                  </div>
                )}
                {Number(order.shipping) > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#71717A]">Shipping</span>
                    <span className="text-[#09090B]">${Number(order.shipping).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[15px] font-bold pt-2 border-t border-[#E4E4E7]">
                  <span className="text-[#09090B]">Total</span>
                  <span className="text-[#6366F1]">${Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className="border-[#E4E4E7]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-[#6366F1]" />
                  <p className="text-[13px] font-bold text-[#09090B]">Reseller Notes</p>
                </div>
                <p className="text-[13px] text-[#52525B] bg-[#F8F9FF] rounded-xl p-3 border border-[#EEF2FF] leading-relaxed">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - details */}
        <div className="space-y-4">
          {/* Payment */}
          <Card className="border-[#E4E4E7]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-[#6366F1]" />
                <p className="text-[13px] font-bold text-[#09090B]">Payment</p>
              </div>
              <p className="text-[13px] text-[#52525B] font-semibold capitalize">
                {order.payment_method?.replace(/_/g, ' ') || 'Invoice'}
              </p>
            </CardContent>
          </Card>

          {/* Shipping address */}
          {hasAddr && (
            <Card className="border-[#E4E4E7]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-[#6366F1]" />
                  <p className="text-[13px] font-bold text-[#09090B]">Ship To</p>
                </div>
                <p className="text-[13px] text-[#52525B] leading-relaxed">
                  {[addr.street, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', ')}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reseller */}
          {order.reseller && (
            <Card className="border-[#E4E4E7]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-[#6366F1]" />
                  <p className="text-[13px] font-bold text-[#09090B]">Your Reseller</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-bold text-sm flex-shrink-0">
                    {order.reseller.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#09090B]">{order.reseller.name}</p>
                    {order.reseller_org && (
                      <p className="text-[11px] text-[#71717A] flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {order.reseller_org.name}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-col gap-1">
                      <a href={`mailto:${order.reseller.email}`}
                        className="text-[11px] text-[#6366F1] flex items-center gap-1 hover:underline">
                        <Mail className="h-3 w-3" /> {order.reseller.email}
                      </a>
                      {order.reseller.phone_number && (
                        <a href={`tel:${order.reseller.phone_number}`}
                          className="text-[11px] text-[#6366F1] flex items-center gap-1 hover:underline">
                          <Phone className="h-3 w-3" /> {order.reseller.phone_number}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Buyer info */}
          <Card className="border-[#E4E4E7]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-[#6366F1]" />
                <p className="text-[13px] font-bold text-[#09090B]">Your Details</p>
              </div>
              <div className="space-y-1 text-[13px] text-[#52525B]">
                <p className="font-semibold text-[#09090B]">{order.buyer_name}</p>
                <p className="text-[12px]">{order.buyer_email}</p>
                {order.buyer_phone && <p className="text-[12px]">{order.buyer_phone}</p>}
                {order.buyer_company && <p className="text-[12px] text-[#71717A]">{order.buyer_company}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
