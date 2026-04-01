'use client';

import Link from 'next/link';
import { Search, Bell, User, Menu, LogOut, Package, Briefcase, CheckCircle, X, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/lib/simple-auth';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export function Header() {
  const { user, organization, isAuthenticated, logout, loading } = useSimpleAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.header-search-container')) {
        setShowSuggestions(false);
      }
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
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
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);
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
      console.error('Error fetching search suggestions:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    fetchSearchSuggestions(value);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/categories?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setShowSuggestions(false);
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.id}`);
    } else if (suggestion.type === 'organization') {
      router.push(`/distributors/${suggestion.id}`);
    }
  };

  const getDashboardLink = () => {
    if (organization?.type === 'DISTRIBUTOR') return '/distributor/dashboard';
    if (organization?.type === 'RESELLER') return '/reseller/dashboard';
    if (user?.role === 'PLATFORM_ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-[rgba(199,198,205,0.3)] shadow-[0_2px_20px_rgba(22,27,43,0.08)]' 
        : 'bg-white border-b border-[rgba(199,198,205,0.25)]'
    }`}>
      <div className="container-wide mx-auto px-6">
        <div className="flex h-[64px] items-center gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}>
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div className="hidden md:block">
              <span className="text-[16px] font-800 text-[#161B2B] font-extrabold tracking-tight">NexTrade</span>
              <span className="text-[16px] font-800 text-[#4648D4] font-extrabold tracking-tight"> Pro</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {[
              { href: '/categories', label: 'Categories' },
              { href: '/distributors', label: 'Distributors' },
              { href: '/how-it-works', label: 'How It Works' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-[13.5px] font-medium text-[#46464C] hover:text-[#4648D4] hover:bg-[rgba(70,72,212,0.06)] rounded-lg transition-all"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-[480px] mx-4 hidden md:block">
            <div className="relative header-search-container">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[#94A3B8]" />
              <input
                type="search"
                placeholder="Search products, distributors..."
                className="w-full h-[40px] pl-10 pr-4 bg-[#F2F3FF] border border-transparent rounded-full text-[13.5px] text-[#161B2B] placeholder:text-[#94A3B8] focus:outline-none focus:bg-white focus:border-[#4648D4] focus:shadow-[0_0_0_3px_rgba(70,72,212,0.1)] transition-all"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
              />

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(22,27,43,0.15)] border border-[rgba(199,198,205,0.3)] z-50 overflow-hidden">
                  <div className="p-2">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[#F2F3FF] rounded-xl transition-colors text-left"
                      >
                        {suggestion.type === 'product' ? (
                          <>
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(70,72,212,0.12), rgba(96,99,238,0.08))' }}>
                              <Package className="h-4 w-4 text-[#4648D4]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-[#161B2B] truncate">{suggestion.name}</p>
                              <p className="text-[11px] text-[#76767D]">{suggestion.brand} · SKU: {suggestion.sku}</p>
                            </div>
                            <span className="text-[13px] font-bold text-[#4648D4] flex-shrink-0">{formatCurrency(suggestion.price)}</span>
                          </>
                        ) : (
                          <>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              suggestion.orgType === 'DISTRIBUTOR' ? 'bg-[rgba(70,72,212,0.1)]' : 'bg-[rgba(245,158,11,0.1)]'
                            }`}>
                              <Briefcase className={`h-4 w-4 ${suggestion.orgType === 'DISTRIBUTOR' ? 'text-[#4648D4]' : 'text-[#F59E0B]'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[13px] font-semibold text-[#161B2B] truncate">{suggestion.name}</p>
                                {suggestion.verified && <CheckCircle className="h-3.5 w-3.5 text-[#10B981] flex-shrink-0" />}
                              </div>
                              <p className="text-[11px] text-[#76767D]">{suggestion.product_count} products</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              suggestion.orgType === 'DISTRIBUTOR' 
                                ? 'bg-[rgba(70,72,212,0.1)] text-[#4648D4]' 
                                : 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B]'
                            }`}>
                              {suggestion.orgType === 'DISTRIBUTOR' ? 'Distributor' : 'Reseller'}
                            </span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[rgba(199,198,205,0.2)] p-2">
                    <button
                      onClick={handleSearch}
                      className="w-full text-left px-3 py-2 text-[12px] text-[#4648D4] font-semibold hover:bg-[#F2F3FF] rounded-lg transition-colors"
                    >
                      See all results for "{searchQuery}" →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 ml-auto">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-20 h-8 bg-[#F2F3FF] rounded-full animate-pulse" />
                <div className="w-20 h-8 bg-[#F2F3FF] rounded-full animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              <>
                <NotificationBell />

                {/* Dashboard Link */}
                <Link href={getDashboardLink()} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[#4648D4] hover:bg-[rgba(70,72,212,0.06)] rounded-lg transition-colors">
                  Dashboard
                </Link>

                {/* User Dropdown */}
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#F2F3FF] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}>
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-[13px] font-semibold text-[#161B2B] leading-none">{user?.name.split(' ')[0]}</p>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-[#76767D] hidden md:block" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-[240px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(22,27,43,0.15)] border border-[rgba(199,198,205,0.3)] overflow-hidden z-50">
                      <div className="p-4 border-b border-[rgba(199,198,205,0.2)]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}>
                            {user?.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[#161B2B]">{user?.name}</p>
                            <p className="text-[11px] text-[#76767D]">{user?.email}</p>
                            {organization && (
                              <p className="text-[11px] font-medium text-[#4648D4] mt-0.5">{organization.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          href={getDashboardLink()}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-[#161B2B] hover:bg-[#F2F3FF] rounded-xl transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}>
                            <User className="h-3.5 w-3.5 text-white" />
                          </div>
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-[#161B2B] hover:bg-[#F2F3FF] rounded-xl transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[rgba(70,72,212,0.08)]">
                            <User className="h-3.5 w-3.5 text-[#4648D4]" />
                          </div>
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl transition-colors"
                        >
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[rgba(239,68,68,0.08)]">
                            <LogOut className="h-3.5 w-3.5 text-[#EF4444]" />
                          </div>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <button className="h-9 px-4 text-[13.5px] font-semibold text-[#161B2B] hover:bg-[#F2F3FF] rounded-full transition-colors">
                    Login
                  </button>
                </Link>
                <Link href="/auth/register">
                  <button className="h-9 px-5 text-[13.5px] font-semibold text-white rounded-full transition-all hover:opacity-90 hover:shadow-[0_4px_12px_rgba(70,72,212,0.35)]"
                    style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}>
                    Sign Up Free
                  </button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#F2F3FF] text-[#46464C] transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[rgba(199,198,205,0.2)] bg-white">
          <div className="p-4 space-y-1">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full h-[40px] pl-10 pr-4 bg-[#F2F3FF] border border-transparent rounded-full text-[13.5px] focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            {[
              { href: '/categories', label: 'Categories' },
              { href: '/distributors', label: 'Distributors' },
              { href: '/how-it-works', label: 'How It Works' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-3 text-[14px] font-medium text-[#46464C] hover:bg-[#F2F3FF] rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
