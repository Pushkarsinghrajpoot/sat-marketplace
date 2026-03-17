'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Target, Handshake, FileText, DollarSign, BarChart3, Settings, LogOut, Bell, Menu, X, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/lib/simple-auth';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/distributor/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/distributor/products', icon: Package },
  { name: 'Inquiries', href: '/distributor/inquiries', icon: HelpCircle },
  { name: 'Messages', href: '/distributor/messages', icon: MessageCircle },
  { name: 'Quotes', href: '/distributor/quotes', icon: FileText },
  { name: 'Campaigns', href: '/distributor/campaigns', icon: Target },
  { name: 'Engagements', href: '/distributor/engagements', icon: Handshake },
  { name: 'Credit Requests', href: '/distributor/credit', icon: DollarSign },
  { name: 'Analytics', href: '/distributor/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/distributor/settings', icon: Settings },
];

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, organization, logout } = useSimpleAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || organization?.type !== 'DISTRIBUTOR') {
      router.push('/auth/login');
    }
  }, [user, organization, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="flex h-screen overflow-hidden">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-[240px] bg-[#0F172A] transition-transform lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-5 border-b border-[#1E293B]">
              <Link href="/distributor/dashboard" className="flex items-center gap-2">
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
              <div className="mb-6 px-3">
                <p className="text-[11px] font-medium text-[#475569] uppercase tracking-wider mb-3">Organization</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1E293B] rounded-md flex items-center justify-center border border-[#334155]">
                    <span className="text-sm font-semibold text-white">{organization?.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-white truncate">{organization?.name}</p>
                    <p className="text-[12px] text-[#64748B]">Distributor</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 h-10 px-3 text-[14px] font-medium transition-colors relative ${
                        isActive
                          ? 'bg-[#1E293B] text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#6366F1]'
                          : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#CBD5E1]'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-[#1E293B] p-4">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center text-white text-sm font-semibold border border-[#334155]">
                  {user?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#64748B]">{user?.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-start gap-3 px-3 py-2 text-[14px] font-medium text-[#EF4444] hover:bg-[#1E293B] rounded transition-colors">
                <LogOut className="h-[18px] w-[18px]" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-[60px] bg-white border-b border-[#E4E4E7] flex items-center justify-between px-8">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#71717A]">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <button className="relative w-9 h-9 flex items-center justify-center border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] transition-colors">
                <Bell className="h-[18px] w-[18px] text-[#71717A]" />
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-medium text-white">
                  3
                </span>
              </button>
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
    </div>
  );
}
