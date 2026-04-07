'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Package, TrendingDown, AlertTriangle, CheckCircle, Search,
  RotateCcw, Download, History, RefreshCw, ArrowUpCircle,
  ShoppingCart, DollarSign, Boxes, Save, Plus, ExternalLink,
  ArrowDownCircle, ClipboardCheck, Layers, BarChart2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const CHANGE_TYPES = [
  { value: 'RESTOCK', label: 'Restock' },
  { value: 'ADJUSTMENT', label: 'Manual Adjustment' },
  { value: 'SALE', label: 'Sale / Dispatch' },
  { value: 'RETURN', label: 'Customer Return' },
  { value: 'DAMAGE', label: 'Damage / Write-off' },
];

const DECREMENTS = new Set(['SALE', 'DAMAGE']);

function StockBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = value === 0 ? 'bg-red-400' : pct < 20 ? 'bg-orange-400' : 'bg-green-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold min-w-[28px] text-right ${value === 0 ? 'text-red-600' : pct < 20 ? 'text-orange-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

function logTypePill(type: string) {
  const map: Record<string, string> = {
    RESTOCK: 'bg-green-100 text-green-700',
    SALE: 'bg-orange-100 text-orange-700',
    DAMAGE: 'bg-red-100 text-red-700',
    RETURN: 'bg-purple-100 text-purple-700',
    ADJUSTMENT: 'bg-gray-100 text-gray-700',
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[type] || 'bg-gray-100 text-gray-600'}`}>{type}</span>;
}

export default function ResellerInventoryPage() {
  const { user } = useSimpleAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'reorder' | 'log'>('overview');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('RESTOCK');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bulkQty, setBulkQty] = useState('');
  const [bulkType, setBulkType] = useState('RESTOCK');
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [logTypeFilter, setLogTypeFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  const orgId = user?.organizationId;

  const fetchProducts = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, brand, price, cost_price, inventory, low_stock_threshold, reorder_quantity, warehouse_location, stock_status, availability, status, updated_at')
      .eq('organization_id', orgId)
      .neq('status', 'ARCHIVED')
      .order('name');
    if (error) toast.error('Failed to load products');
    setProducts(data || []);
    setLoading(false);
  }, [orgId]);

  const fetchLogs = useCallback(async () => {
    if (!orgId) return;
    const res = await fetch(`/api/inventory/logs?organizationId=${orgId}&limit=200`);
    if (res.ok) { const body = await res.json(); setLogs(body.logs || []); }
  }, [orgId]);

  useEffect(() => { fetchProducts(); fetchLogs(); }, [fetchProducts, fetchLogs]);

  const totalUnits    = useMemo(() => products.reduce((s, p) => s + (p.inventory ?? 0), 0), [products]);
  const totalValue    = useMemo(() => products.reduce((s, p) => s + (p.price ?? 0) * (p.inventory ?? 0), 0), [products]);
  const inStock       = useMemo(() => products.filter(p => (p.inventory ?? 0) > (p.low_stock_threshold ?? 0)).length, [products]);
  const lowStock      = useMemo(() => products.filter(p => (p.inventory ?? 0) > 0 && (p.inventory ?? 0) <= (p.low_stock_threshold ?? 10)).length, [products]);
  const outOfStock    = useMemo(() => products.filter(p => (p.inventory ?? 0) === 0).length, [products]);
  const reorderNeeded = useMemo(() => products.filter(p => (p.inventory ?? 0) <= (p.low_stock_threshold ?? 10)), [products]);
  const healthPct     = products.length > 0 ? Math.round((inStock / products.length) * 100) : 0;
  const maxStock      = useMemo(() => Math.max(...products.map(p => p.inventory ?? 0), 1), [products]);

  const runAdjust = async (productId: string, qty: string, type: string, notes: string, onDone: () => void) => {
    const delta = parseInt(qty);
    if (isNaN(delta) || delta === 0) { toast.error('Enter a non-zero quantity'); return; }
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, organizationId: orgId, changeType: type, quantityChange: DECREMENTS.has(type) ? -Math.abs(delta) : Math.abs(delta), notes: notes || null, createdBy: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Stock updated: ${data.quantityBefore} → ${data.quantityAfter} units`);
      onDone();
      fetchProducts();
      fetchLogs();
    } catch (e: any) { toast.error(e.message || 'Adjustment failed'); }
  };

  const handleAdjust = async (productId: string) => {
    setSubmitting(true);
    await runAdjust(productId, adjustQty, adjustType, adjustNotes, () => { setAdjustingId(null); setAdjustQty(''); setAdjustNotes(''); });
    setSubmitting(false);
  };

  const handleBulkAdjust = async () => {
    if (!selected.size) { toast.error('Select products first'); return; }
    const delta = parseInt(bulkQty);
    if (isNaN(delta) || delta === 0) { toast.error('Enter a valid quantity'); return; }
    setBulkSubmitting(true);
    let ok = 0;
    for (const pid of selected) { await runAdjust(pid, bulkQty, bulkType, bulkNotes, () => { ok++; }); }
    toast.success(`Bulk update applied to ${ok} products`);
    setSelected(new Set()); setBulkQty(''); setBulkSubmitting(false);
  };

  const handleExport = () => {
    if (!products.length) { toast.error('Nothing to export'); return; }
    const csv = [
      ['SKU', 'Name', 'Brand', 'Sell Price', 'Cost Price', 'Stock', 'Reorder Point', 'Reorder Qty', 'Location', 'Stock Value'].join(','),
      ...products.map(p => [p.sku, `"${p.name}"`, p.brand || '', p.price, p.cost_price || 0, p.inventory ?? 0, p.low_stock_threshold ?? 0, p.reorder_quantity ?? 0, p.warehouse_location || '', ((p.price ?? 0) * (p.inventory ?? 0)).toFixed(2)].join(','))
    ].join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `my-inventory-${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
    toast.success('Exported!');
  };

  const stockRows = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
  }, [products, search]);

  const filteredLogs = useMemo(() => logs.filter(l => {
    const matchType = logTypeFilter === 'ALL' || l.change_type === logTypeFilter;
    const matchQ = !logSearch || l.products?.name?.toLowerCase().includes(logSearch.toLowerCase()) || l.products?.sku?.toLowerCase().includes(logSearch.toLowerCase());
    return matchType && matchQ;
  }), [logs, logTypeFilter, logSearch]);

  const topByValue = useMemo(() => [...products].sort((a, b) => (b.price * b.inventory) - (a.price * a.inventory)).slice(0, 5), [products]);

  const allSelected = stockRows.length > 0 && stockRows.every(p => selected.has(p.id));
  const toggleAll = () => { if (allSelected) setSelected(new Set()); else setSelected(new Set(stockRows.map(p => p.id))); };

  const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart2 },
    { key: 'stock', label: 'Stock Control', icon: Boxes },
    { key: 'reorder', label: 'Reorder Queue', icon: ShoppingCart },
    { key: 'log', label: 'Movement Log', icon: History },
  ] as const;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-[#09090B] mb-1">Inventory Control</h1>
          <p className="text-[13px] text-gray-500">Warehouse management — separate from your product catalog</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => { fetchProducts(); fetchLogs(); }}><RefreshCw className="h-4 w-4 mr-1.5" />Refresh</Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>
          <Link href="/reseller/my-products/new"><Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Add Product</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'SKUs', value: products.length, icon: Layers, color: 'blue' },
          { label: 'Total Units', value: totalUnits.toLocaleString(), icon: Boxes, color: 'indigo' },
          { label: 'In Stock', value: inStock, icon: CheckCircle, color: 'green' },
          { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'orange' },
          { label: 'Out of Stock', value: outOfStock, icon: TrendingDown, color: 'red' },
          { label: 'Stock Value', value: formatCurrency(totalValue), icon: DollarSign, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className={`w-8 h-8 bg-${color}-50 rounded-lg flex items-center justify-center mb-2`}>
                <Icon className={`h-4 w-4 text-${color}-600`} />
              </div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className={`text-lg font-bold ${color === 'orange' ? 'text-orange-600' : color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {reorderNeeded.length > 0 && (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium"><strong>{reorderNeeded.length}</strong> product{reorderNeeded.length !== 1 ? 's need' : ' needs'} restocking</p>
          <button onClick={() => setActiveTab('reorder')} className="ml-auto text-xs font-semibold text-amber-700 underline underline-offset-2">View Reorder Queue →</button>
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
            {key === 'reorder' && reorderNeeded.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === key ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>{reorderNeeded.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-gray-700">Stock Health</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke={healthPct >= 70 ? '#22c55e' : healthPct >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="3" strokeDasharray={`${healthPct} 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{healthPct}%</span>
                    <span className="text-xs text-gray-400">health</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[{ label: 'In Stock', count: inStock, color: 'bg-green-400' }, { label: 'Low Stock', count: lowStock, color: 'bg-orange-400' }, { label: 'Out of Stock', count: outOfStock, color: 'bg-red-400' }].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-gray-500 flex-1">{label}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold text-gray-700">Top Products by Stock Value</CardTitle></CardHeader>
            <CardContent>
              {topByValue.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No products yet</p> : (
                <div className="space-y-3">
                  {topByValue.map(p => {
                    const val = (p.price ?? 0) * (p.inventory ?? 0);
                    const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
                    return (
                      <div key={p.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-800 line-clamp-1">{p.name}</span>
                          <span className="text-gray-500 ml-2 whitespace-nowrap">{formatCurrency(val)} ({p.inventory ?? 0} units)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Recent Movements</CardTitle>
              <button onClick={() => setActiveTab('log')} className="text-xs text-indigo-600 font-medium hover:underline">View all →</button>
            </CardHeader>
            <CardContent className="p-0">
              {logs.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No movements yet. Adjust stock to get started.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>{['Product', 'Type', 'Change', 'Stock After', 'Date'].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {logs.slice(0, 8).map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5"><p className="text-sm font-medium text-gray-800">{log.products?.name}</p><p className="text-xs text-gray-400 font-mono">{log.products?.sku}</p></td>
                          <td className="px-4 py-2.5">{logTypePill(log.change_type)}</td>
                          <td className="px-4 py-2.5"><span className={`text-sm font-bold flex items-center gap-1 ${log.quantity_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{log.quantity_change >= 0 ? <ArrowUpCircle className="h-3.5 w-3.5" /> : <ArrowDownCircle className="h-3.5 w-3.5" />}{log.quantity_change >= 0 ? '+' : ''}{log.quantity_change}</span></td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-gray-900">{log.quantity_after}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* STOCK CONTROL */}
      {activeTab === 'stock' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by name, SKU or brand..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            {selected.size > 0 && (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
                <span className="text-sm font-semibold text-indigo-700">{selected.size} selected</span>
                <select value={bulkType} onChange={e => setBulkType(e.target.value)} className="h-8 text-xs border border-gray-200 rounded-lg px-2 bg-white focus:outline-none">
                  {CHANGE_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                </select>
                <Input type="number" placeholder="Qty" value={bulkQty} onChange={e => setBulkQty(e.target.value)} className="h-8 text-xs w-20" />
                <Input placeholder="Notes" value={bulkNotes} onChange={e => setBulkNotes(e.target.value)} className="h-8 text-xs w-36 hidden sm:block" />
                <Button size="sm" className="h-8 text-xs" disabled={bulkSubmitting} onClick={handleBulkAdjust}>{bulkSubmitting ? 'Applying...' : 'Apply Bulk'}</Button>
                <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600 ml-1">✕</button>
              </div>
            )}
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" /></th>
                    {['Product / SKU', 'Stock Level', 'Stock Value', 'Reorder Point', 'Reorder Qty', 'Location', 'Actions'].map(h => (
                      <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={8} className="px-4 py-16 text-center text-gray-400">Loading...</td></tr>
                  ) : stockRows.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-16 text-center"><Boxes className="h-10 w-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 text-sm">No products found</p></td></tr>
                  ) : stockRows.map(p => {
                    const stockVal = (p.price ?? 0) * (p.inventory ?? 0);
                    const isAdj = adjustingId === p.id;
                    return (
                      <>
                        <tr key={p.id} className={`hover:bg-gray-50 ${selected.has(p.id) ? 'bg-indigo-50' : ''}`}>
                          <td className="px-4 py-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => setSelected(prev => { const s = new Set(prev); s.has(p.id) ? s.delete(p.id) : s.add(p.id); return s; })} className="rounded" /></td>
                          <td className="px-4 py-3"><p className="text-sm font-semibold text-gray-900">{p.name}</p><p className="text-xs font-mono text-gray-400">{p.sku} · {p.brand}</p></td>
                          <td className="px-4 py-3 min-w-[140px]"><StockBar value={p.inventory ?? 0} max={maxStock} /></td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatCurrency(stockVal)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.low_stock_threshold ?? 10}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.reorder_quantity ?? 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{p.warehouse_location || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setAdjustingId(isAdj ? null : p.id); setAdjustQty(''); setAdjustType('RESTOCK'); setAdjustNotes(''); }}>
                                <RotateCcw className="h-3 w-3 mr-1" />{isAdj ? 'Cancel' : 'Adjust'}
                              </Button>
                              <Link href={`/products/${p.id}`} target="_blank">
                                <Button variant="ghost" size="sm" className="h-8"><ExternalLink className="h-3.5 w-3.5" /></Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                        {isAdj && (
                          <tr key={`adj-${p.id}`}>
                            <td colSpan={8} className="px-4 py-4 bg-indigo-50 border-l-4 border-indigo-500">
                              <div className="flex flex-wrap gap-3 items-end">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Change Type</label>
                                  <select value={adjustType} onChange={e => setAdjustType(e.target.value)} className="h-9 text-sm border border-gray-200 rounded-lg px-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                    {CHANGE_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                                  <Input type="number" placeholder="e.g. 50" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} className="h-9 text-sm w-28" min="1" />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
                                  <Input placeholder="e.g. Received from supplier" value={adjustNotes} onChange={e => setAdjustNotes(e.target.value)} className="h-9 text-sm" />
                                </div>
                                <Button size="sm" className="h-9" disabled={submitting} onClick={() => handleAdjust(p.id)}>
                                  <Save className="h-3.5 w-3.5 mr-1.5" />{submitting ? 'Saving...' : 'Save'}
                                </Button>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">Current: <strong>{p.inventory ?? 0} units</strong> · Sale/Damage will subtract; Restock/Return/Adjustment will add.</p>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* REORDER QUEUE */}
      {activeTab === 'reorder' && (
        <div className="space-y-4">
          {reorderNeeded.length === 0 ? (
            <Card><CardContent className="py-20 text-center">
              <ClipboardCheck className="h-12 w-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">All products are adequately stocked!</p>
              <p className="text-sm text-gray-400 mt-1">No reorders needed right now.</p>
            </CardContent></Card>
          ) : (
            <>
              <p className="text-sm text-gray-500">{reorderNeeded.length} product{reorderNeeded.length !== 1 ? 's are' : ' is'} at or below the reorder point.</p>
              {reorderNeeded.map(p => (
                <ReorderCard key={p.id} product={p} orgId={orgId!} userId={user?.id!} onDone={() => { fetchProducts(); fetchLogs(); }} />
              ))}
            </>
          )}
        </div>
      )}

      {/* MOVEMENT LOG */}
      {activeTab === 'log' && (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search product..." value={logSearch} onChange={e => setLogSearch(e.target.value)} className="pl-10 w-56" />
            </div>
            <select value={logTypeFilter} onChange={e => setLogTypeFilter(e.target.value)} className="h-10 text-sm border border-gray-200 rounded-lg px-3 bg-white focus:outline-none">
              <option value="ALL">All Types</option>
              {CHANGE_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
            </select>
            <span className="self-center text-sm text-gray-400">{filteredLogs.length} entries</span>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Product', 'SKU', 'Type', 'Before', 'Change', 'After', 'Notes', 'Date'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-16 text-center text-gray-400"><History className="h-10 w-10 mx-auto mb-2 opacity-20" />No movements match your filters</td></tr>
                  ) : filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.products?.name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">{log.products?.sku}</td>
                      <td className="px-4 py-3">{logTypePill(log.change_type)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{log.quantity_before}</td>
                      <td className="px-4 py-3"><span className={`text-sm font-bold ${log.quantity_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{log.quantity_change >= 0 ? '+' : ''}{log.quantity_change}</span></td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{log.quantity_after}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 max-w-[140px] truncate">{log.notes || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function ReorderCard({ product: p, orgId, userId, onDone }: { product: any; orgId: string; userId: string; onDone: () => void }) {
  const [qty, setQty] = useState(String(p.reorder_quantity || 0));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const restock = async () => {
    const delta = parseInt(qty);
    if (isNaN(delta) || delta <= 0) { toast.error('Enter a valid quantity'); return; }
    setSaving(true);
    const res = await fetch('/api/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: p.id, organizationId: orgId, changeType: 'RESTOCK', quantityChange: delta, notes: notes || 'Reorder restock', createdBy: userId }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || 'Failed'); setSaving(false); return; }
    toast.success(`Restocked ${p.name}: ${data.quantityBefore} → ${data.quantityAfter}`);
    onDone();
    setSaving(false);
  };

  const urgency = (p.inventory ?? 0) === 0 ? 'red' : 'orange';
  return (
    <Card className={`border-l-4 ${urgency === 'red' ? 'border-l-red-400' : 'border-l-orange-400'}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">{p.name}</p>
              {(p.inventory ?? 0) === 0 ? <Badge className="bg-red-100 text-red-700">Out of Stock</Badge> : <Badge className="bg-orange-100 text-orange-700">Low Stock</Badge>}
            </div>
            <p className="text-xs text-gray-400 font-mono">{p.sku} · {p.brand}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>Current: <strong className={urgency === 'red' ? 'text-red-600' : 'text-orange-600'}>{p.inventory ?? 0} units</strong></span>
              <span>Reorder Point: <strong>{p.low_stock_threshold ?? 10}</strong></span>
              <span>Suggested Qty: <strong>{p.reorder_quantity || '—'}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Input type="number" placeholder="Qty to restock" value={qty} onChange={e => setQty(e.target.value)} className="h-9 text-sm w-36" min="1" />
            <Input placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} className="h-9 text-sm w-44 hidden md:block" />
            <Button size="sm" className="h-9 bg-green-600 hover:bg-green-700" disabled={saving} onClick={restock}>
              <ArrowUpCircle className="h-4 w-4 mr-1.5" />{saving ? 'Restocking...' : 'Restock Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
