'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, Heart, Share2, Minus, Plus, Download, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Product, Organization } from '@/lib/types';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { RequestQuoteModal } from '@/components/request-quote-modal';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const prod = products.find((p: Product) => p.id === params.id);
    setProduct(prod || null);

    if (prod) {
      const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
      const org = orgs.find((o: Organization) => o.id === prod.organizationId);
      setOrganization(org || null);

      const related = products.filter((p: Product) => 
        p.category === prod.category && p.id !== prod.id
      ).slice(0, 4);
      setRelatedProducts(related);
    }
  }, [params.id]);

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

  const currentPrice = product.volumePricing.length > 0
    ? product.volumePricing.find(vp => quantity >= vp.minQuantity && (!vp.maxQuantity || quantity <= vp.maxQuantity))?.price || product.price
    : product.price;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <span>Home</span> &gt; <span>Products</span> &gt; <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4">
            <div className="text-6xl font-bold text-gray-300">{product.brand.charAt(0)}</div>
          </div>
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
            
            {product.volumePricing.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm mb-2">Volume Pricing:</p>
                  <div className="space-y-1 text-sm">
                    {product.volumePricing.map((vp, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{vp.minQuantity}-{vp.maxQuantity || '∞'} units:</span>
                        <span className="font-semibold">{formatCurrency(vp.price)} ({vp.discount}% off)</span>
                      </div>
                    ))}
                  </div>
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
              <Badge variant={product.availability === 'IN_STOCK' ? 'success' : 'warning'}>
                {product.inventory} units available
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
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>{product.specifications.find(s => s.label === 'Port Count')?.value} ports</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Stackable up to 8 units</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>3-year warranty included</span>
            </div>
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
            <div className="grid md:grid-cols-2 gap-4">
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">{spec.label}</span>
                  <span className="text-gray-900">{spec.value} {spec.unit}</span>
                </div>
              ))}
            </div>
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
                  <p className="text-sm text-gray-600">3-year manufacturer warranty</p>
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
              <ProductCard key={prod.id} product={prod} />
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
            organizationId: product.organizationId,
          }}
          onClose={() => setShowQuoteModal(false)}
        />
      )}
    </div>
  );
}
