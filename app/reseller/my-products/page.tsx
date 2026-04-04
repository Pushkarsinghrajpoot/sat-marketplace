'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Download, Edit, Trash2, Store, ExternalLink } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { getProducts } from '@/lib/data-helpers';
import { toast } from 'sonner';

export default function ResellerMyProductsPage() {
  const { user } = useSimpleAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ distributorId: user?.organizationId });
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (products.length === 0) { toast.error('No products to export'); return; }
    const csv = [
      ['SKU', 'Name', 'Brand', 'Price', 'Stock Status', 'Status'].join(','),
      ...products.map(p => [
        p.sku, `"${p.name}"`, p.brand || '', p.price,
        p.availability || '', p.status
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `my-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Products exported!');
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this product? It will be hidden from the marketplace.')) return;
    const { error } = await supabase.from('products').update({ status: 'ARCHIVED' }).eq('id', id);
    if (error) { toast.error('Failed to archive product'); return; }
    toast.success('Product archived');
    fetchProducts();
  };

  const filtered = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchQ = p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    const matchS = statusFilter === 'all' || p.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Marketplace Products</h1>
          <p className="text-gray-600">Products you list here are visible to end-users in the marketplace</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
          <Link href="/reseller/products">
            <Button variant="outline">Distributor Catalog</Button>
          </Link>
          <Link href="/reseller/my-products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2 font-medium">No products found</p>
                    <p className="text-sm text-gray-400 mb-4">Add your first product to the marketplace</p>
                    <Link href="/reseller/my-products/new">
                      <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
                    </Link>
                  </td>
                </tr>
              ) : filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.product_images?.[0]?.url
                          ? <img src={product.product_images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          : <span className="text-sm font-bold text-indigo-400">{(product.brand || product.name || 'P').charAt(0)}</span>
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1 max-w-xs">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{product.sku}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 text-sm">
                    {(product.availability || product.stock_status) === 'IN_STOCK'
                      ? <span className="text-green-600 font-medium">In Stock</span>
                      : <span className="text-orange-500 font-medium">
                          {(product.availability || product.stock_status || '').replace(/_/g, ' ')}
                        </span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={product.status === 'ACTIVE' ? 'success' : 'default'}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {(product.views || product.view_count || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/reseller/my-products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit product">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/products/${product.id}`} target="_blank">
                        <Button variant="ghost" size="sm" title="View in marketplace">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" title="Archive"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleArchive(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
