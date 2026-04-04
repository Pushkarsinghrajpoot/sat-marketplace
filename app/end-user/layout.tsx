'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSimpleAuth } from '@/lib/simple-auth';
import { useCart } from '@/lib/cart-context';
import { CartSidebar } from '@/components/cart-sidebar';
import { NotificationBell } from '@/components/notification-bell';
import { Button } from '@/components/ui/button';
import { Eye, LogOut, Menu, X, ChevronLeft, ChevronRight, FileText, LayoutDashboard, ShoppingBag, ShoppingCart, Package } from 'lucide-react';

export default function EndUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, organization, logout, loading } = useSimpleAuth();
  const { count: cartCount } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'END_USER') {
      router.push('/');
    }
  }, [user, router, loading]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 bg-[#0F172A] transition-all duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[240px]'
          } w-[240px]`}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-5 border-b border-[#1E293B]">
              <Link href="/end-user/dashboard" className={`flex items-center gap-2 transition-opacity ${sidebarCollapsed ? 'lg:opacity-0 lg:pointer-events-none' : ''}`}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                  <span className="text-sm font-bold text-[#0F172A]">B2B</span>
                </div>
                <span className="font-semibold text-white">Marketplace</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#94A3B8]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-6">
              {!sidebarCollapsed && (
                <div className="mb-6 px-3 hidden lg:block">
                  <div className="flex items-center gap-3 p-3 bg-[#1E293B] rounded-md border border-[#334155]">
                    <Eye className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                    <div>
                      <p className="text-[12px] font-medium text-white">View-Only Access</p>
                      <p className="text-[11px] text-[#64748B]">Read-only mode</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-6 px-3 lg:hidden">
                <div className="flex items-center gap-3 p-3 bg-[#1E293B] rounded-md border border-[#334155]">
                  <Eye className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium text-white">View-Only Access</p>
                    <p className="text-[11px] text-[#64748B]">Read-only mode</p>
                  </div>
                </div>
              </div>
              <nav className="space-y-1">
                {[{ href: '/end-user/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { href: '/end-user/my-leads', label: 'My Requests', icon: FileText }, { href: '/end-user/orders', label: 'My Orders', icon: ShoppingBag }, { href: '/checkout', label: 'Checkout', icon: Package }].map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link key={href} href={href}
                      className={`flex items-center h-10 text-[14px] font-medium transition-colors relative ${
                        sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'gap-3 px-3'
                      } ${isActive ? 'text-white bg-[#1E293B] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#6366F1]' : 'text-[#94A3B8] hover:bg-[#1E293B]/70 hover:text-white'}`}
                      title={sidebarCollapsed ? label : undefined}>
                      <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                      <span className={`flex-1 transition-opacity ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{label}</span>
                    </Link>
                  );
                })}

                {/* Cart button with badge */}
                <button
                  onClick={() => setCartOpen(true)}
                  className={`w-full flex items-center h-10 text-[14px] font-medium transition-colors relative text-[#94A3B8] hover:bg-[#1E293B]/70 hover:text-white ${
                    sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'gap-3 px-3'
                  }`}
                  title={sidebarCollapsed ? 'Cart' : undefined}
                >
                  <div className="relative flex-shrink-0">
                    <ShoppingCart className="h-[18px] w-[18px]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#6366F1] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span className={`flex-1 text-left transition-opacity ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                    Cart {cartCount > 0 && <span className="ml-1 bg-[#6366F1] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{cartCount}</span>}
                  </span>
                </button>
              </nav>
            </div>

            <div className="border-t border-[#1E293B] p-4">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-3 px-3 py-2 mb-2 hidden lg:flex">
                  <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center text-white text-sm font-semibold border border-[#334155]">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-[#64748B]">{user?.role}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 px-3 py-2 mb-2 lg:hidden">
                <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center text-white text-sm font-semibold border border-[#334155]">
                  {user?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#64748B]">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 py-2 text-[14px] font-medium text-[#EF4444] hover:bg-[#1E293B] rounded transition-colors ${
                  sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'justify-start px-3'
                }`}
                title={sidebarCollapsed ? 'Logout' : undefined}
              >
                <LogOut className="h-[18px] w-[18px]" />
                <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-[60px] bg-white border-b border-[#E4E4E7] flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#71717A]">
                <Menu className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
                className="hidden lg:flex items-center justify-center w-9 h-9 border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] transition-colors text-[#71717A]"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight className="h-[18px] w-[18px]" /> : <ChevronLeft className="h-[18px] w-[18px]" />}
              </button>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-9 h-9 flex items-center justify-center border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] transition-colors"
              >
                <ShoppingCart className="h-[18px] w-[18px] text-[#71717A]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#6366F1] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
              <NotificationBell />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#6366F1] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-[14px] font-medium text-[#09090B]">{user?.name}</p>
                  <p className="text-[12px] text-[#71717A]">{user?.role}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#FAFAFA]">
            {children}
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
