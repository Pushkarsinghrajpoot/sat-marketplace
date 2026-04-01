'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Package, Mail, Phone, Building2, Clock, CheckCircle,
  Truck, AlertCircle, Inbox, ShoppingCart, RotateCcw
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  PENDING:    { label: 'Pending',    bg: 'bg-blue-100',   text: 'text-blue-800',   icon: Clock },
  CONFIRMED:  { label: 'Confirmed',  bg: 'bg-indigo-100', text: 'text-indigo-800', icon: CheckCircle },
  PROCESSING: { label: 'Processing', bg: 'bg-amber-100',  text: 'text-amber-800',  icon: RotateCcw },
  SHIPPED:    { label: 'Shipped',    bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck },
  DELIVERED:  { label: 'Delivered',  bg: 'bg-green-100',  text: 'text-green-800',  icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled',  bg: 'bg-red-100',    text: 'text-red-800',    icon: AlertCircle },
};

export default function MyOrdersPage() {
  const { user } = useSimpleAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) loadOrders();
  }, [user?.id]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch('/api/orders/my', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) setOrders(json.orders || []);
      else toast.error('Failed to load orders');
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#09090B]">My Orders</h1>
        <p className="text-[14px] text-[#71717A]">Track the status of your placed orders</p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', ...Object.keys(STATUS_CONFIG)].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
              filter === s
                ? 'bg-[#6366F1] text-white border-[#6366F1]'
                : 'bg-white text-[#52525B] border-[#E4E4E7] hover:border-[#6366F1] hover:text-[#6366F1]'
            }`}>
            {s === 'ALL' ? 'All Orders' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="h-12 w-12 text-[#D4D4D8] mx-auto mb-3" />
            <p className="font-semibold text-[#09090B] mb-1">No orders yet</p>
            <p className="text-[13px] text-[#71717A] mb-4">
              {filter !== 'ALL' ? 'No orders with this status.' : 'Browse products and place your first order.'}
            </p>
            {filter === 'ALL' && (
              <a href="/categories"
                className="inline-block px-4 py-2 bg-[#6366F1] text-white rounded-lg text-[13px] font-semibold hover:bg-[#5254CC] transition-colors">
                Browse Products
              </a>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = cfg.icon;
            const isOpen = expanded === order.id;
            const items: any[] = order.items || [];

            return (
              <Card key={order.id} className="border-[#E4E4E7]">
                <CardContent className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-[#09090B] text-[15px]">{order.order_number}</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          <StatusIcon className="h-3 w-3" />{cfg.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#A1A1AA]">
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        <span className="mx-2">·</span>{items.length} item{items.length !== 1 ? 's' : ''}
                        <span className="mx-2">·</span>
                        <span className="font-bold text-[#09090B]">${Number(order.total).toLocaleString()}</span>
                      </p>
                    </div>
                    <button onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="text-[13px] font-semibold text-[#6366F1] hover:text-[#5254CC] px-3 py-1.5 border border-[#E4E4E7] rounded-lg hover:bg-[#F8F9FF] transition-colors flex-shrink-0">
                      {isOpen ? 'Hide' : 'Details'}
                    </button>
                  </div>

                  {/* Item previews */}
                  <div className="flex gap-2 mb-4">
                    {items.slice(0, 4).map((item: any, i: number) => (
                      <div key={i} className="w-12 h-12 bg-[#F4F4F5] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-[#D4D4D8]" />
                      </div>
                    ))}
                    {items.length > 4 && (
                      <div className="w-12 h-12 bg-[#F4F4F5] rounded-lg flex items-center justify-center text-[12px] font-bold text-[#71717A]">
                        +{items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Reseller card */}
                  {order.reseller && (
                    <div className="bg-[#F8FAFF] rounded-xl border border-[#EEF2FF] p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-bold text-sm flex-shrink-0">
                        {order.reseller.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#09090B]">{order.reseller.name}</p>
                        {order.reseller_org && <p className="text-[11px] text-[#71717A]">{order.reseller_org.name}</p>}
                      </div>
                      <div className="flex gap-3 text-[11px]">
                        <a href={`mailto:${order.reseller.email}`} className="text-[#6366F1] hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                        </a>
                        {order.reseller.phone_number && (
                          <a href={`tel:${order.reseller.phone_number}`} className="text-[#6366F1] hover:underline flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-[#F4F4F5] space-y-4">
                      {/* Line items */}
                      <div>
                        <p className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-2">Items</p>
                        <div className="space-y-2">
                          {items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-[#F8F9FF] rounded-lg border border-[#EEF2FF]">
                              <div>
                                <p className="text-[13px] font-medium text-[#09090B]">{item.product_name}</p>
                                {item.sku && <p className="text-[11px] text-[#A1A1AA]">SKU: {item.sku}</p>}
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="text-[12px] text-[#71717A]">Qty: {item.quantity} × ${Number(item.unit_price).toLocaleString()}</p>
                                <p className="text-[13px] font-bold text-[#09090B]">${Number(item.line_total).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="bg-[#F8F9FF] rounded-xl p-4 space-y-2">
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
                        <div className="flex justify-between text-[14px] font-bold pt-2 border-t border-[#E4E4E7]">
                          <span className="text-[#09090B]">Total</span>
                          <span className="text-[#6366F1]">${Number(order.total).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Payment method */}
                      <div className="flex items-center gap-2 text-[12px] text-[#71717A]">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Payment: <span className="font-semibold text-[#09090B]">{order.payment_method?.replace('_', ' ')}</span>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div>
                          <p className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-1">Order Notes</p>
                          <p className="text-[13px] text-[#52525B] bg-[#F8F9FF] rounded-lg p-3 border border-[#EEF2FF]">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
