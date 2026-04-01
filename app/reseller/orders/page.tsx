'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Package, Mail, Phone, Search, ChevronDown, Inbox,
  Clock, CheckCircle, Truck, AlertCircle, RotateCcw, DollarSign
} from 'lucide-react';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PENDING:    { label: 'Pending',    bg: 'bg-blue-100',   text: 'text-blue-800' },
  CONFIRMED:  { label: 'Confirmed',  bg: 'bg-indigo-100', text: 'text-indigo-800' },
  PROCESSING: { label: 'Processing', bg: 'bg-amber-100',  text: 'text-amber-800' },
  SHIPPED:    { label: 'Shipped',    bg: 'bg-purple-100', text: 'text-purple-800' },
  DELIVERED:  { label: 'Delivered',  bg: 'bg-green-100',  text: 'text-green-800' },
  CANCELLED:  { label: 'Cancelled',  bg: 'bg-red-100',    text: 'text-red-800' },
};

export default function ResellerOrdersPage() {
  const { user } = useSimpleAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user?.id) loadOrders();
  }, [user?.id]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) setOrders(json.orders || []);
      else toast.error('Failed to load orders: ' + json.error);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notesText?: string) => {
    setUpdatingOrder(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: notesText }),
      });
      const json = await res.json();
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...json.order } : o));
        setExpanded(null);
        setNotes('');
        toast.success('Order updated');
      } else {
        toast.error('Failed to update: ' + json.error);
      }
    } catch {
      toast.error('Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    const matchSearch = !s || o.order_number?.toLowerCase().includes(s) ||
      o.buyer_name?.toLowerCase().includes(s) || o.buyer_email?.toLowerCase().includes(s) ||
      o.buyer_company?.toLowerCase().includes(s);
    return matchSearch && (statusFilter === 'ALL' || o.status === statusFilter);
  });

  const totalRevenue = orders
    .filter(o => !['CANCELLED'].includes(o.status))
    .reduce((s, o) => s + Number(o.total), 0);

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#09090B]">Orders</h1>
        <p className="text-[14px] text-[#71717A]">Manage and fulfill customer orders assigned to you</p>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Orders', value: orders.length, color: 'bg-[#EEF2FF] text-[#6366F1]', icon: Package },
            { label: 'Pending Action', value: pendingCount, color: 'bg-amber-50 text-amber-600', icon: Clock },
            { label: 'Revenue (active)', value: `$${totalRevenue.toLocaleString()}`, color: 'bg-green-50 text-green-600', icon: DollarSign },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label} className="border-[#E4E4E7]">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[22px] font-bold text-[#09090B] leading-none">{value}</p>
                  <p className="text-[12px] text-[#71717A] mt-1">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, buyer name, email…"
            className="w-full pl-9 pr-4 h-10 border border-[#E4E4E7] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 border border-[#E4E4E7] rounded-lg text-[13px] bg-white outline-none focus:ring-2 focus:ring-[#6366F1]/20">
          <option value="ALL">All Status</option>
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
          ))}
        </select>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="h-12 w-12 text-[#D4D4D8] mx-auto mb-3" />
            <p className="font-semibold text-[#09090B] mb-1">No orders yet</p>
            <p className="text-[13px] text-[#71717A]">
              {search || statusFilter !== 'ALL' ? 'No orders match your filters.' : 'Orders from buyers will appear here when they check out.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const isOpen = expanded === order.id;
            const items: any[] = order.items || [];

            return (
              <Card key={order.id} className="border-[#E4E4E7]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-[#09090B] text-[15px]">{order.order_number}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-[12px] text-[#71717A]">
                        <span className="font-semibold text-[#09090B]">{order.buyer_name}</span>
                        <a href={`mailto:${order.buyer_email}`} className="flex items-center gap-1 hover:text-[#6366F1]">
                          <Mail className="h-3 w-3" />{order.buyer_email}
                        </a>
                        {order.buyer_phone && (
                          <a href={`tel:${order.buyer_phone}`} className="flex items-center gap-1 hover:text-[#6366F1]">
                            <Phone className="h-3 w-3" />{order.buyer_phone}
                          </a>
                        )}
                        {order.buyer_company && <span>{order.buyer_company}</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-[12px] text-[#A1A1AA]">
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        <span className="font-bold text-[#09090B]">${Number(order.total).toLocaleString()}</span>
                        <span className="capitalize">{order.payment_method?.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <button onClick={() => { setExpanded(isOpen ? null : order.id); setNotes(order.notes || ''); }}
                      className="text-[#71717A] hover:text-[#09090B] transition-colors p-1 flex-shrink-0">
                      <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-[#F4F4F5] space-y-4">
                      {/* Items */}
                      <div>
                        <p className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-2">Order Items</p>
                        <div className="space-y-2">
                          {items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-[#F8F9FF] rounded-lg border border-[#EEF2FF]">
                              <div>
                                <p className="text-[13px] font-medium text-[#09090B]">{item.product_name}</p>
                                {item.sku && <p className="text-[11px] text-[#A1A1AA]">SKU: {item.sku}</p>}
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="text-[12px] text-[#71717A]">
                                  {item.quantity} × ${Number(item.unit_price).toLocaleString()}
                                </p>
                                <p className="text-[13px] font-bold text-[#09090B]">${Number(item.line_total).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="flex justify-between text-[14px] font-bold bg-[#F8F9FF] rounded-xl p-4">
                        <span className="text-[#09090B]">Order Total</span>
                        <span className="text-[#6366F1]">${Number(order.total).toLocaleString()}</span>
                      </div>

                      {/* Shipping address */}
                      {order.shipping_address && Object.values(order.shipping_address).some((v: any) => v) && (
                        <div>
                          <p className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-1">Ship To</p>
                          <p className="text-[13px] text-[#52525B]">
                            {[order.shipping_address.street, order.shipping_address.city,
                              order.shipping_address.state, order.shipping_address.postal_code,
                              order.shipping_address.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Status update */}
                      <div>
                        <p className="text-[12px] font-bold text-[#09090B] mb-2">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {ORDER_STATUSES.map(s => (
                            <button key={s} disabled={updatingOrder === order.id || order.status === s}
                              onClick={() => updateOrderStatus(order.id, s, notes)}
                              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                                order.status === s
                                  ? 'bg-[#6366F1] text-white border-[#6366F1]'
                                  : 'bg-white text-[#52525B] border-[#E4E4E7] hover:border-[#6366F1] hover:text-[#6366F1]'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}>
                              {STATUS_CONFIG[s]?.label || s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <p className="text-[12px] font-bold text-[#09090B] mb-1.5">Fulfillment Notes</p>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                          placeholder="Tracking number, delivery notes, etc."
                          className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[13px] resize-none outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]" />
                        <button onClick={() => updateOrderStatus(order.id, order.status, notes)}
                          disabled={updatingOrder === order.id}
                          className="mt-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-[13px] font-semibold hover:bg-[#5254CC] transition-colors disabled:opacity-50">
                          {updatingOrder === order.id ? 'Saving…' : 'Save Notes'}
                        </button>
                      </div>
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
