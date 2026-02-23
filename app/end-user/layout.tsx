'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Eye, LogOut } from 'lucide-react';

export default function EndUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, organization, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'END_USER') {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!mounted || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <Link href="/end-user/dashboard">
            <h1 className="text-xl font-bold text-gray-900">B2B Marketplace</h1>
          </Link>
          {organization && (
            <p className="text-xs text-gray-600 mt-1">{organization.name}</p>
          )}
        </div>

        <div className="p-4">
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold text-blue-900">View-Only Access</p>
            </div>
            <p className="text-xs text-blue-800">Read-only permissions</p>
          </div>

          <nav className="space-y-1">
            <Link
              href="/end-user/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Eye className="h-5 w-5" />
              <span className="flex-1">Dashboard</span>
            </Link>
          </nav>
        </div>

        <div className="border-t border-gray-200 p-4 absolute bottom-0 w-64 bg-white">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">End User (View Only)</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
