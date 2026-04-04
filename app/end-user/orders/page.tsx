'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Package, Clock, CheckCircle, Truck, AlertCircle,
  Inbox, RotateCcw, ArrowRight, ShoppingBag, DollarSign
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
  const totalSpend = orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + Number(o.total), 0);
  const activeCount = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#09090B]">My Orders</h1>
        <p className="text-[14px] text-[#71717A]">Track and manage all your placed orders</p>
      </div>

      {/* Stats */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-[#EEF2FF] text-[#6366F1]' },
            { label: 'Active Orders', value: activeCount, icon: RotateCcw, color: 'bg-amber-50 text-amber-600' },
            { label: 'Total Spent', value: `$${totalSpend.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-[#E4E4E7]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[20px] font-bold text-[#09090B] leading-none">{value}</p>
                  <p className="text-[11px] text-[#71717A] mt-1">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['ALL', ...Object.keys(STATUS_CONFIG)].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
              filter === s
                ? 'bg-[#6366F1] text-white border-[#6366F1]'
                : 'bg-white text-[#52525B] border-[#E4E4E7] hover:border-[#6366F1] hover:text-[#6366F1]'
            }`}>
            {s === 'ALL' ? `All (${orders.length})` : `${STATUS_CONFIG[s]?.label} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-[#E4E4E7]">
          <CardContent className="p-12 text-center">
            <Inbox className="h-12 w-12 text-[#D4D4D8] mx-auto mb-3" />
            <p className="font-semibold text-[#09090B] mb-1">No orders found</p>
            <p className="text-[13px] text-[#71717A] mb-4">
              {filter !== 'ALL' ? 'No orders with this status.' : 'Browse products and place your first order.'}
            </p>
            {filter === 'ALL' && (
              <Link href="/categories"
                className="inline-block px-4 py-2 bg-[#6366F1] text-white rounded-lg text-[13px] font-semibold hover:bg-[#5254CC] transition-colors">
                Browse Products
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = cfg.icon;
            const items: any[] = order.items || [];

            return (
              <Card key={order.id} className="border-[#E4E4E7] hover:border-[#6366F1]/30 hover:shadow-sm transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Top row */}
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-mono font-bold text-[#09090B] text-[15px]">{order.order_number}</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          <StatusIcon className="h-3 w-3" />{cfg.label}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 text-[12px] text-[#A1A1AA] mb-3">
                        <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>·</span>
                        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span className="font-bold text-[#09090B] text-[13px]">${Number(order.total).toLocaleString()}</span>
                        {order.payment_method && (
                          <>
                            <span>·</span>
                            <span className="capitalize">{order.payment_method.replace(/_/g, ' ')}</span>
                          </>
                        )}
                      </div>

                      {/* Items preview */}
                      <div className="flex gap-2 items-center">
                        <div className="flex gap-1.5">
                          {items.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="h-10 px-3 bg-[#F8F9FF] border border-[#EEF2FF] rounded-lg flex items-center gap-1.5 flex-shrink-0">
                              <Package className="h-3.5 w-3.5 text-[#6366F1]" />
                              <span className="text-[11px] font-medium text-[#52525B] max-w-[80px] truncate">{item.product_name}</span>
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div className="h-10 px-2.5 bg-[#F4F4F5] rounded-lg flex items-center text-[11px] font-bold text-[#71717A] flex-shrink-0">
                              +{items.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reseller strip */}
                      {order.reseller && (
                        <div className="mt-3 flex items-center gap-2 text-[12px] text-[#71717A]">
                          <div className="w-5 h-5 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-bold text-[9px] flex-shrink-0">
                            {order.reseller.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span>Handled by <span className="font-semibold text-[#09090B]">{order.reseller.name}</span>
                            {order.reseller_org && <span className="text-[#A1A1AA]"> · {order.reseller_org.name}</span>}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Details CTA */}
                    <Link href={`/end-user/orders/${order.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-[#6366F1] border border-[#E4E4E7] rounded-lg hover:bg-[#F8F9FF] hover:border-[#6366F1]/40 transition-all flex-shrink-0 whitespace-nowrap">
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
