'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Package,
  Calendar,
  CheckCircle,
  Award,
  Users,
  TrendingUp,
  Store,
  MessageCircle,
} from 'lucide-react';

export default function ResellerProfilePage() {
  const params = useParams();
  const [reseller, setReseller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReseller();
    loadProducts();
  }, [params.id]);

  const loadReseller = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', params.id)
        .eq('type', 'RESELLER')
        .single();

      if (error) throw error;
      setReseller(data);
    } catch (error) {
      console.error('Error loading reseller:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('organization_id', params.id)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!reseller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reseller not found</h1>
          <p className="text-gray-600 mb-6">The reseller you're looking for doesn't exist or may have been removed.</p>
          <Link href="/">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = reseller.logo;
  const initials = reseller.name?.charAt(0)?.toUpperCase() || 'R';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {primaryImage ? (
                <img src={primaryImage} alt={reseller.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-indigo-600">{initials}</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{reseller.name}</h1>
                  {reseller.description && (
                    <p className="text-gray-600 mb-4 max-w-2xl">{reseller.description}</p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap mb-4">
                    {reseller.verified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified Reseller
                      </Badge>
                    )}
                    <Badge variant="default" className="bg-indigo-100 text-indigo-700">
                      <Store className="h-3 w-3 mr-1" />
                      Reseller
                    </Badge>
                    {reseller.industry && (
                      <Badge variant="default">{reseller.industry}</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{reseller.rating || '4.5'}</span>
                    <span>({reseller.review_count || 0} reviews)</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {reseller.contact_support_email && (
                    <a href={`mailto:${reseller.contact_support_email}`}>
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            <Card>
              <CardHeader><CardTitle>About {reseller.name}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {reseller.year_established && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Established</p>
                        <p className="font-semibold text-gray-900">{reseller.year_established}</p>
                      </div>
                    </div>
                  )}
                  {reseller.company_size && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Company Size</p>
                        <p className="font-semibold text-gray-900">{reseller.company_size} employees</p>
                      </div>
                    </div>
                  )}
                  {reseller.address_city && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                        <p className="font-semibold text-gray-900">
                          {[reseller.address_city, reseller.address_country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                  {reseller.legal_name && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Legal Name</p>
                        <p className="font-semibold text-gray-900">{reseller.legal_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products ({products.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No products listed yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {products.map((product) => {
                      const img = product.product_images?.[0]?.url;
                      return (
                        <Link key={product.id} href={`/products/${product.id}`}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {img
                                    ? <img src={img} alt={product.name} className="w-full h-full object-cover" />
                                    : <Package className="h-7 w-7 text-indigo-400" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                                  {product.brand && (
                                    <p className="text-xs text-indigo-600 mt-0.5">{product.brand}</p>
                                  )}
                                  <p className="text-base font-bold text-gray-900 mt-2">
                                    {formatCurrency(product.price || 0)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {(reseller.address_street || reseller.address_city) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">
                        {reseller.address_street && `${reseller.address_street}, `}
                        {reseller.address_city && `${reseller.address_city}, `}
                        {reseller.address_state && `${reseller.address_state} `}
                        {reseller.address_postal_code}
                        {reseller.address_country && <><br />{reseller.address_country}</>}
                      </p>
                    </div>
                  </div>
                )}

                {reseller.contact_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <a href={`tel:${reseller.contact_phone}`} className="text-sm text-indigo-600 hover:underline">
                        {reseller.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {reseller.contact_support_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <a href={`mailto:${reseller.contact_support_email}`} className="text-sm text-indigo-600 hover:underline">
                        {reseller.contact_support_email}
                      </a>
                    </div>
                  </div>
                )}

                {reseller.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Website</p>
                      <a
                        href={reseller.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {reseller.website}
                      </a>
                    </div>
                  </div>
                )}

                {!reseller.contact_phone && !reseller.contact_support_email && !reseller.address_city && !reseller.website && (
                  <p className="text-sm text-gray-500">Contact information not available</p>
                )}
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{reseller.rating || '4.5'}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Reviews</span>
                  </div>
                  <span className="font-semibold">{reseller.review_count || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm text-gray-600">Products Listed</span>
                  </div>
                  <span className="font-semibold">{products.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
