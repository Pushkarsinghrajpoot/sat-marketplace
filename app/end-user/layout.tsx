'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSimpleAuth } from '@/lib/simple-auth';
import { Button } from '@/components/ui/button';
import { Eye, LogOut } from 'lucide-react';

export default function EndUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, organization, logout } = useSimpleAuth();
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
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <aside className="w-[240px] bg-[#0F172A] fixed h-full overflow-y-auto">
        <div className="px-5 py-5 border-b border-[#1E293B]">
          <Link href="/end-user/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="text-sm font-bold text-[#0F172A]">B2B</span>
            </div>
            <span className="font-semibold text-white">Marketplace</span>
          </Link>
          {organization && (
            <p className="text-[12px] text-[#64748B] mt-2">{organization.name}</p>
          )}
        </div>

        <div className="p-4">
          <div className="mb-6 p-3 bg-[#1E293B] border border-[#334155] rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-[#6366F1]" />
              <p className="text-[12px] font-medium text-white">View-Only Access</p>
            </div>
            <p className="text-[11px] text-[#94A3B8]">Read-only permissions</p>
          </div>

          <nav className="space-y-1">
            <Link
              href="/end-user/dashboard"
              className="flex items-center gap-3 h-10 px-3 text-[14px] font-medium text-white bg-[#1E293B] relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#6366F1]"
            >
              <Eye className="h-[18px] w-[18px]" />
              <span className="flex-1">Dashboard</span>
            </Link>
          </nav>
        </div>

        <div className="border-t border-[#1E293B] p-4 absolute bottom-0 w-[240px] bg-[#0F172A]">
          <div className="mb-3 px-3 py-2">
            <p className="text-[13px] font-medium text-white truncate">{user.name}</p>
            <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
            <p className="text-[11px] text-[#64748B] mt-1">End User (View Only)</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-start gap-3 px-3 py-2 text-[14px] font-medium text-[#EF4444] hover:bg-[#1E293B] rounded transition-colors">
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-[240px] bg-[#FAFAFA]">
        {children}
      </main>
    </div>
  );
}
