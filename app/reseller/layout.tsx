'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Upload, Briefcase, BarChart3, Settings, LogOut, Bell, Menu, X, MessageCircle, FileText, HelpCircle, ChevronLeft, ChevronRight, CreditCard, Users, Star, Package, Wrench, UserCog, ChevronDown, UserCircle, Building2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/lib/simple-auth';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { NotificationBell } from '@/components/notifications/notification-bell';

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Upload,
  BarChart3,
  Settings,
  MessageCircle,
  FileText,
  HelpCircle,
  CreditCard,
  Users,
  Star,
  Package,
  Wrench,
  UserCog,
};

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
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
    if (!user || organization?.type !== 'RESELLER') {
      router.push('/auth/login');
    }
  }, [user, organization, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <div className="flex h-screen overflow-hidden">
        {/* ===== PREMIUM SIDEBAR ===== */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 bg-[#0F172A] transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[240px]'
        } w-[240px] flex flex-col`}>
          
          {/* Sidebar Header / Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E293B] flex-shrink-0">
            <div className={`flex items-center gap-2.5 overflow-hidden ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}>
                <Zap className="text-white" size={16} />
              </div>
              <div className={`transition-opacity duration-200 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                <span className="text-[15px] font-extrabold text-white tracking-tight">NexTrade</span>
                <span className="text-[15px] font-extrabold tracking-tight" style={{ color: '#818CF8' }}> Pro</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#94A3B8] hover:text-white transition-colors p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className={`px-4 py-4 border-b border-[#1E293B] flex-shrink-0 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className={`min-w-0 flex-1 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide" style={{ color: '#FBBF24', background: 'rgba(251,191,36,0.15)' }}>
                    {isTeamMember ? teamRole : 'RESELLER'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={`relative flex items-center rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                      sidebarCollapsed ? 'lg:justify-center lg:px-0 lg:h-10 h-10 px-3 gap-3' : 'gap-3 px-3 h-10'
                    } ${
                      isActive
                        ? 'bg-[#1E293B] text-white'
                        : 'text-[#94A3B8] hover:bg-[rgba(30,41,59,0.7)] hover:text-[#CBD5E1]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full" style={{ background: '#F59E0B' }} />
                    )}
                    <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                    <span className={`truncate ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-[#1E293B] p-3 flex-shrink-0">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center rounded-lg text-[13.5px] font-medium text-[#94A3B8] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444] transition-all duration-150 ${
                sidebarCollapsed ? 'lg:justify-center lg:px-0 h-10 px-3 gap-3' : 'gap-3 px-3 h-10'
              }`}
              title={sidebarCollapsed ? 'Logout' : undefined}
            >
              <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
              <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Logout</span>
            </button>
          </div>
        </aside>

        {/* ===== MAIN CONTENT AREA ===== */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Top Bar */}
          <header className="h-[60px] bg-white border-b border-[rgba(199,198,205,0.3)] flex items-center justify-between px-6 gap-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-[#F2F3FF] text-[#76767D] transition-colors">
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex items-center justify-center w-8 h-8 border border-[rgba(199,198,205,0.4)] rounded-lg hover:bg-[#F2F3FF] transition-colors text-[#76767D]"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <NotificationBell />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-[#F2F3FF] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-[13px] font-semibold text-[#161B2B] leading-none">{user?.name.split(' ')[0]}</p>
                    <p className="text-[11px] text-[#76767D] mt-0.5">{organization?.name || 'Organization'}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-[#76767D]" />
                </button>

                {showUserDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 w-[240px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(22,27,43,0.15)] border border-[rgba(199,198,205,0.3)] overflow-hidden z-20">
                      <div className="p-4 border-b border-[rgba(199,198,205,0.2)]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                            {user?.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[#161B2B]">{user?.name}</p>
                            <p className="text-[11px] text-[#76767D]">{user?.email}</p>
                            {organization && <p className="text-[11px] font-semibold mt-0.5" style={{ color: '#F59E0B' }}>{organization.name}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/reseller/settings"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-[#161B2B] hover:bg-[#F2F3FF] rounded-xl transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <UserCircle className="h-4 w-4 text-[#F59E0B]" />
                          Profile & Settings
                        </Link>
                        <button
                          onClick={() => { setShowUserDropdown(false); handleLogout(); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#F8FAFF]">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
