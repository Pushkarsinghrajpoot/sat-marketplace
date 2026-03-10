'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star, ShoppingCart, MessageCircle, Eye, FileText, Package } from 'lucide-react';
import { getEnhancedProducts, createProductInquiry, createDemoRequest } from '@/lib/product-helpers';
import { useSimpleAuth } from '@/lib/simple-auth';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ResellerProductsPage() {
  const { user, organization } = useSimpleAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getEnhancedProducts({
        status: 'ACTIVE'
      });
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    // Fetch categories from localStorage or API
    const cats = JSON.parse(localStorage.getItem('categories') || '[]');
    setCategories(cats);
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleRequestQuote = (productId: string) => {
    // Navigate to quote request page or open modal
    toast.info('Quote request feature coming soon');
  };

  const handleAskQuestion = async (productId: string) => {
    if (!user) {
      toast.error('Please login to ask questions');
      return;
    }

    const question = prompt('Enter your question:');
    if (question) {
      try {
        await createProductInquiry({
          productId,
          userId: user.id,
          inquiryType: 'TECHNICAL',
          subject: 'Product Question',
          question
        });
        toast.success('Question submitted successfully');
      } catch (error) {
        toast.error('Failed to submit question');
      }
    }
  };

  const handleRequestDemo = async (productId: string) => {
    if (!user || !organization) {
      toast.error('Please login to request demo');
      return;
    }

    try {
      await createDemoRequest({
        productId,
        userId: user.id,
        organizationId: organization.id,
        locationType: 'ONLINE',
        attendeeCount: 1
      });
      toast.success('Demo request submitted successfully');
    } catch (error) {
      toast.error('Failed to submit demo request');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Marketplace</h1>
          <p className="text-gray-600 mt-1">Browse and request quotes for products</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredProducts.length} products
      </div>

      {/* Products Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-100">
              {product.product_images && product.product_images[0] ? (
                <img
                  src={product.product_images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-16 w-16 text-gray-300" />
                </div>
              )}
              {product.is_featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500">
                  Featured
                </Badge>
              )}
              {product.is_trending && (
                <Badge className="absolute top-2 left-2 bg-red-500">
                  Trending
                </Badge>
              )}
            </div>

            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(product.price)}
                  </p>
                  <p className="text-xs text-gray-500">MOQ: {product.min_order_quantity || 1}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {product.short_description || product.description}
              </p>

              {/* Product Info */}
              <div className="flex gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {product.view_count || 0} views
                </div>
                {product.stock_status && (
                  <Badge variant={product.stock_status === 'IN_STOCK' ? 'success' : 'warning'}>
                    {product.stock_status}
                  </Badge>
                )}
              </div>

              {/* Key Features */}
              {product.key_features && product.key_features.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-700">Key Features:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {product.key_features.slice(0, 3).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span className="line-clamp-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleRequestQuote(product.id)}
                  className="w-full"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Request Quote
                </Button>
                <Button
                  onClick={() => handleAskQuestion(product.id)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Ask Question
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {product.demo_available && (
                  <Button
                    onClick={() => handleRequestDemo(product.id)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Request Demo
                  </Button>
                )}
                <Link href={`/products/${product.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}
