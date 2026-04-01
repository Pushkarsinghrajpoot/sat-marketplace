'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Search, Users, Mail, Phone, Building2, Package,
  FileText, Clock, CheckCircle, TrendingUp, Inbox
} from 'lucide-react';

interface CustomerSummary {
  email: string;
  name: string;
  company: string;
  phone: string;
  leadCount: number;
  dealCount: number;
  lastActivity: string;
  latestStatus: string;
  leads: any[];
  deals: any[];
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  ASSIGNED: 'bg-indigo-100 text-indigo-800',
  CONTACTED: 'bg-amber-100 text-amber-800',
  QUOTED: 'bg-purple-100 text-purple-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
  CLOSED: 'bg-gray-100 text-gray-600',
};

export default function CustomersPage() {
  const { user } = useSimpleAuth();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) loadCustomers();
  }, [user?.id]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      // Fetch leads assigned to this reseller
      const [leadsRes, dealsRes] = await Promise.all([
        fetch('/api/leads', { headers: { Authorization: `Bearer ${token}` } }),
        supabase
          .from('deals')
          .select('id, customer_email, customer_name, customer_company, customer_contact, status, deal_type, estimated_value, created_at, opportunity_name')
          .eq('reseller_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);

      const leadsJson = await leadsRes.json();
      const leads: any[] = leadsRes.ok ? leadsJson.leads || [] : [];
      const deals: any[] = dealsRes.data || [];

      // Aggregate by email
      const map: Record<string, CustomerSummary> = {};

      leads.forEach(lead => {
        const email = lead.buyer_email?.toLowerCase();
        if (!email) return;
        if (!map[email]) {
          map[email] = {
            email,
            name: lead.buyer_name || '',
            company: lead.buyer_company || '',
            phone: lead.buyer_phone || '',
            leadCount: 0,
            dealCount: 0,
            lastActivity: lead.created_at,
            latestStatus: lead.status,
            leads: [],
            deals: [],
          };
        }
        map[email].leadCount++;
        map[email].leads.push(lead);
        if (lead.created_at > map[email].lastActivity) {
          map[email].lastActivity = lead.created_at;
          map[email].latestStatus = lead.status;
        }
      });

      deals.forEach(deal => {
        const email = deal.customer_email?.toLowerCase();
        if (!email) return;
        if (!map[email]) {
          map[email] = {
            email,
            name: deal.customer_name || '',
            company: deal.customer_company || '',
            phone: deal.customer_contact || '',
            leadCount: 0,
            dealCount: 0,
            lastActivity: deal.created_at,
            latestStatus: deal.status,
            leads: [],
            deals: [],
          };
        }
        map[email].dealCount++;
        map[email].deals.push(deal);
        if (!map[email].name && deal.customer_name) map[email].name = deal.customer_name;
        if (!map[email].company && deal.customer_company) map[email].company = deal.customer_company;
        if (deal.created_at > map[email].lastActivity) {
          map[email].lastActivity = deal.created_at;
        }
      });

      const sorted = Object.values(map).sort(
        (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
      setCustomers(sorted);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => {
    const s = search.toLowerCase();
    return !s || c.name?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.company?.toLowerCase().includes(s);
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#09090B]">Customers</h1>
        <p className="text-[14px] text-[#71717A]">All buyers who submitted quote requests or are linked to your deals</p>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Customers', value: customers.length, icon: Users, color: 'bg-[#EEF2FF] text-[#6366F1]' },
            { label: 'Active Leads', value: customers.reduce((s, c) => s + c.leadCount, 0), icon: FileText, color: 'bg-amber-50 text-amber-600' },
            { label: 'Deals Registered', value: customers.reduce((s, c) => s + c.dealCount, 0), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-[#E4E4E7]">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[26px] font-bold text-[#09090B] leading-none">{value}</p>
                  <p className="text-[12px] text-[#71717A] mt-1">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or company…"
          className="w-full pl-9 pr-4 h-10 border border-[#E4E4E7] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="h-12 w-12 text-[#D4D4D8] mx-auto mb-3" />
            <p className="font-semibold text-[#09090B] mb-1">No customers yet</p>
            <p className="text-[13px] text-[#71717A]">
              {search ? 'No customers match your search.' : 'Customers from quote requests and registered deals will appear here.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(customer => {
            const isOpen = expanded === customer.email;
            const statusClass = STATUS_COLORS[customer.latestStatus] || STATUS_COLORS.NEW;
            return (
              <Card key={customer.email} className="border-[#E4E4E7]">
                <CardContent className="p-5">
                  {/* Customer row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-bold text-sm flex-shrink-0">
                        {customer.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-semibold text-[#09090B] text-[15px]">{customer.name || 'Unknown'}</span>
                          {customer.latestStatus && (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusClass}`}>
                              {customer.latestStatus}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center flex-wrap gap-3 text-[12px] text-[#71717A]">
                          <a href={`mailto:${customer.email}`} className="flex items-center gap-1 hover:text-[#6366F1] transition-colors">
                            <Mail className="h-3 w-3" /> {customer.email}
                          </a>
                          {customer.phone && (
                            <a href={`tel:${customer.phone}`} className="flex items-center gap-1 hover:text-[#6366F1] transition-colors">
                              <Phone className="h-3 w-3" /> {customer.phone}
                            </a>
                          )}
                          {customer.company && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {customer.company}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-[11px] text-[#A1A1AA]">
                          {customer.leadCount > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" /> {customer.leadCount} quote request{customer.leadCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {customer.dealCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" /> {customer.dealCount} deal{customer.dealCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last activity: {new Date(customer.lastActivity).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setExpanded(isOpen ? null : customer.email)}
                      className="text-[13px] font-semibold text-[#6366F1] hover:text-[#5254CC] transition-colors flex-shrink-0 px-3 py-1.5 border border-[#E4E4E7] rounded-lg hover:bg-[#F8F9FF]">
                      {isOpen ? 'Hide' : 'View History'}
                    </button>
                  </div>

                  {/* Expanded history */}
                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-[#F4F4F5] space-y-4">
                      {/* Leads */}
                      {customer.leads.length > 0 && (
                        <div>
                          <p className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-2">Quote Requests</p>
                          <div className="space-y-2">
                            {customer.leads.map((lead: any) => (
                              <div key={lead.id} className="flex items-center justify-between p-3 bg-[#F8F9FF] rounded-lg border border-[#EEF2FF] text-[13px]">
                                <div>
                                  <p className="font-medium text-[#09090B]">{lead.product_name || 'General Inquiry'}</p>
                                  {lead.requirement && <p className="text-[12px] text-[#71717A] truncate max-w-xs">{lead.requirement}</p>}
                                </div>
                                <div className="flex items-center gap-3 text-right ml-4 flex-shrink-0">
                                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status] || ''}`}>{lead.status}</span>
                                  <span className="text-[11px] text-[#A1A1AA]">{new Date(lead.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deals */}
                      {customer.deals.length > 0 && (
                        <div>
                          <p className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-2">Registered Deals</p>
                          <div className="space-y-2">
                            {customer.deals.map((deal: any) => (
                              <div key={deal.id} className="flex items-center justify-between p-3 bg-[#F8FFF8] rounded-lg border border-green-100 text-[13px]">
                                <div>
                                  <p className="font-medium text-[#09090B]">{deal.opportunity_name || 'Deal'}</p>
                                  <p className="text-[12px] text-[#71717A]">{deal.deal_type}</p>
                                </div>
                                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                  <span className="text-[12px] font-bold text-[#09090B]">
                                    {deal.estimated_value ? `$${Number(deal.estimated_value).toLocaleString()}` : '—'}
                                  </span>
                                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[deal.status] || 'bg-gray-100 text-gray-600'}`}>{deal.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
