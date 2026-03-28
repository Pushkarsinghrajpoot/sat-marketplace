'use client';

import { useSimpleAuth } from '@/lib/simple-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Package, 
  Mail, 
  BarChart, 
  Users, 
  Settings,
  Star,
  Wrench,
  PlusCircle,
  HelpCircle,
  Megaphone,
  LogOut
} from 'lucide-react';

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  Package,
  Mail,
  BarChart,
  Users,
  Settings,
  Star,
  Wrench,
  PlusCircle,
  HelpCircle,
  Megaphone,
  LogOut
};

export default function DynamicSidebar() {
  const { user, organization, accessibleRoutes, logout, isTeamMember, teamRole } = useSimpleAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* User/Organization Header */}
      <div className="p-6 border-b border-gray-200">
        {isTeamMember ? (
          // Team member - show their profile
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {teamRole}
              </span>
              {organization && (
                <span className="text-xs text-gray-500 truncate">
                  @ {organization.name}
                </span>
              )}
            </div>
          </div>
        ) : (
          // Owner - show organization
          <div>
            {organization?.logo ? (
              <img 
                src={organization.logo} 
                alt={organization.name}
                className="w-12 h-12 rounded-lg mb-3"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {organization?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {organization?.name || 'My Organization'}
            </h2>
            <p className="text-sm text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {accessibleRoutes.map((route) => {
            const Icon = route.icon ? iconMap[route.icon] : LayoutDashboard;
            const isActive = pathname === route.path;

            return (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span>{route.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
