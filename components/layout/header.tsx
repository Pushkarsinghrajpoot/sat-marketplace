'use client';

import Link from 'next/link';
import { Search, Bell, User, ShoppingCart, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSimpleAuth } from '@/lib/simple-auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, organization, isAuthenticated, logout, loading } = useSimpleAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products, services, or distributors..."
                  className="w-full pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              // Show loading skeleton to prevent flash
              <div className="flex items-center gap-3">
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                      3
                    </span>
                  </Button>
                </Link>
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
