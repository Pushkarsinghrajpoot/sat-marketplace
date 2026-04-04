'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Bell, CheckCheck, Package, ShoppingBag, Inbox } from 'lucide-react';

const TYPE_ICON: Record<string, any> = {
  ORDER_UPDATE:  ShoppingBag,
  ORDER_PLACED:  ShoppingBag,
  NEW_ORDER:     Package,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.notifications || []);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const token = await getToken();
    if (token) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const token = await getToken();
    if (token) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
    }
  };

  const handleClick = async (n: any) => {
    await markRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(v => !v); if (!open) load(); }}
        className="relative w-9 h-9 flex items-center justify-center border border-[#E4E4E7] rounded-md hover:bg-[#F4F4F5] transition-colors"
      >
        <Bell className="h-[18px] w-[18px] text-[#71717A]" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[360px] bg-white rounded-xl shadow-xl border border-[#E4E4E7] z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F4F4F5]">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-bold text-[#09090B]">Notifications</p>
              {unread > 0 && (
                <span className="bg-[#EEF2FF] text-[#6366F1] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] text-[#6366F1] font-semibold hover:text-[#5254CC] transition-colors">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Inbox className="h-8 w-8 text-[#D4D4D8] mx-auto mb-2" />
                <p className="text-[13px] text-[#71717A]">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = TYPE_ICON[n.notification_type] || Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex gap-3 px-4 py-3.5 border-b border-[#F9F9F9] hover:bg-[#F8F9FF] transition-colors ${!n.read ? 'bg-[#FAFBFF]' : 'bg-white'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.read ? 'bg-[#EEF2FF] text-[#6366F1]' : 'bg-[#F4F4F5] text-[#A1A1AA]'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[13px] leading-tight ${!n.read ? 'font-semibold text-[#09090B]' : 'font-medium text-[#52525B]'}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-2 h-2 bg-[#6366F1] rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-[12px] text-[#71717A] mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
