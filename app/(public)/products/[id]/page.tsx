'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, Heart, Share2, Minus, Plus, Download, CheckCircle, Package, MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getProductById, getEnhancedProducts } from '@/lib/product-helpers';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { RequestQuoteModal } from '@/components/request-quote-modal';
import { ProductChatModal } from '@/components/product-chat-modal';
import { useSimpleAuth } from '@/lib/simple-auth';

export default function ProductDetailPage() {
  const params = useParams();
  const { user } = useSimpleAuth();
  const [product, setProduct] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductData();
  }, [params.id]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      // Fetch product details
      const productData = await getProductById(params.id as string);
      setProduct(productData);

      if (productData) {
        // Fetch organization details
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', productData.organization_id)
          .single();
        
        if (orgData) {
          setOrganization(orgData);
        }

        // Fetch related products from same category
        const relatedData = await getEnhancedProducts({
          categoryId: productData.category_id
        });
        
        // Filter out current product and limit to 4
        const filtered = relatedData.filter((p: any) => p.id !== productData.id).slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Product not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPrice = product.price;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <span>Home</span> &gt; <span>Products</span> &gt; <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div>
          {product.product_images && product.product_images.length > 0 ? (
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
              <img 
                src={product.product_images[0].url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4">
              <Package className="h-32 w-32 text-gray-300" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">SKU: {product.sku}</p>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">(4.8) 145 reviews</span>
            </div>
          </div>

          {organization && (
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">{organization.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Sold by</p>
                  <Link href={`/distributors/${organization.id}`} className="font-semibold text-blue-600 hover:underline">
                    {organization.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({organization.rating})</span>
                    {organization.verified && (
                      <Badge variant="success" className="text-xs">Verified</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(currentPrice)}
              <span className="text-lg font-normal text-gray-500">/unit</span>
            </div>
            
            {product.min_order_quantity && product.min_order_quantity > 1 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm">Minimum Order Quantity: {product.min_order_quantity} units</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-r-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 border-0 text-center focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-l-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant={product.stock_status === 'IN_STOCK' ? 'success' : 'warning'}>
                {product.stock_status || 'IN_STOCK'}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <Button size="lg" className="w-full" onClick={() => setShowQuoteModal(true)}>
              Request Quote
            </Button>
            <Link href={`/reseller/deals/register?product=${product.id}`} className="block">
              <Button size="lg" variant="secondary" className="w-full">Start Deal Registration</Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full"
              onClick={() => setShowChat(true)}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat with Sales
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Heart className="h-5 w-5 mr-2" />
                Add to Wishlist
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {product.key_features && product.key_features.map((feature: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>{feature}</span>
              </div>
            ))}
            {product.warranty_period && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>{product.warranty_period} month warranty - {product.warranty_type}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            {['overview', 'specifications', 'support', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Product Overview</h2>
            <p className="text-gray-700 mb-6">{product.description}</p>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Technical Specifications</h2>
            {product.product_tech_specs && product.product_tech_specs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {product.product_tech_specs.map((spec: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-700">{spec.spec_name}</span>
                    <span className="text-gray-900">{spec.spec_value} {spec.spec_unit || ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No technical specifications available</p>
            )}
            <Button variant="outline" className="mt-6">
              <Download className="h-4 w-4 mr-2" />
              Download Datasheet (PDF)
            </Button>
          </div>
        )}

        {activeTab === 'support' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Support & Documentation</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Warranty</h3>
                  <p className="text-sm text-gray-600">{product.warranty_info || 'Manufacturer warranty included'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Support</h3>
                  <p className="text-sm text-gray-600">24/7 technical support available</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600">Full user manuals available</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">Great product!</p>
                        <div className="flex text-yellow-400 text-sm my-1">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={idx} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2 weeks ago</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Excellent quality and performance. Highly recommended for enterprise deployments.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <Link key={prod.id} href={`/products/${prod.id}`}>
                <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer overflow-hidden">
                  <div className="relative h-48 bg-gray-100">
                    {prod.product_images && prod.product_images[0] ? (
                      <img
                        src={prod.product_images[0].url}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{prod.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{prod.brand}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(prod.price)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
      {showQuoteModal && (
        <RequestQuoteModal
          product={{
            id: product.id,
            name: product.name,
            price: currentPrice,
            organizationId: product.organization_id,
          }}
          onClose={() => setShowQuoteModal(false)}
        />
      )}
      
      {showChat && user && (
        <ProductChatModal
          productId={product.id}
          productName={product.name}
          distributorId={product.organization_id}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
