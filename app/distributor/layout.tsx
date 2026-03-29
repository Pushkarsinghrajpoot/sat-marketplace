'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, FileText, MessageCircle, BarChart3, Settings, LogOut, Bell, Menu, X, Users, HelpCircle, Target, Handshake, DollarSign, Star, Megaphone, Briefcase, UserCog, ChevronLeft, ChevronRight, ChevronDown, UserCircle, Building2 } from 'lucide-react';
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1E293B] rounded-full flex items-center justify-center text-white text-sm font-semibold border border-[#334155]">
                  {user?.name.charAt(0)}
                </div>
                <div className={`flex-1 min-w-0 transition-opacity ${sidebarCollapsed ? 'lg:opacity-0 lg:hidden' : ''}`}>
                  <p className="text-[14px] font-medium text-white truncate">{user?.name}</p>
                  <p className="text-[12px] text-[#64748B] uppercase">Admin</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#94A3B8]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-6">
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
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-9 h-9 bg-[#6366F1] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-[14px] font-medium text-[#09090B]">{user?.name}</p>
                    <p className="text-[12px] text-[#71717A]">{organization?.name || 'Organization'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                        {organization && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <p className="text-xs font-medium text-gray-700">{organization.name}</p>
                          </div>
                        )}
                      </div>
                      <Link
                        href="/distributor/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <UserCircle className="h-4 w-4" />
                        <span>Profile & Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
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
