'use client';

import Link from 'next/link';
import { Search, Bell, User, ShoppingCart, Menu, LogOut, Package, Briefcase, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSimpleAuth } from '@/lib/simple-auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { CartSidebar } from '@/components/cart-sidebar';

export function Header() {
  const { user, organization, isAuthenticated, logout, loading } = useSimpleAuth();
  const { count: cartCount } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const router = useRouter();

  const showCartIcon = !user || user.role === 'END_USER';

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
      // Search products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, brand, price, sku')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,sku.ilike.%${query}%`)
        .limit(5);

      if (productsError) {
        console.error('Products search error:', productsError);
      }

      // Search organizations (distributors and resellers)
      const { data: organizations, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name, type, verified')
        .ilike('name', `%${query}%`)
        .in('type', ['DISTRIBUTOR', 'RESELLER'])
        .limit(5);

      if (orgsError) {
        console.error('Organizations search error:', orgsError);
      }

      // Get product count for each organization
      const orgsWithProducts = await Promise.all(
        (organizations || []).map(async (org: any) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);
          
          return { 
            ...org, 
            orgType: org.type, 
            type: 'organization',
            product_count: count || 0 
          };
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.header-search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-xl font-bold text-white">B2B</span>
              </div>
              <span className="hidden text-lg font-semibold text-gray-900 md:block">
                Marketplace
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                Categories
              </Link>
              <Link href="/distributors" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                Distributors
              </Link>
              <Link href="/how-it-works" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                How It Works
              </Link>
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4 md:gap-6 max-w-2xl mx-4">
            <div className="hidden md:flex flex-1 items-center">
              <div className="relative w-full header-search-container">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products, services, or distributors..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                />
                
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    {searchLoading && (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                      </div>
                    )}
                    {!searchLoading && searchSuggestions.map((suggestion) => (
                      <div
                        key={`${suggestion.type}-${suggestion.id}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      >
                        {suggestion.type === 'product' ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{suggestion.name}</p>
                              <p className="text-xs text-gray-500">{suggestion.brand} • SKU: {suggestion.sku}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-blue-600">{formatCurrency(suggestion.price)}</p>
                            </div>
                          </div>
                        ) : suggestion.type === 'organization' ? (
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              suggestion.orgType === 'DISTRIBUTOR' ? 'bg-purple-100' : 'bg-orange-100'
                            }`}>
                              <Briefcase className={`h-4 w-4 ${
                                suggestion.orgType === 'DISTRIBUTOR' ? 'text-purple-600' : 'text-orange-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-gray-900 truncate">{suggestion.name}</p>
                                {suggestion.verified && (
                                  <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {suggestion.product_count} {suggestion.product_count === 1 ? 'product' : 'products'}
                              </p>
                            </div>
                            <Badge 
                              variant={suggestion.orgType === 'DISTRIBUTOR' ? 'default' : 'warning'} 
                              className="text-xs flex-shrink-0"
                            >
                              {suggestion.orgType === 'DISTRIBUTOR' ? 'Distributor' : 'Reseller'}
                            </Badge>
                          </div>
                        ) : null}
                      </div>
                    ))}
                    <div className="p-2 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={handleSearch}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-left px-1"
                      >
                        See all results for "{searchQuery}" →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <CartSidebar open={showCart} onClose={() => setShowCart(false)} />

          <div className="flex items-center gap-3">
            {showCartIcon && (
              <button onClick={() => setShowCart(true)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6366F1] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium">{user?.name}</span>
                  </Button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
                      <div className="p-4 border-b border-gray-200">
                        <p className="font-semibold text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {organization && (
                          <p className="text-xs text-gray-600 mt-1">{organization.name}</p>
                        )}
                      </div>
                      <div className="p-2">
                        {organization?.type === 'DISTRIBUTOR' && (
                          <Link href="/distributor/dashboard">
                            <Button variant="ghost" className="w-full justify-start" size="sm">
                              Dashboard
                            </Button>
                          </Link>
                        )}
                        {organization?.type === 'RESELLER' && (
                          <Link href="/reseller/dashboard">
                            <Button variant="ghost" className="w-full justify-start" size="sm">
                              Dashboard
                            </Button>
                          </Link>
                        )}
                        <Link href="/profile">
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            Profile
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          size="sm"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
