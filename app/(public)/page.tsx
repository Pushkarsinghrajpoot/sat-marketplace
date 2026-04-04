'use client';

import Link from 'next/link';
import { Search, Network, Cloud, Shield, Database, Key, Server, Briefcase, GraduationCap, ArrowRight, CheckCircle, Tag, Lock, Star, TrendingUp, Package, Zap, BarChart3, Trophy, ClipboardList, ChevronRight, Building2, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { getTrendingProducts, getFeaturedProducts } from '@/lib/product-helpers';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/lib/types';

const categoryIcons: { [key: string]: any } = {
  Network, Cloud, Shield, Database, Key, Server, Briefcase, GraduationCap
};

const categoryColors = [
  { from: '#3B82F6', to: '#2563EB' },
  { from: '#8B5CF6', to: '#6D28D9' },
  { from: '#EF4444', to: '#DC2626' },
  { from: '#10B981', to: '#059669' },
  { from: '#F59E0B', to: '#D97706' },
  { from: '#06B6D4', to: '#0891B2' },
  { from: '#EC4899', to: '#DB2777' },
  { from: '#4648D4', to: '#6063EE' },
];

export default function HomePage() {
  const { user, isAuthenticated } = useSimpleAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'resellers' | 'distributors'>('resellers');

  useEffect(() => {
    fetchData();
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('product_count', { ascending: false })
        .limit(8);

      if (categoriesData) {
        setCategories(categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: 'Network',
          productCount: cat.product_count || 0
        })));
      }

      // Resellers see distributor products; everyone else sees reseller products
      const orgType = user?.role === 'RESELLER' || user?.role === 'DISTRIBUTOR'
        ? 'DISTRIBUTOR'
        : 'RESELLER';

      const featured = await getFeaturedProducts(6, orgType);
      setFeaturedProducts(featured);
      const trending = await getTrendingProducts(6, orgType);
      setTrendingProducts(trending);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      window.location.href = `/categories?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const fetchSearchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSearchLoading(true);
    try {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, brand, price, sku')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,sku.ilike.%${query}%`)
        .limit(5);

      const { data: organizations } = await supabase
        .from('organizations')
        .select('id, name, type, verified')
        .ilike('name', `%${query}%`)
        .in('type', ['DISTRIBUTOR', 'RESELLER'])
        .limit(3);

      const orgsWithProducts = await Promise.all(
        (organizations || []).map(async (org: any) => {
          const { count } = await supabase
            .from('products').select('*', { count: 'exact', head: true }).eq('organization_id', org.id);
          return { ...org, orgType: org.type, type: 'organization', product_count: count || 0 };
        })
      );

      const suggestions = [
        ...(products || []).map((p: any) => ({ ...p, type: 'product' })),
        ...orgsWithProducts
      ];
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    fetchSearchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setShowSuggestions(false);
    if (suggestion.type === 'product') window.location.href = `/products/${suggestion.id}`;
    else if (suggestion.type === 'organization') window.location.href = `/distributors/${suggestion.id}`;
  };

  const resellerSteps = [
    { icon: ClipboardList, number: '01', title: 'Register Deal', desc: 'Protect your customer opportunity with verified deal registration' },
    { icon: BarChart3, number: '02', title: 'Get Quotes', desc: 'Compare competitive offers from multiple distributors side-by-side' },
    { icon: Trophy, number: '03', title: 'Close & Earn', desc: 'Win deals with best pricing and build long-term partnerships' },
  ];

  const distributorSteps = [
    { icon: Package, number: '01', title: 'List Products', desc: 'Showcase your product catalog to thousands of qualified resellers' },
    { icon: Users, number: '02', title: 'Engage Resellers', desc: 'Accept engagement requests and build your partner ecosystem' },
    { icon: DollarSign, number: '03', title: 'Grow Revenue', desc: 'Submit quotes, win deals, and track your pipeline in real-time' },
  ];

  const steps = activeTab === 'resellers' ? resellerSteps : distributorSteps;

  return (
    <div className="w-full">

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0F1E 0%, #141E3C 60%, #0D1B2A 100%)' }}>
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 15% 50%, rgba(70,72,212,0.2) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(96,99,238,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.05) 0%, transparent 40%)'
        }} />
        {/* Dot grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-7xl mx-auto px-8 py-28 lg:py-36 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {/* Pill label */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)]">
                <span className="w-2 h-2 rounded-full bg-[#6063EE] animate-pulse" />
                <span className="text-[11px] font-bold text-[#C0C1FF] uppercase tracking-[0.12em]">The Future of Enterprise Procurement</span>
              </div>

              {/* Headline */}
              <div>
                <h1 className="text-[clamp(40px,5.5vw,72px)] font-extrabold text-white leading-[1.04] tracking-[-0.04em] mb-6">
                  The Future of<br />
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #C0C1FF, #FFDDB8)' }}>
                    B2B Technology
                  </span><br />
                  Trade
                </h1>
                <p className="text-[18px] text-[#94A3B8] font-light leading-relaxed max-w-[500px]">
                  Connect with verified distributors, register deals, and close more business — all in one unified digital ecosystem.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/register">
                  <button className="h-14 px-8 text-white text-[15px] font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)', boxShadow: '0 8px 32px rgba(70,72,212,0.4)' }}>
                    Start Trading Now
                  </button>
                </Link>
                <Link href="/how-it-works">
                  <button className="h-14 px-8 text-white text-[15px] font-bold rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all active:scale-95">
                    Learn How It Works
                  </button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 text-[#64748B] text-[13px] pt-2">
                <div className="flex -space-x-2.5">
                  {['#4648D4','#10B981','#F59E0B','#8B5CF6'].map((c, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#141E3C] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                      style={{ background: c }}>
                      {['D','R','A','B'][i]}
                    </div>
                  ))}
                </div>
                <span>Trusted by <span className="text-[#94A3B8] font-semibold">500+ distributors</span> &amp; <span className="text-[#94A3B8] font-semibold">1,200+ resellers</span></span>
              </div>
            </div>

            {/* Right side - abstract visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
                <div className="absolute w-full h-full border border-[rgba(255,255,255,0.05)] rounded-full" style={{ animation: 'spin 60s linear infinite' }} />
                <div className="absolute w-[80%] h-[80%] border border-[rgba(255,255,255,0.08)] rounded-full" style={{ animation: 'spin 40s linear infinite reverse' }} />
                <div className="absolute w-[60%] h-[60%] border border-[rgba(255,255,255,0.05)] rounded-full" />
                <div className="grid grid-cols-2 gap-4 z-20">
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', transform: 'rotate(-6deg)' }}>
                    <Package className="h-9 w-9 text-[#C0C1FF] mb-3" />
                    <div className="text-xl font-bold text-white">Smart Nodes</div>
                    <div className="text-[11px] text-[#64748B]">Interconnected API Mesh</div>
                  </div>
                  <div className="p-6 rounded-xl translate-y-8" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', transform: 'translateY(32px) rotate(3deg)' }}>
                    <CheckCircle className="h-9 w-9 text-[#FFDDB8] mb-3" />
                    <div className="text-xl font-bold text-white">Verified</div>
                    <div className="text-[11px] text-[#64748B]">Distributor Protocol</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== STATS BAR (inside hero) ===== */}
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-[rgba(255,255,255,0.08)]">
            {[
              { icon: Package, value: '5,000+', label: 'Products', color: '#6063EE' },
              { icon: Building2, value: '500+', label: 'Distributors', color: '#FFDDB8' },
              { icon: Users, value: '1,200+', label: 'Resellers', color: '#C0C1FF' },
              { icon: DollarSign, value: 'SAR 50M+', label: 'GMV', color: '#4ADE80' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-[11px] uppercase tracking-[0.1em] text-[#475569] font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORY GRID ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-extrabold text-[#161B2B] tracking-tight mb-4">Browse by Category</h2>
            <p className="text-[#46464C] text-[16px] max-w-[520px] mx-auto">Explore our wide selection of enterprise technology solutions curated from the world's leading vendors.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[160px] rounded-xl bg-[#F2F3FF] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(categories.length > 0 ? categories.map((cat, i) => ({
                name: cat.name,
                Icon: categoryIcons[cat.icon] || Network,
                count: cat.productCount.toLocaleString(),
                href: `/categories/${cat.slug}`,
                bg: ['bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600','bg-sky-100 text-sky-600 group-hover:bg-sky-600','bg-red-100 text-red-600 group-hover:bg-red-600','bg-amber-100 text-amber-600 group-hover:bg-amber-600','bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600','bg-slate-100 text-slate-700 group-hover:bg-slate-700','bg-purple-100 text-purple-600 group-hover:bg-purple-600','bg-orange-100 text-orange-600 group-hover:bg-orange-600'][i % 8]
              })) : [
                { name: 'Networking & Infrastructure', Icon: Network, count: '2,450', href: '/categories', bg: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600' },
                { name: 'Cloud Services', Icon: Cloud, count: '1,820', href: '/categories', bg: 'bg-sky-100 text-sky-600 group-hover:bg-sky-600' },
                { name: 'Cybersecurity', Icon: Shield, count: '1,340', href: '/categories', bg: 'bg-red-100 text-red-600 group-hover:bg-red-600' },
                { name: 'Storage Solutions', Icon: Database, count: '980', href: '/categories', bg: 'bg-amber-100 text-amber-600 group-hover:bg-amber-600' },
                { name: 'Software Licensing', Icon: Key, count: '1,560', href: '/categories', bg: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600' },
                { name: 'Hardware & Servers', Icon: Server, count: '2,100', href: '/categories', bg: 'bg-slate-100 text-slate-700 group-hover:bg-slate-700' },
                { name: 'Professional Services', Icon: Briefcase, count: '640', href: '/categories', bg: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600' },
                { name: 'Training & Certification', Icon: GraduationCap, count: '320', href: '/categories', bg: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600' },
              ]).map((cat, i) => (
                <Link key={i} href={cat.href}>
                  <div className="group p-8 rounded-xl bg-[#F2F3FF] hover:bg-white border-2 border-transparent hover:border-[#4648D4] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:text-white ${cat.bg}`}>
                      <cat.Icon className="h-7 w-7" />
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-[16px] text-[#161B2B] leading-tight">{cat.name}</h3>
                      <ArrowRight className="h-4 w-4 text-[#4648D4] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full bg-white text-[11px] font-bold text-[#46464C] border border-[rgba(199,198,205,0.4)] uppercase tracking-tight">
                      {cat.count} Products
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 bg-[#F2F3FF] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
            <div>
              <h2 className="text-[36px] font-extrabold text-[#161B2B] tracking-tight mb-4">How It Works</h2>
              <p className="text-[#46464C] max-w-xl text-[16px]">A seamless workflow designed to accelerate your B2B sales cycle from registration to final closing.</p>
            </div>
            <div className="mt-8 md:mt-0 p-1.5 bg-[#DEE1F7] rounded-full flex gap-1">
              <button
                onClick={() => setActiveTab('resellers')}
                className={`px-7 py-2.5 rounded-full text-[13px] font-bold transition-all ${activeTab === 'resellers' ? 'bg-[#161B2B] text-white' : 'text-[#46464C] hover:bg-[#CDD0EE]'}`}
              >
                For Resellers
              </button>
              <button
                onClick={() => setActiveTab('distributors')}
                className={`px-7 py-2.5 rounded-full text-[13px] font-bold transition-all ${activeTab === 'distributors' ? 'bg-[#161B2B] text-white' : 'text-[#46464C] hover:bg-[#CDD0EE]'}`}
              >
                For Distributors
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
            {steps.map((step, i) => (
              <div key={`${activeTab}-${i}`} className="relative">
                <div className="text-[110px] font-black leading-none text-transparent bg-clip-text absolute -top-14 -left-2 select-none pointer-events-none"
                  style={{ backgroundImage: i === 0 ? 'linear-gradient(180deg, rgba(70,72,212,0.18) 0%, transparent 100%)' : i === 1 ? 'linear-gradient(180deg, rgba(245,158,11,0.3) 0%, transparent 100%)' : 'linear-gradient(180deg, rgba(16,185,129,0.2) 0%, transparent 100%)' }}>
                  {step.number}
                </div>
                <div className={`bg-white p-10 rounded-xl shadow-lg relative z-10 ${i === 1 ? 'lg:mt-12' : i === 2 ? 'lg:mt-24' : ''}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-8 ${i === 0 ? 'bg-[rgba(70,72,212,0.1)] text-[#4648D4]' : i === 1 ? 'bg-[rgba(245,158,11,0.15)] text-[#D97706]' : 'bg-green-100 text-green-600'}`}>
                    <step.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-[22px] font-bold text-[#161B2B] mb-4">{step.title}</h3>
                  <p className="text-[#46464C] leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2 z-20">
                    <ChevronRight className="h-8 w-8 text-[#C7C6CD]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link href="/auth/register">
              <button className="group h-14 px-10 text-white text-[16px] font-black rounded-full inline-flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 16px_40px rgba(245,158,11,0.35)' }}>
                {activeTab === 'resellers' ? 'Start Your First Deal' : 'List Your Products'}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TRENDING PRODUCTS ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h2 className="text-[30px] font-extrabold text-[#161B2B] tracking-tight">Trending Technology</h2>
            </div>
            <Link href="/categories" className="flex items-center gap-2 text-[#4648D4] font-bold text-[14px] hover:gap-3 transition-all">
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[320px] rounded-xl bg-[#F2F3FF] animate-pulse" />
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingProducts.map((product) => (
                <div key={product.id} className="group relative bg-[#F2F3FF] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-widest">Trending</div>
                  <div className="aspect-video bg-[#DEE1F7] flex items-center justify-center overflow-hidden">
                    {product.product_images?.[0] ? (
                      <img src={product.product_images[0].url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <Package className="h-16 w-16 text-[#C0C1FF]" />
                    )}
                  </div>
                  <div className="p-8">
                    <div className="text-[#4648D4] font-bold text-[13px] mb-1">{product.brand}</div>
                    <h3 className="text-[18px] font-bold text-[#161B2B] mb-4 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[11px] font-bold text-[#46464C] uppercase">In Stock</span>
                      </div>
                      <div className="text-[22px] font-black text-[#161B2B]">{formatCurrency(product.price)}</div>
                    </div>
                  </div>
                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                    style={{ background: 'rgba(22,27,43,0.92)' }}>
                    <Link href={`/products/${product.id}`}>
                      <button className="px-8 py-3 bg-white text-[#161B2B] font-bold rounded-full hover:bg-[#4648D4] hover:text-white transition-colors mb-4">
                        Request Quote
                      </button>
                    </Link>
                    <Link href={`/products/${product.id}`}>
                      <button className="text-[rgba(255,255,255,0.6)] font-medium hover:text-white transition-colors text-[13px]">
                        View Specifications
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-[#C0C1FF] mx-auto mb-4" />
              <p className="text-[#76767D]">No trending products yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-[#F2F3FF]">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <Star className="h-6 w-6" fill="currentColor" />
                </div>
                <h2 className="text-[30px] font-extrabold text-[#161B2B] tracking-tight">Featured Products</h2>
              </div>
              <Link href="/categories" className="flex items-center gap-2 text-[#4648D4] font-bold text-[14px] hover:gap-3 transition-all">
                View All Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="group relative bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded uppercase tracking-widest">Featured</div>
                  <div className="aspect-video bg-[#F2F3FF] flex items-center justify-center overflow-hidden">
                    {product.product_images?.[0] ? (
                      <img src={product.product_images[0].url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <Package className="h-16 w-16 text-[#C0C1FF]" />
                    )}
                  </div>
                  <div className="p-8">
                    <div className="text-[#4648D4] font-bold text-[13px] mb-1">{product.brand}</div>
                    <h3 className="text-[18px] font-bold text-[#161B2B] mb-4 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[11px] font-bold text-[#46464C] uppercase">In Stock</span>
                      </div>
                      <div className="text-[22px] font-black text-[#161B2B]">{formatCurrency(product.price)}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                    style={{ background: 'rgba(22,27,43,0.92)' }}>
                    <Link href={`/products/${product.id}`}>
                      <button className="px-8 py-3 bg-white text-[#161B2B] font-bold rounded-full hover:bg-[#4648D4] hover:text-white transition-colors mb-4">
                        Request Quote
                      </button>
                    </Link>
                    <Link href={`/products/${product.id}`}>
                      <button className="text-[rgba(255,255,255,0.6)] font-medium hover:text-white transition-colors text-[13px]">
                        View Specifications
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== TRUST SIGNALS ===== */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0F1E 0%, #141E3C 100%)' }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[200px] opacity-20 pointer-events-none"
          style={{ background: '#4648D4', transform: 'translate(50%, -50%)' }} />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-extrabold text-white tracking-tight mb-4">Why 3,000+ Companies Choose NexTrade</h2>
            <p className="text-[#64748B] max-w-2xl mx-auto text-[16px]">Built on trust, transparency, and a commitment to transforming the B2B tech procurement experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: CheckCircle, title: 'Verified Distributors', desc: 'Every distributor on our platform undergoes a rigorous vetting process to ensure reliability and authenticity.', color: '#4ADE80' },
              { icon: Tag, title: 'Transparent Pricing', desc: 'No hidden fees or surprise markups. Get direct access to distributor pricing and negotiate in real-time.', color: '#60A5FA' },
              { icon: Lock, title: 'Deal Protection', desc: 'Our proprietary deal registration system ensures your customer opportunities are protected and prioritized.', color: '#C084FC' },
              { icon: Star, title: 'Rated & Reviewed', desc: 'A transparent community feedback system allows you to make decisions based on real user experiences.', color: '#FBBF24' },
            ].map((feature, i) => (
              <div key={i} className="p-10 rounded-2xl hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <feature.icon className="h-12 w-12 mb-6" style={{ color: feature.color }} />
                <h3 className="text-[18px] font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-[#64748B] text-[13px] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA DUAL CARDS ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          {isAuthenticated ? (
            <div className="text-center">
              <h2 className="text-[36px] font-extrabold text-[#161B2B] tracking-tight mb-4">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-[16px] text-[#76767D] mb-10">Continue your B2B marketplace journey</p>
              <div className="flex justify-center gap-4 flex-wrap">
                {user?.role === 'DISTRIBUTOR' && (
                  <Link href="/distributor/dashboard">
                    <button className="h-14 px-8 text-white font-bold rounded-full inline-flex items-center gap-2 transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}>
                      Go to Dashboard <ArrowRight className="h-5 w-5" />
                    </button>
                  </Link>
                )}
                {user?.role === 'RESELLER' && (
                  <Link href="/reseller/dashboard">
                    <button className="h-14 px-8 text-white font-bold rounded-full inline-flex items-center gap-2 transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                      Go to Dashboard <ArrowRight className="h-5 w-5" />
                    </button>
                  </Link>
                )}
                {user?.role === 'PLATFORM_ADMIN' && (
                  <Link href="/admin/dashboard">
                    <button className="h-14 px-8 text-white font-bold rounded-full inline-flex items-center gap-2 transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
                      Admin Dashboard <ArrowRight className="h-5 w-5" />
                    </button>
                  </Link>
                )}
                <Link href="/categories">
                  <button className="h-14 px-8 text-[#161B2B] font-bold rounded-full border-2 border-[#E4E4E7] hover:border-[#4648D4] transition-all">
                    Browse Products
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Distributor Card */}
              <div className="group relative overflow-hidden rounded-3xl p-12 text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #3730a3, #1e1b4b)' }}>
                <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <Building2 className="w-[180px] h-[180px]" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-[38px] font-black mb-6 leading-tight">Are you a<br />Distributor?</h3>
                  <p className="text-indigo-200 mb-10 max-w-sm text-[16px] leading-relaxed">Reach thousands of verified resellers and scale your sales with our automated portal.</p>
                  <Link href="/auth/register">
                    <button className="h-14 px-8 bg-white text-indigo-900 font-bold rounded-full hover:bg-indigo-50 transition-all inline-flex items-center gap-2">
                      List Your Products <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Reseller Card */}
              <div className="group relative overflow-hidden rounded-3xl p-12 text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #B45309, #92400E)' }}>
                <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <Users className="w-[180px] h-[180px]" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-[38px] font-black mb-6 leading-tight">Are you a<br />Reseller?</h3>
                  <p className="text-amber-100 mb-10 max-w-sm text-[16px] leading-relaxed">Find the best deals, register customer opportunities, and close more business with ease.</p>
                  <Link href="/categories">
                    <button className="h-14 px-8 bg-white text-amber-900 font-bold rounded-full hover:bg-orange-50 transition-all inline-flex items-center gap-2">
                      Browse Solutions <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
