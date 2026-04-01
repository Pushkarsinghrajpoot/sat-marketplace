'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Heart, Share2, Minus, Plus, Download, CheckCircle, Package, MessageCircle, ChevronRight, ArrowRight, ThumbsUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getProductById, getEnhancedProducts } from '@/lib/product-helpers';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { RequestQuoteModal } from '@/components/request-quote-modal';
import { ProductChatModal } from '@/components/product-chat-modal';
import { useSimpleAuth } from '@/lib/simple-auth';
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [productRatings, setProductRatings] = useState({ average: 0, count: 0 });
  const [ratingDist, setRatingDist] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  useEffect(() => { fetchProductData(); }, [params.id, user?.id]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const productData = await getProductById(params.id as string);
      setProduct(productData);
      if (productData) {
        const { data: orgData } = await supabase.from('organizations').select('*').eq('id', productData.organization_id).single();
        if (orgData) setOrganization(orgData);
        await fetchProductRatings(productData.id);
        if (user?.id) await checkExistingRating(productData.id);
        const relatedData = await getEnhancedProducts({ categoryId: productData.category_id });
        setRelatedProducts(relatedData.filter((p: any) => p.id !== productData.id).slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductRatings = async (productId: string) => {
    try {
      const { data: reviews } = await supabase.from('product_reviews').select('rating').eq('product_id', productId);
      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
        setProductRatings({ average: avg, count: reviews.length });
        const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => { dist[Math.round(r.rating)] = (dist[Math.round(r.rating)] || 0) + 1; });
        setRatingDist(dist);
      }
    } catch (error) { console.error('Error fetching ratings:', error); }
  };

  const checkExistingRating = async (productId: string) => {
    if (!user?.id) return;
    try {
      const { data } = await supabase.from('product_reviews').select('*').eq('product_id', productId).eq('user_id', user.id).single();
      if (data) setExistingRating(data);
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4648D4] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#76767D] font-medium">Loading product…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-[#C0C1FF] mx-auto mb-4" />
          <p className="text-[#161B2B] font-bold text-xl mb-2">Product Not Found</p>
          <Link href="/categories" className="text-[#4648D4] font-semibold hover:underline">Browse all products</Link>
        </div>
      </div>
    );
  }

  const currentPrice = product.price;
  const images = product.product_images || [];

  // Volume pricing tiers
  const tiers = [
    { range: '1 – 10', price: currentPrice, saving: null },
    { range: '11 – 50', price: currentPrice * 0.95, saving: '5%' },
    { range: '51+', price: currentPrice * 0.90, saving: '10%' },
  ];

  // Group tech specs by category
  const specsByCategory: Record<string, any[]> = {};
  (product.product_tech_specs || []).forEach((s: any) => {
    const cat = s.spec_category || 'General';
    if (!specsByCategory[cat]) specsByCategory[cat] = [];
    specsByCategory[cat].push(s);
  });
  const specCategories = Object.keys(specsByCategory);

  const TABS = ['overview', 'specifications', 'support', 'reviews', 'related'];

  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 pt-8 pb-24">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-[13px] text-[#76767D] font-medium mb-8">
          <Link href="/" className="hover:text-[#4648D4] transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/categories" className="hover:text-[#4648D4] transition-colors">Products</Link>
          {product.categories?.name && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/categories/${product.category_id}`} className="hover:text-[#4648D4] transition-colors">{product.categories.name}</Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#161B2B] font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Main 2-col layout ── */}
        <div className="flex flex-col lg:flex-row gap-14 mb-20">

          {/* LEFT: Image Gallery */}
          <div className="w-full lg:w-[55%] space-y-5">
            <div className="relative group bg-white rounded-2xl border border-[#E4E4E7] shadow-sm overflow-hidden cursor-zoom-in"
              style={{ aspectRatio: '4/3' }}>
              {images.length > 0 ? (
                <img src={images[selectedImage]?.url} alt={product.name}
                  className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-32 w-32 text-[#DEE1F7]" />
                </div>
              )}
              {/* Share button */}
              <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#76767D] hover:text-[#4648D4] transition-colors border border-[#E4E4E7]">
                <Share2 className="h-4 w-4" />
              </button>
              {/* In stock badge */}
              <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-[#161B2B]/90 text-white px-4 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {product.stock_status === 'IN_STOCK' ? 'In Stock' : product.stock_status || 'In Stock'}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                      selectedImage === i ? 'border-[#4648D4]' : 'border-[#E4E4E7] hover:border-[#4648D4]/50'
                    }`}>
                    <img src={img.url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="w-full lg:w-[45%] flex flex-col gap-7">

            {/* SKU + Title + Rating */}
            <div className="space-y-3">
              {product.sku && (
                <span className="inline-block px-3 py-1 bg-[#F2F3FF] rounded-full text-[11px] font-bold tracking-widest text-[#76767D] uppercase">
                  #{product.sku}
                </span>
              )}
              <h1 className="text-[32px] font-extrabold tracking-tight text-[#161B2B] leading-tight">{product.name}</h1>

              {/* Stars + review count */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(productRatings.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-1 font-bold text-[#161B2B] text-sm">{productRatings.average > 0 ? productRatings.average.toFixed(1) : '—'}</span>
                </div>
                {productRatings.count > 0 && (
                  <button onClick={() => setActiveTab('reviews')}
                    className="text-[#4648D4] text-sm font-semibold hover:underline border-l border-[#E4E4E7] pl-4">
                    ({productRatings.count} verified reviews)
                  </button>
                )}
              </div>

              {/* Rating button for logged in users */}
              {user && !existingRating && (
                <RatingButton type="product" targetId={product.id} targetName={product.name}
                  variant="ghost" size="sm"
                  onRatingSubmitted={() => { fetchProductRatings(product.id); checkExistingRating(product.id); }} />
              )}
              {user && existingRating && (
                <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 px-3 py-1.5 rounded-full w-fit">
                  <CheckCircle className="h-3.5 w-3.5" />
                  You rated {existingRating.rating}/5
                </div>
              )}
            </div>

            {/* Distributor card */}
            {organization && (
              <div className="bg-[#F2F3FF] rounded-xl border border-[#E4E4E7] p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-[#4648D4] shadow-sm text-lg border border-[#E4E4E7]">
                    {organization.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#76767D]">Sold by:</p>
                    <p className="font-bold text-[#161B2B] leading-tight">{organization.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[#161B2B] flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {organization.rating || '4.5'}
                      </span>
                      {organization.verified && (
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link href={`/distributors/${organization.id}`}
                  className="text-[#4648D4] font-bold text-sm hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Store <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Pricing section */}
            <div className="space-y-5">
              <div>
                <p className="text-[32px] font-extrabold text-[#4648D4] tracking-tight">
                  {formatCurrency(currentPrice)} <span className="text-sm font-medium text-[#76767D]">/ unit</span>
                </p>
              </div>

              {/* Volume pricing table */}
              <div className="overflow-hidden rounded-xl border border-[#E4E4E7]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F2F3FF] text-[#76767D] text-[10px] tracking-widest font-bold uppercase">
                    <tr>
                      <th className="px-4 py-3">Units</th>
                      <th className="px-4 py-3">Unit Price</th>
                      <th className="px-4 py-3">Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F3FF]">
                    {tiers.map((tier, i) => (
                      <tr key={i} className={i === 1 ? 'bg-[#4648D4]/5' : ''}>
                        <td className="px-4 py-3 font-medium text-[#161B2B]">{tier.range}</td>
                        <td className="px-4 py-3 text-[#161B2B]">{formatCurrency(tier.price)}</td>
                        <td className="px-4 py-3 font-bold text-[#4648D4]">{tier.saving || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button onClick={() => setShowChat(true)}
                className="flex items-center gap-1 text-[#4648D4] font-bold text-sm hover:gap-2 transition-all">
                Contact for bulk pricing <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Qty + Actions */}
            <div className="space-y-5 pt-5 border-t border-[#F2F3FF]">
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-[#F2F3FF] rounded-full px-2 py-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white transition-colors text-[#161B2B]">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-extrabold text-lg text-[#161B2B]">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white transition-colors text-[#161B2B]">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {product.stock_quantity && (
                  <span className="text-sm font-medium text-[#76767D]">{product.stock_quantity} units available</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => setShowQuoteModal(true)}
                  className="h-[52px] rounded-full text-white font-bold text-[16px] shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                  style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)', boxShadow: '0 8px 32px rgba(70,72,212,0.35)' }}>
                  Request Quote
                </button>
                <Link href={`/reseller/deals/register?product=${product.id}`}>
                  <button className="w-full h-[52px] rounded-full font-bold text-[16px] border-2 border-[#F59E0B] text-[#D97706] hover:bg-[#F59E0B]/10 transition-all flex items-center justify-center gap-2">
                    Start Deal Registration
                  </button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8 pt-1">
                <button className="flex items-center gap-2 text-sm font-semibold text-[#76767D] hover:text-[#4648D4] transition-colors">
                  <Heart className="h-5 w-5" />
                  Add to Wishlist
                </button>
                <div className="w-px h-4 bg-[#E4E4E7]" />
                <button onClick={() => setShowChat(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#76767D] hover:text-[#4648D4] transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  Chat with Sales
                </button>
              </div>
            </div>

            {/* Key Features */}
            {((product.key_features && product.key_features.length > 0) || product.warranty_period) && (
              <div className="bg-[#F2F3FF]/50 p-6 rounded-xl border border-[#E4E4E7]">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4 text-[#76767D]">Key Features</h3>
                <ul className="space-y-3">
                  {(product.key_features || []).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#4648D4] flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-[#161B2B]">{feature}</span>
                    </li>
                  ))}
                  {product.warranty_period && (
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#4648D4] flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-[#161B2B]">{product.warranty_period} month warranty — {product.warranty_type || 'Standard'}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div>
          <div className="flex border-b border-[#E4E4E7] gap-10 overflow-x-auto mb-10">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-[#4648D4] border-b-2 border-[#4648D4]'
                    : 'text-[#76767D] hover:text-[#161B2B]'
                }`}>
                {tab === 'related' ? 'Related Products' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-[#161B2B] mb-5">Product Overview</h2>
              <p className="text-[#46464C] leading-relaxed text-[15px]">{product.description || product.short_description || 'No description available.'}</p>
            </div>
          )}

          {/* Specifications */}
          {activeTab === 'specifications' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#161B2B] tracking-tight">Technical Specifications</h2>
                <button className="flex items-center gap-2 px-5 py-2 border-2 border-[#E4E4E7] text-[#161B2B] font-bold text-sm rounded-full hover:bg-[#F2F3FF] transition-all">
                  <Download className="h-4 w-4" /> Download Spec Sheet
                </button>
              </div>
              {specCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                  {specCategories.map(cat => (
                    <div key={cat} className="space-y-5">
                      <div className="bg-[#F2F3FF] px-4 py-2 rounded-lg font-bold text-[11px] uppercase tracking-widest text-[#4648D4]">{cat}</div>
                      <div className="divide-y divide-[#F2F3FF]">
                        {specsByCategory[cat].map((spec: any, idx: number) => (
                          <div key={idx} className="grid grid-cols-2 py-4">
                            <span className="text-sm text-[#76767D] font-medium">{spec.spec_name}</span>
                            <span className="text-sm text-[#161B2B] font-bold">{spec.spec_value}{spec.spec_unit ? ` ${spec.spec_unit}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : product.product_tech_specs?.length > 0 ? (
                <div className="divide-y divide-[#F2F3FF] max-w-2xl">
                  {product.product_tech_specs.map((spec: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-2 py-4">
                      <span className="text-sm text-[#76767D] font-medium">{spec.spec_name}</span>
                      <span className="text-sm text-[#161B2B] font-bold">{spec.spec_value}{spec.spec_unit ? ` ${spec.spec_unit}` : ''}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#76767D]">No technical specifications available.</p>
              )}
            </div>
          )}

          {/* Support */}
          {activeTab === 'support' && (
            <div>
              <h2 className="text-2xl font-bold text-[#161B2B] mb-8">Support & Services</h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
                {[
                  { title: 'Technical Support', desc: 'Get expert technical support for product setup, configuration, and troubleshooting.', cta: 'Contact Support', primary: true },
                  { title: 'Documentation', desc: 'Access comprehensive documentation, installation guides, and tutorials.', cta: 'View Docs', primary: false },
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-2xl border border-[#E4E4E7] bg-white">
                    <h3 className="font-bold text-[#161B2B] text-lg mb-3">{item.title}</h3>
                    <p className="text-[#76767D] text-sm mb-6 leading-relaxed">{item.desc}</p>
                    <button onClick={item.primary ? () => setShowChat(true) : undefined}
                      className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                        item.primary
                          ? 'bg-[#4648D4] text-white hover:bg-[#3a3bc0]'
                          : 'border-2 border-[#E4E4E7] text-[#161B2B] hover:bg-[#F2F3FF]'
                      }`}>
                      {item.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div id="reviews">
              <div className="flex flex-col lg:flex-row gap-16">
                {/* Left: rating summary */}
                <div className="w-full lg:w-1/3">
                  <h3 className="text-2xl font-bold text-[#161B2B] mb-6">Customer Reviews</h3>
                  <div className="flex items-end gap-4 mb-8">
                    <span className="text-6xl font-extrabold text-[#161B2B] leading-none tracking-tighter">
                      {productRatings.average > 0 ? productRatings.average.toFixed(1) : '—'}
                    </span>
                    <div className="mb-1">
                      <div className="flex gap-0.5 mb-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`h-5 w-5 ${s <= Math.round(productRatings.average) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-[#76767D] font-medium">{productRatings.count} Verified Reviews</p>
                    </div>
                  </div>
                  {/* Star distribution bars */}
                  <div className="space-y-3">
                    {[5,4,3,2,1].map(star => {
                      const pct = productRatings.count > 0 ? Math.round((ratingDist[star] || 0) / productRatings.count * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs font-bold w-5 text-[#161B2B]">{star}★</span>
                          <div className="flex-1 h-2 bg-[#F2F3FF] rounded-full overflow-hidden">
                            <div className="h-full bg-[#4648D4] rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-medium w-8 text-[#76767D]">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Rate CTA */}
                  {user && !existingRating && (
                    <div className="mt-8">
                      <RatingButton type="product" targetId={product.id} targetName={product.name}
                        variant="outline" size="md"
                        onRatingSubmitted={() => { fetchProductRatings(product.id); checkExistingRating(product.id); }} />
                    </div>
                  )}
                </div>
                {/* Right: review list */}
                <div className="w-full lg:w-2/3">
                  <RatingsList type="product" targetId={product.id} />
                </div>
              </div>
            </div>
          )}

          {/* Related Products */}
          {activeTab === 'related' && (
            <div>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold text-[#161B2B] tracking-tight">Related Solutions</h2>
                <Link href="/categories" className="text-[#4648D4] font-bold text-sm hover:underline">View All →</Link>
              </div>
              {relatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((prod) => (
                    <Link key={prod.id} href={`/products/${prod.id}`}>
                      <div className="group bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                        <div className="aspect-square rounded-xl bg-[#F2F3FF] flex items-center justify-center overflow-hidden mb-5">
                          {prod.product_images?.[0] ? (
                            <img src={prod.product_images[0].url} alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <Package className="h-14 w-14 text-[#C0C1FF]" />
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-[#76767D] tracking-widest uppercase mb-1">{prod.brand}</p>
                        <h4 className="font-bold text-[#161B2B] leading-tight mb-2 line-clamp-2 group-hover:text-[#4648D4] transition-colors">{prod.name}</h4>
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-[#161B2B]">4.5</span>
                        </div>
                        <p className="text-lg font-extrabold text-[#161B2B]">{formatCurrency(prod.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[#76767D]">No related products found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky floating mini-panel ── */}
      <div className="fixed right-8 bottom-8 z-40 w-80 bg-white rounded-2xl shadow-2xl border border-[#4648D4]/20 p-5 hidden lg:flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-[#F2F3FF] flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#E4E4E7]">
            {images[0] ? (
              <img src={images[0].url} alt={product.name} className="w-full h-full object-contain p-1" />
            ) : (
              <Package className="h-7 w-7 text-[#C0C1FF]" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[#161B2B] truncate">{product.name}</p>
            <p className="text-xl font-extrabold text-[#4648D4] tracking-tight">{formatCurrency(currentPrice)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F2F3FF] rounded-lg px-2 py-1 flex-1">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-6 h-6 flex items-center justify-center text-[#76767D] hover:text-[#161B2B]">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="flex-1 text-center font-bold text-sm text-[#161B2B]">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-[#76767D] hover:text-[#161B2B]">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button onClick={() => setShowQuoteModal(true)}
            className="flex-1 h-10 text-white rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}>
            Request Quote
          </button>
        </div>
        <p className="text-center text-[10px] text-[#76767D] font-medium">Bulk discounts available</p>
      </div>

      {/* ── Modals ── */}
      {showQuoteModal && (
        <RequestQuoteModal
          product={{ id: product.id, name: product.name, price: currentPrice, organizationId: product.organization_id }}
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
