'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Package, Mail, Phone, Search, ChevronDown, Inbox,
  Clock, CheckCircle, Truck, AlertCircle, RotateCcw, DollarSign,
  MapPin, CreditCard, FileText, User, Building2, X, ChevronRight,
  TrendingUp, ShoppingBag
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

function OrderDetailPanel({ order, onClose, onUpdate, updating }: {
  order: any;
  onClose: () => void;
  onUpdate: (id: string, status: string, notes: string) => void;
  updating: boolean;
}) {
  const [notes, setNotes] = useState(order.notes || '');
  const [pendingStatus, setPendingStatus] = useState(order.status);
  const items: any[] = order.items || [];
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const addr = order.shipping_address;
  const hasAddr = addr && Object.values(addr).some((v: any) => v?.toString().trim());

  const STATUS_ICONS: Record<string, any> = {
    PENDING: Clock, CONFIRMED: CheckCircle, PROCESSING: RotateCcw,
    SHIPPED: Truck, DELIVERED: CheckCircle, CANCELLED: AlertCircle,
  };
  const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />
      {/* Panel */}
      <div className="w-[520px] max-w-full bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7] sticky top-0 bg-white z-10">
          <div>
            <p className="font-mono font-bold text-[16px] text-[#09090B]">{order.order_number}</p>
            <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F4F5] text-[#71717A] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Status timeline */}
          {order.status !== 'CANCELLED' && (
            <div>
              <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-3">Order Progress</p>
              <div className="flex items-center">
                {STATUS_FLOW.map((step, i) => {
                  const Icon = STATUS_ICONS[step] || Package;
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                        active ? 'border-[#6366F1] bg-[#6366F1] text-white shadow-md shadow-indigo-200'
                        : done ? 'border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]'
                        : 'border-[#E4E4E7] bg-white text-[#D4D4D8]'}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? 'bg-[#6366F1]' : 'bg-[#E4E4E7]'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1.5">
                {STATUS_FLOW.map((step, i) => (
                  <p key={step} className={`text-[9px] font-semibold text-center flex-1 ${i === currentIdx ? 'text-[#6366F1]' : i < currentIdx ? 'text-[#52525B]' : 'text-[#D4D4D8]'}`}>
                    {STATUS_CONFIG[step]?.label}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Buyer */}
          <div className="bg-[#F8F9FF] rounded-xl border border-[#EEF2FF] p-4">
            <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-3">Customer</p>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-bold text-sm flex-shrink-0">
                {order.buyer_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#09090B]">{order.buyer_name}</p>
                {order.buyer_company && (
                  <p className="text-[12px] text-[#71717A] flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3 w-3" />{order.buyer_company}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-2">
                  <a href={`mailto:${order.buyer_email}`}
                    className="flex items-center gap-1.5 text-[12px] text-[#6366F1] hover:underline font-medium">
                    <Mail className="h-3.5 w-3.5" />{order.buyer_email}
                  </a>
                  {order.buyer_phone && (
                    <a href={`tel:${order.buyer_phone}`}
                      className="flex items-center gap-1.5 text-[12px] text-[#6366F1] hover:underline font-medium">
                      <Phone className="h-3.5 w-3.5" />{order.buyer_phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-3">
              Order Items ({items.length})
            </p>
            <div className="space-y-2">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#F8F9FF] rounded-xl border border-[#EEF2FF]">
                  <div className="w-8 h-8 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#09090B] truncate">{item.product_name}</p>
                    {item.sku && <p className="text-[11px] text-[#A1A1AA]">SKU: {item.sku}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] text-[#71717A]">{item.quantity} × ${Number(item.unit_price).toLocaleString()}</p>
                    <p className="text-[13px] font-bold text-[#09090B]">${Number(item.line_total).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="mt-3 p-3 bg-white border border-[#E4E4E7] rounded-xl space-y-1.5">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#71717A]">Subtotal</span>
                <span className="font-medium">${Number(order.subtotal).toLocaleString()}</span>
              </div>
              {Number(order.tax) > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#71717A]">Tax</span>
                  <span>${Number(order.tax).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[14px] font-bold border-t border-[#F4F4F5] pt-1.5">
                <span>Total</span>
                <span className="text-[#6366F1]">${Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping + Payment */}
          <div className="grid grid-cols-2 gap-3">
            {hasAddr && (
              <div className="p-3 bg-[#F8F9FF] rounded-xl border border-[#EEF2FF]">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-[#6366F1]" />
                  <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide">Ship To</p>
                </div>
                <p className="text-[12px] text-[#52525B] leading-relaxed">
                  {[addr.street, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
            <div className="p-3 bg-[#F8F9FF] rounded-xl border border-[#EEF2FF]">
              <div className="flex items-center gap-1.5 mb-2">
                <CreditCard className="h-3.5 w-3.5 text-[#6366F1]" />
                <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide">Payment</p>
              </div>
              <p className="text-[12px] font-semibold text-[#52525B] capitalize">
                {order.payment_method?.replace(/_/g, ' ') || 'Invoice'}
              </p>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Update status */}
          <div>
            <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-3">Update Order Status</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {ORDER_STATUSES.map(s => {
                const Icon = STATUS_ICONS[s] || Package;
                const sCfg = STATUS_CONFIG[s];
                const isActive = order.status === s;
                const isPending = pendingStatus === s && !isActive;
                return (
                  <button key={s}
                    onClick={() => setPendingStatus(s)}
                    disabled={isActive}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-[11px] font-semibold transition-all ${
                      isActive ? `${sCfg.bg} ${sCfg.text} border-current opacity-80 cursor-default`
                      : isPending ? 'border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]'
                      : 'border-[#E4E4E7] bg-white text-[#71717A] hover:border-[#6366F1]/40 hover:text-[#6366F1]'
                    } disabled:cursor-default`}>
                    <Icon className="h-4 w-4" />
                    {sCfg?.label}
                    {isActive && <span className="text-[9px] opacity-70">Current</span>}
                  </button>
                );
              })}
            </div>

            {/* Notes */}
            <div className="mb-3">
              <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide block mb-1.5">
                <FileText className="h-3 w-3 inline mr-1" />Fulfillment Notes
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Add tracking number, delivery instructions, or any notes for the buyer…"
                className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] resize-none outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onUpdate(order.id, pendingStatus, notes)}
                disabled={updating || (pendingStatus === order.status && notes === order.notes)}
                className="flex-1 py-2.5 bg-[#6366F1] text-white rounded-xl text-[13px] font-semibold hover:bg-[#5254CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {updating ? 'Saving…' : pendingStatus !== order.status ? `Update to ${STATUS_CONFIG[pendingStatus]?.label}` : 'Save Notes'}
              </button>
              <button onClick={onClose}
                className="px-4 py-2.5 border border-[#E4E4E7] text-[#71717A] rounded-xl text-[13px] font-semibold hover:bg-[#F4F4F5] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResellerOrdersPage() {
  const { user } = useSimpleAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

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

  const updateOrder = async (orderId: string, status: string, notes: string) => {
    setUpdatingOrder(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      const json = await res.json();
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...json.order } : o));
        setSelectedOrder((prev: any) => prev?.id === orderId ? { ...prev, ...json.order } : prev);
        toast.success(`Order updated to ${STATUS_CONFIG[status]?.label}`);
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

  const totalRevenue = orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + Number(o.total), 0);
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#09090B]">Orders</h1>
          <p className="text-[14px] text-[#71717A]">Manage and fulfill customer orders assigned to you</p>
        </div>
        <button onClick={loadOrders}
          className="flex items-center gap-2 px-3 py-2 border border-[#E4E4E7] rounded-lg text-[13px] text-[#71717A] hover:bg-[#F4F4F5] transition-colors">
          <RotateCcw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Orders',  value: orders.length,          icon: ShoppingBag,  color: 'bg-[#EEF2FF] text-[#6366F1]' },
            { label: 'Pending Action',value: pendingCount,            icon: Clock,        color: 'bg-amber-50 text-amber-600' },
            { label: 'Delivered',     value: deliveredCount,          icon: CheckCircle,  color: 'bg-green-50 text-green-600' },
            { label: 'Revenue',       value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search order #, buyer, email…"
            className="w-full pl-9 pr-4 h-10 border border-[#E4E4E7] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', ...ORDER_STATUSES].map(s => {
            const count = s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 h-10 rounded-lg text-[12px] font-semibold border transition-all ${
                  statusFilter === s
                    ? 'bg-[#6366F1] text-white border-[#6366F1]'
                    : 'bg-white text-[#52525B] border-[#E4E4E7] hover:border-[#6366F1] hover:text-[#6366F1]'
                }`}>
                {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-[#E4E4E7]">
          <CardContent className="p-12 text-center">
            <Inbox className="h-12 w-12 text-[#D4D4D8] mx-auto mb-3" />
            <p className="font-semibold text-[#09090B] mb-1">No orders found</p>
            <p className="text-[13px] text-[#71717A]">
              {search || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Orders from buyers will appear here when they check out.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const items: any[] = order.items || [];
            const SICONS: Record<string, any> = { PENDING: Clock, CONFIRMED: CheckCircle, PROCESSING: RotateCcw, SHIPPED: Truck, DELIVERED: CheckCircle, CANCELLED: AlertCircle };
            const StatusIcon = SICONS[order.status] || Package;

            return (
              <Card key={order.id} className="border-[#E4E4E7] hover:border-[#6366F1]/30 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => setSelectedOrder(order)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <StatusIcon className={`h-5 w-5 ${cfg.text}`} />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-bold text-[#09090B] text-[14px]">{order.order_number}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                        {order.status === 'PENDING' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 animate-pulse">Action needed</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[12px] text-[#71717A]">
                        <span className="font-semibold text-[#52525B]">{order.buyer_name}</span>
                        {order.buyer_company && <span className="text-[#A1A1AA]">{order.buyer_company}</span>}
                        <span>·</span>
                        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Total + arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[15px] font-bold text-[#09090B]">${Number(order.total).toLocaleString()}</p>
                        <p className="text-[11px] text-[#A1A1AA] capitalize">{order.payment_method?.replace(/_/g, ' ')}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#D4D4D8]" />
                    </div>
                  </div>

                  {/* Item preview pills */}
                  {items.length > 0 && (
                    <div className="mt-2.5 flex gap-1.5 ml-14">
                      {items.slice(0, 3).map((item: any, i: number) => (
                        <span key={i} className="text-[10px] bg-[#F4F4F5] text-[#71717A] px-2 py-0.5 rounded-full truncate max-w-[120px]">
                          {item.product_name}
                        </span>
                      ))}
                      {items.length > 3 && (
                        <span className="text-[10px] bg-[#F4F4F5] text-[#71717A] px-2 py-0.5 rounded-full">+{items.length - 3}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={updateOrder}
          updating={updatingOrder === selectedOrder.id}
        />
      )}
    </div>
  );
}
