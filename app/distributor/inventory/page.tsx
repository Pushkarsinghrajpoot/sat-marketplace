'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Package, TrendingDown, AlertTriangle, CheckCircle, Search,
  Plus, Minus, RotateCcw, Download, Upload, History, Edit,
  RefreshCw, ArrowUpCircle, ArrowDownCircle, Filter
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const CHANGE_TYPES = [
  { value: 'RESTOCK', label: 'Restock', color: 'text-green-600' },
  { value: 'ADJUSTMENT', label: 'Adjustment', color: 'text-blue-600' },
  { value: 'SALE', label: 'Sale', color: 'text-orange-600' },
  { value: 'RETURN', label: 'Return', color: 'text-purple-600' },
  { value: 'DAMAGE', label: 'Damage / Write-off', color: 'text-red-600' },
  { value: 'TRANSFER', label: 'Transfer', color: 'text-gray-600' },
];

function stockBadge(status: string, inventory: number, threshold: number) {
  if (status === 'OUT_OF_STOCK' || inventory === 0)
    return <Badge className="bg-red-100 text-red-700 border-red-200">Out of Stock</Badge>;
  if (inventory <= threshold)
    return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Low Stock</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-green-200">In Stock</Badge>;
}

export default function DistributorInventoryPage() {
  const { user } = useSimpleAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'low' | 'out' | 'logs'>('all');
  const [search, setSearch] = useState('');
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('RESTOCK');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const orgId = user?.organizationId;

  const fetchProducts = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, brand, price, inventory, low_stock_threshold, stock_status, availability, status, view_count, views, updated_at')
      .eq('organization_id', orgId)
      .neq('status', 'ARCHIVED')
      .order('name');
    if (error) { toast.error('Failed to load products'); }
    setProducts(data || []);
    setLoading(false);
  }, [orgId]);

  const fetchLogs = useCallback(async () => {
    if (!orgId) return;
    const res = await fetch(`/api/inventory/logs?organizationId=${orgId}&limit=100`);
    if (res.ok) {
      const { logs } = await res.json();
      setLogs(logs);
    }
  }, [orgId]);

  useEffect(() => {
    fetchProducts();
    fetchLogs();
  }, [fetchProducts, fetchLogs]);

  const handleAdjust = async (product: any) => {
    const delta = parseInt(adjustQty);
    if (isNaN(delta) || delta === 0) { toast.error('Enter a non-zero quantity'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          organizationId: orgId,
          changeType: adjustType,
          quantityChange: adjustType === 'SALE' || adjustType === 'DAMAGE' ? -Math.abs(delta) : Math.abs(delta),
          notes: adjustNotes,
          createdBy: user?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Stock updated: ${data.quantityBefore} → ${data.quantityAfter} units`);
      setAdjustingId(null);
      setAdjustQty('');
      setAdjustNotes('');
      fetchProducts();
      fetchLogs();
    } catch (e: any) {
      toast.error(e.message || 'Adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (!products.length) { toast.error('No products to export'); return; }
    const csv = [
      ['SKU', 'Name', 'Brand', 'Price', 'Stock', 'Threshold', 'Status'].join(','),
      ...products.map(p => [
        p.sku, `"${p.name}"`, p.brand || '', p.price,
        p.inventory ?? 0, p.low_stock_threshold ?? 0, p.stock_status || p.availability || ''
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `inventory-${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
    toast.success('Inventory exported!');
  };

  // Stats
  const totalProducts = products.length;
  const inStock = products.filter(p => (p.inventory ?? 0) > (p.low_stock_threshold ?? 0)).length;
  const lowStock = products.filter(p => (p.inventory ?? 0) > 0 && (p.inventory ?? 0) <= (p.low_stock_threshold ?? 10)).length;
  const outOfStock = products.filter(p => (p.inventory ?? 0) === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price ?? 0) * (p.inventory ?? 0), 0);

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
    if (activeTab === 'low') return matchQ && (p.inventory ?? 0) > 0 && (p.inventory ?? 0) <= (p.low_stock_threshold ?? 10);
    if (activeTab === 'out') return matchQ && (p.inventory ?? 0) === 0;
    return matchQ;
  });

  const TABS = [
    { key: 'all', label: 'All Products', count: totalProducts },
    { key: 'low', label: 'Low Stock', count: lowStock },
    { key: 'out', label: 'Out of Stock', count: outOfStock },
    { key: 'logs', label: 'Activity Log', count: logs.length },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-[#09090B] mb-1">Inventory Management</h1>
          <p className="text-[14px] text-gray-500">Track and manage your product stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchProducts(); fetchLogs(); }}>
            <RefreshCw className="h-4 w-4 mr-1.5" />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />Export CSV
          </Button>
          <Link href="/distributor/products/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">In Stock</p>
                <p className="text-2xl font-bold text-green-700">{inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <ArrowUpCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Stock Value</p>
                <p className="text-xl font-bold text-purple-700">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low stock banner */}
      {lowStock > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-800 font-medium">
            {lowStock} product{lowStock !== 1 ? 's are' : ' is'} running low on stock.
          </p>
          <button onClick={() => setActiveTab('low')} className="ml-auto text-xs text-orange-700 font-semibold underline">View</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.key ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Activity Log Tab */}
      {activeTab === 'logs' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              Inventory Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {logs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No inventory activity yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Product', 'Type', 'Before', 'Change', 'After', 'Notes', 'By', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{log.products?.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{log.products?.sku}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            log.change_type === 'RESTOCK' ? 'bg-green-100 text-green-700' :
                            log.change_type === 'SALE' ? 'bg-orange-100 text-orange-700' :
                            log.change_type === 'DAMAGE' ? 'bg-red-100 text-red-700' :
                            log.change_type === 'RETURN' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{log.change_type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.quantity_before}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${log.quantity_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {log.quantity_change >= 0 ? '+' : ''}{log.quantity_change}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{log.quantity_after}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate">{log.notes || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{log.users?.name || 'System'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, SKU or brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>

          {/* Products Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Product', 'SKU', 'Price', 'Stock', 'Threshold', 'Status', 'Actions'].map(h => (
                      <th key={h} className={`px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-400">Loading inventory...</td></tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                          {activeTab === 'low' ? 'No low-stock products' : activeTab === 'out' ? 'All products are in stock 🎉' : 'No products found'}
                        </p>
                        {activeTab === 'all' && (
                          <Link href="/distributor/products/new">
                            <Button className="mt-3" size="sm"><Plus className="h-4 w-4 mr-1.5" />Add Product</Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => (
                      <>
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-gray-500">{(product.brand || product.name || 'P').charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                                <p className="text-xs text-gray-400">{product.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-mono text-gray-500">{product.sku}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${(product.inventory ?? 0) === 0 ? 'text-red-600' : (product.inventory ?? 0) <= (product.low_stock_threshold ?? 10) ? 'text-orange-600' : 'text-gray-900'}`}>
                                {product.inventory ?? 0}
                              </span>
                              <span className="text-xs text-gray-400">units</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">{product.low_stock_threshold ?? 10}</td>
                          <td className="px-5 py-4">
                            {stockBadge(product.stock_status || product.availability || '', product.inventory ?? 0, product.low_stock_threshold ?? 10)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setAdjustingId(adjustingId === product.id ? null : product.id); setAdjustQty(''); setAdjustType('RESTOCK'); setAdjustNotes(''); }}
                                className="text-xs h-8"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Adjust Stock
                              </Button>
                              <Link href={`/distributor/products/${product.id}`}>
                                <Button variant="ghost" size="sm" className="h-8">
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Adjust Panel */}
                        {adjustingId === product.id && (
                          <tr key={`adj-${product.id}`}>
                            <td colSpan={7} className="px-5 py-4 bg-blue-50 border-l-4 border-blue-400">
                              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Change Type</label>
                                  <select
                                    value={adjustType}
                                    onChange={e => setAdjustType(e.target.value)}
                                    className="h-9 text-sm border border-gray-300 rounded-lg px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  >
                                    {CHANGE_TYPES.map(ct => (
                                      <option key={ct.value} value={ct.value}>{ct.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                                  <Input
                                    type="number"
                                    placeholder="e.g. 50"
                                    value={adjustQty}
                                    onChange={e => setAdjustQty(e.target.value)}
                                    className="h-9 text-sm w-28"
                                    min="1"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
                                  <Input
                                    placeholder="e.g. Received new shipment from supplier"
                                    value={adjustNotes}
                                    onChange={e => setAdjustNotes(e.target.value)}
                                    className="h-9 text-sm"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="h-9"
                                    disabled={submitting}
                                    onClick={() => handleAdjust(product)}
                                  >
                                    {submitting ? 'Saving...' : 'Save'}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9"
                                    onClick={() => setAdjustingId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Current stock: <strong>{product.inventory ?? 0}</strong> units. Sale/Damage will subtract; Restock/Return/Adjustment will add.
                              </p>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
