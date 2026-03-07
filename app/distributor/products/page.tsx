'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Upload, Download, Edit, Copy, Trash2, MoreVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';
import { getProducts } from '@/lib/data-helpers';

export default function ProductsPage() {
  const { user, organization } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchProducts() {
      if (!user?.id) return;
      try {
        const data = await getProducts({ distributorId: user.id });
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    fetchProducts();
  }, [user]);

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',');
          
          // Skip header row and parse products
          const importedProducts = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',');
            return {
              sku: values[0]?.trim(),
              name: values[1]?.replace(/"/g, '').trim(),
              brand: values[2]?.trim(),
              price: parseFloat(values[3]) || 0,
              inventory: parseInt(values[4]) || 0,
              status: values[5]?.trim() || 'DRAFT',
              organization_id: user?.organizationId,
            };
          });

          if (importedProducts.length > 0) {
            toast.success(`Parsed ${importedProducts.length} products from CSV. Import functionality requires bulk create API.`);
            console.log('Imported products:', importedProducts);
          } else {
            toast.error('No valid products found in CSV');
          }
        } catch (error) {
          console.error('CSV parse error:', error);
          toast.error('Failed to parse CSV file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExport = () => {
    // Generate CSV from current products
    if (products.length === 0) {
      toast.error('No products to export');
      return;
    }
    
    const csvContent = [
      ['SKU', 'Name', 'Brand', 'Price', 'Inventory', 'Status'].join(','),
      ...products.map(p => [
        p.sku,
        `"${p.name}"`,
        p.brand || '',
        p.price,
        p.inventory || 0,
        p.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Products exported successfully!');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p className="text-gray-600">{filteredProducts.length} products</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleImportCSV}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/distributor/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-400">{product.brand.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{product.inventory} units</span>
                      {product.inventory < product.lowStockThreshold && (
                        <Badge variant="warning" className="text-xs">Low</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      product.status === 'ACTIVE' ? 'success' :
                      product.status === 'DRAFT' ? 'default' :
                      product.status === 'OUT_OF_STOCK' ? 'danger' :
                      'default'
                    }>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/distributor/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No products found</p>
          <Link href="/distributor/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
