'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Package, Phone, Mail, Building2, Clock, CheckCircle,
  AlertCircle, FileText, Inbox, User
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  NEW:       { label: 'Submitted',  bg: 'bg-blue-100',   text: 'text-blue-800',   icon: Clock },
  ASSIGNED:  { label: 'Assigned',   bg: 'bg-indigo-100', text: 'text-indigo-800', icon: User },
  CONTACTED: { label: 'Contacted',  bg: 'bg-amber-100',  text: 'text-amber-800',  icon: Phone },
  QUOTED:    { label: 'Quote Ready',bg: 'bg-purple-100', text: 'text-purple-800', icon: FileText },
  WON:       { label: 'Completed',  bg: 'bg-green-100',  text: 'text-green-800',  icon: CheckCircle },
  LOST:      { label: 'Closed',     bg: 'bg-red-100',    text: 'text-red-800',    icon: AlertCircle },
  CLOSED:    { label: 'Closed',     bg: 'bg-gray-100',   text: 'text-gray-600',   icon: AlertCircle },
};

export default function MyLeadsPage() {
  const { user } = useSimpleAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (user?.id) loadLeads();
  }, [user?.id]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch('/api/leads/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setLeads(json.leads || []);
      else toast.error('Failed to load your requests');
    } catch {
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'ALL' ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#09090B]">My Quote Requests</h1>
        <p className="text-[14px] text-[#71717A]">Track the status of your quote and inquiry submissions</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'NEW', 'ASSIGNED', 'CONTACTED', 'QUOTED', 'WON'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
              filter === s
                ? 'bg-[#6366F1] text-white border-[#6366F1]'
                : 'bg-white text-[#52525B] border-[#E4E4E7] hover:border-[#6366F1] hover:text-[#6366F1]'
            }`}>
            {s === 'ALL' ? 'All Requests' : (STATUS_CONFIG[s]?.label || s)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="h-12 w-12 text-[#D4D4D8] mx-auto mb-3" />
            <p className="font-semibold text-[#09090B] mb-1">No requests yet</p>
            <p className="text-[13px] text-[#71717A]">
              {filter !== 'ALL' ? 'No requests match this status.' : 'Browse products and click "Request Quote" to get started.'}
            </p>
            {filter === 'ALL' && (
              <a href="/categories"
                className="inline-block mt-4 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-[13px] font-semibold hover:bg-[#5254CC] transition-colors">
                Browse Products
              </a>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(lead => {
            const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
            const StatusIcon = cfg.icon;
            return (
              <Card key={lead.id} className="border-[#E4E4E7]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-[#09090B] text-[15px]">
                          {lead.product_name || 'General Inquiry'}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#A1A1AA]">
                        Reference: <span className="font-mono font-bold">{lead.id.slice(0, 8).toUpperCase()}</span>
                        <span className="mx-2">·</span>
                        {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Request details */}
                    <div className="space-y-2">
                      {lead.requirement && (
                        <div>
                          <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-0.5">Your Requirement</p>
                          <p className="text-[13px] text-[#52525B]">{lead.requirement}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 text-[12px] text-[#71717A]">
                        {lead.bulk_quantity > 1 && (
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" /> Qty: <strong>{lead.bulk_quantity}</strong>
                          </span>
                        )}
                        {lead.budget_range && (
                          <span className="flex items-center gap-1">
                            Budget: <strong>{lead.budget_range}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Assigned reseller */}
                    {lead.reseller ? (
                      <div className="bg-[#F8FAFF] rounded-xl p-3 border border-[#EEF2FF]">
                        <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-2">Your Assigned Reseller</p>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-bold text-sm flex-shrink-0">
                            {lead.reseller.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#09090B] text-[13px]">{lead.reseller.name}</p>
                            {lead.reseller_org && (
                              <p className="text-[12px] text-[#71717A] flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {lead.reseller_org.name}
                              </p>
                            )}
                            <div className="flex gap-3 mt-1">
                              <a href={`mailto:${lead.reseller.email}`}
                                className="text-[11px] text-[#6366F1] flex items-center gap-1 hover:underline">
                                <Mail className="h-3 w-3" /> {lead.reseller.email}
                              </a>
                              {lead.reseller.phone_number && (
                                <a href={`tel:${lead.reseller.phone_number}`}
                                  className="text-[11px] text-[#6366F1] flex items-center gap-1 hover:underline">
                                  <Phone className="h-3 w-3" /> {lead.reseller.phone_number}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#FFFBEB] rounded-xl p-3 border border-amber-100 flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <div>
                          <p className="text-[13px] font-semibold text-amber-900">Being assigned</p>
                          <p className="text-[12px] text-amber-700">A reseller will be assigned to you shortly.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reseller response notes */}
                  {lead.response_notes && (
                    <div className="mt-4 pt-4 border-t border-[#F4F4F5]">
                      <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-1">Reseller Notes</p>
                      <p className="text-[13px] text-[#52525B] bg-[#F8F9FF] rounded-lg p-3 border border-[#EEF2FF]">{lead.response_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
