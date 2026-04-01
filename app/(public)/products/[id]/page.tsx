'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, Heart, Share2, Minus, Plus, Download, CheckCircle, Package, MessageCircle, ShoppingCart, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getProductById, getEnhancedProducts } from '@/lib/product-helpers';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { RequestQuoteModal } from '@/components/request-quote-modal';
import { ProductChatModal } from '@/components/product-chat-modal';
import { useSimpleAuth } from '@/lib/simple-auth';
import { useCart } from '@/lib/cart-context';
import StarRating from '@/components/ratings/StarRating';
import RatingButton from '@/components/ratings/RatingButton';
import RatingsList from '@/components/ratings/RatingsList';

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
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  const isBuyer = !user || user.role === 'END_USER';
  const [existingRating, setExistingRating] = useState<any>(null);
  const [productRatings, setProductRatings] = useState({ average: 0, count: 0 });

  useEffect(() => {
    fetchProductData();
  }, [params.id, user?.id]);

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

        // Fetch real product ratings
        await fetchProductRatings(productData.id);

        // Check if user has already rated this product
        if (user?.id) {
          await checkExistingRating(productData.id);
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

  const fetchProductRatings = async (productId: string) => {
    try {
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId);

      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        setProductRatings({ average: avgRating, count: reviews.length });
      }
    } catch (error) {
      console.error('Error fetching product ratings:', error);
    }
  };

  const checkExistingRating = async (productId: string) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setExistingRating(data);
      }
    } catch (error) {
      // No existing rating found
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
            <StarRating 
              rating={productRatings.average} 
              readonly 
              showCount 
              count={productRatings.count}
            />
            {user && (
              existingRating ? (
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    You rated ({existingRating.rating}/5 ⭐)
                  </span>
                </div>
              ) : (
                <RatingButton
                  type="product"
                  targetId={product.id}
                  targetName={product.name}
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onRatingSubmitted={() => {
                    fetchProductRatings(product.id);
                    checkExistingRating(product.id);
                  }}
                />
              )
            )}
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
            {/* Buyer flow: Add to Cart + Buy Now */}
            {isBuyer && (
              <>
                <Button
                  size="lg"
                  className="w-full font-semibold"
                  style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}
                  disabled={addingToCart}
                  onClick={async () => {
                    setAddingToCart(true);
                    await addToCart(product.id, quantity);
                    setAddingToCart(false);
                  }}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {addingToCart ? 'Adding…' : 'Add to Cart'}
                </Button>
                <Link href={`/checkout`} className="block" onClick={async (e) => {
                  e.preventDefault();
                  setAddingToCart(true);
                  await addToCart(product.id, quantity);
                  setAddingToCart(false);
                  window.location.href = '/checkout';
                }}>
                  <Button size="lg" variant="outline" className="w-full font-semibold border-[#6366F1] text-[#6366F1] hover:bg-[#F2F3FF]">
                    <Zap className="h-5 w-5 mr-2" />
                    Buy Now
                  </Button>
                </Link>
              </>
            )}
            <Button size="lg" className={`w-full ${isBuyer ? 'mt-1' : ''}`} onClick={() => setShowQuoteModal(true)}
              variant={isBuyer ? 'outline' : 'primary'}>
              Request Quote
            </Button>
            {!isBuyer && (
              <Link href={`/reseller/deals/register?product=${product.id}`} className="block">
                <Button size="lg" variant="secondary" className="w-full">Start Deal Registration</Button>
              </Link>
            )}
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
                Save
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

        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <RatingsList type="product" targetId={product.id} />
          </div>
        )}

        {activeTab === 'support' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Support & Services</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Technical Support</h3>
                  <p className="text-gray-600 mb-4">
                    Get expert technical support for product setup, configuration, and troubleshooting.
                  </p>
                  <Button>Contact Support</Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Documentation</h3>
                  <p className="text-gray-600 mb-4">
                    Access comprehensive documentation, guides, and tutorials.
                  </p>
                  <Button variant="outline">View Docs</Button>
                </CardContent>
              </Card>
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
