'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, FileText, MessageCircle, BarChart3, Settings, LogOut, Bell, Menu, X, Users, HelpCircle, Target, Handshake, DollarSign, Star, Megaphone, Briefcase, UserCog, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/lib/simple-auth';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { NotificationBell } from '@/components/notifications/notification-bell';

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Package,
  FileText,
  MessageCircle,
  BarChart3,
  Settings,
  Users,
  HelpCircle,
  Target,
  Handshake,
  DollarSign,
  Star,
  Megaphone,
  Briefcase,
  UserCog,
};

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, organization, logout, accessibleRoutes, isTeamMember, teamRole } = useSimpleAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageAssignments, setPageAssignments] = useState<string[]>([]);

  // Load PAGE assignments for team members
  useEffect(() => {
    if (user?.id && isTeamMember && teamRole !== 'ADMIN') {
      loadPageAssignments();
    }
  }, [user?.id, isTeamMember, teamRole]);

  const loadPageAssignments = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_assignments')
        .select('reference_id')
        .eq('user_id', user.id)
        .eq('assignment_type', 'PAGE');
      
      if (error) {
        console.error('Error loading page assignments:', error);
        return;
      }
      
      const assignedPages = data?.map(a => a.reference_id) || [];
      console.log('Loaded page assignments:', assignedPages);
      setPageAssignments(assignedPages);
    } catch (error) {
      console.error('Error in loadPageAssignments:', error);
    }
  };

  // Convert accessible routes to navigation format, filtered by PAGE assignments
  const navigation = useMemo(() => {
    let routes = accessibleRoutes;
    
    // Filter routes for non-admin team members based on PAGE assignments
    if (isTeamMember && teamRole !== 'ADMIN' && pageAssignments.length > 0) {
      routes = routes.filter(route => pageAssignments.includes(route.path));
      console.log('Filtered navigation for team member:', routes.length, 'routes');
    }
    
    return routes.map(route => ({
      name: route.label,
      href: route.path,
      icon: (route.icon && iconMap[route.icon]) ? iconMap[route.icon] : LayoutDashboard,
    }));
  }, [accessibleRoutes, isTeamMember, teamRole, pageAssignments]);

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
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 bg-[#0F172A] transition-all duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[240px]'
        } w-[240px]`}>
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-5 border-b border-[#1E293B]">
              <Link href="/distributor/dashboard" className={`flex items-center gap-2 transition-opacity ${sidebarCollapsed ? 'lg:opacity-0 lg:pointer-events-none' : ''}`}>
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
                  <p className="text-[11px] font-medium text-[#475569] uppercase tracking-wider mb-3">
                    {isTeamMember ? 'Profile' : 'Organization'}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1E293B] rounded-md flex items-center justify-center border border-[#334155]">
                      <span className="text-sm font-semibold text-white">
                        {isTeamMember ? user?.name.charAt(0) : organization?.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-white truncate">
                        {isTeamMember ? user?.name : organization?.name}
                      </p>
                      <p className="text-[12px] text-[#64748B]">
                        {isTeamMember ? teamRole : 'Distributor'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-6 px-3 lg:hidden">
                <p className="text-[11px] font-medium text-[#475569] uppercase tracking-wider mb-3">
                  {isTeamMember ? 'Profile' : 'Organization'}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1E293B] rounded-md flex items-center justify-center border border-[#334155]">
                    <span className="text-sm font-semibold text-white">
                      {isTeamMember ? user?.name.charAt(0) : organization?.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-white truncate">
                      {isTeamMember ? user?.name : organization?.name}
                    </p>
                    <p className="text-[12px] text-[#64748B]">
                      {isTeamMember ? teamRole : 'Distributor'}
                    </p>
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
                      className={`flex items-center h-10 text-[14px] font-medium transition-colors relative ${
                        sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'gap-3 px-3'
                      } ${
                        isActive
                          ? 'bg-[#1E293B] text-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#6366F1]'
                          : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#CBD5E1]'
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      <span className={`flex-1 transition-opacity ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
                    </Link>
                  );
                })}
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
                    <p className="text-[11px] text-[#64748B]">{organization?.name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 px-3 py-2 mb-2 lg:hidden">
                <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center text-white text-sm font-semibold border border-[#334155]">
                  {user?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#64748B]">{organization?.name}</p>
                </div>
              </div>
              <button onClick={handleLogout} className={`w-full flex items-center gap-3 py-2 text-[14px] font-medium text-[#EF4444] hover:bg-[#1E293B] rounded transition-colors ${
                sidebarCollapsed ? 'lg:justify-center lg:px-0' : 'justify-start px-3'
              }`} title={sidebarCollapsed ? 'Logout' : undefined}>
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
    </div>
  );
}
