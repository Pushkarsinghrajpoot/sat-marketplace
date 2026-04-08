'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package, User, Calendar, Search, CheckCircle,
  MessageCircle, Users, Phone, Building2, DollarSign,
  ChevronDown, Inbox, Mail
} from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

const LEAD_STATUSES = ['NEW', 'ASSIGNED', 'CONTACTED', 'QUOTED', 'WON', 'LOST', 'CLOSED'];

const leadStatusStyle: Record<string, { bg: string; text: string }> = {
  NEW:       { bg: 'bg-blue-100',   text: 'text-blue-800' },
  ASSIGNED:  { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  CONTACTED: { bg: 'bg-amber-100',  text: 'text-amber-800' },
  QUOTED:    { bg: 'bg-purple-100', text: 'text-purple-800' },
  WON:       { bg: 'bg-green-100',  text: 'text-green-800' },
  LOST:      { bg: 'bg-red-100',    text: 'text-red-800' },
  CLOSED:    { bg: 'bg-gray-100',   text: 'text-gray-600' },
};

export default function InquiriesPage() {
  const { user } = useSimpleAuth();
  const [activeTab, setActiveTab] = useState<'leads' | 'inquiries'>('leads');

  // ── Customer Leads state ──────────────────────────────────
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsSearch, setLeadsSearch] = useState('');
  const [leadsStatus, setLeadsStatus] = useState('ALL');
  const [updatingLead, setUpdatingLead] = useState<string | null>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [responseNote, setResponseNote] = useState('');

  // ── Product Inquiries state ───────────────────────────────
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => { loadLeads(); }, [user?.id]);

  // ── Load Customer Leads via API (uses supabaseAdmin server-side) ─
  const loadLeads = async () => {
    if (!user?.id) return;
    setLeadsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      console.log('Loading leads for user:', user.id, user.name);
      const res = await fetch('/api/leads', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      console.log('Leads API response:', json);
      if (res.ok) {
        setLeads(json.leads || []);
        console.log('Loaded leads count:', json.leads?.length || 0);
      } else {
        console.error('Failed to load leads:', json.error);
        toast.error('Failed to load leads: ' + json.error);
      }
    } catch (err) {
      console.error('Load leads error:', err);
      toast.error('Failed to load leads');
    } finally {
      setLeadsLoading(false);
    }
  };

  // ── Load Product Inquiries (existing) ────────────────────
  const loadInquiries = async () => {
    if (!user?.organizationId) return;
    setInquiriesLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_inquiries')
        .select(`
          *, 
          products!inner (*), 
          user:users!product_inquiries_user_id_fkey (id, name, email, avatar)
        `)
        .eq('products.organization_id', user.organizationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      toast.error('Failed to load inquiries');
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleTabChange = (tab: 'leads' | 'inquiries') => {
    setActiveTab(tab);
    if (tab === 'inquiries') loadInquiries();
  };

  // ── Update lead status ───────────────────────────────────
  const updateLeadStatus = async (leadId: string, status: string, notes?: string) => {
    setUpdatingLead(leadId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, response_notes: notes }),
      });
      const json = await res.json();
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...json.lead } : l));
        setExpandedLead(null);
        setResponseNote('');
        toast.success('Lead updated');
      } else {
        toast.error('Failed to update: ' + json.error);
      }
    } catch {
      toast.error('Failed to update lead');
    } finally {
      setUpdatingLead(null);
    }
  };

  const filteredLeads = leads.filter(l => {
    const s = leadsSearch.toLowerCase();
    const matchSearch = !s || l.buyer_name?.toLowerCase().includes(s) ||
      l.buyer_email?.toLowerCase().includes(s) || l.buyer_company?.toLowerCase().includes(s) ||
      l.product_name?.toLowerCase().includes(s);
    const matchStatus = leadsStatus === 'ALL' || l.status === leadsStatus;
    return matchSearch && matchStatus;
  });

  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch = !searchTerm ||
      i.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === 'ALL' || i.status === statusFilter);
  });

  const newLeadsCount = leads.filter(l => l.status === 'NEW' || l.status === 'ASSIGNED').length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#09090B]">Inquiries</h1>
        <p className="text-[14px] text-[#71717A]">Manage customer leads and product inquiries</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E4E4E7] mb-6">
        <button onClick={() => handleTabChange('leads')}
          className={`px-4 py-3 text-[14px] font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'leads' ? 'text-[#09090B] border-b-2 border-[#6366F1]' : 'text-[#71717A] hover:text-[#09090B]'
          }`}>
          <Users className="h-4 w-4" />
          Customer Leads
          {newLeadsCount > 0 && (
            <span className="bg-[#6366F1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newLeadsCount}</span>
          )}
        </button>
        <button onClick={() => handleTabChange('inquiries')}
          className={`px-4 py-3 text-[14px] font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'inquiries' ? 'text-[#09090B] border-b-2 border-[#6366F1]' : 'text-[#71717A] hover:text-[#09090B]'
          }`}>
          <MessageCircle className="h-4 w-4" />
          Product Inquiries
        </button>
      </div>

      {/* ── CUSTOMER LEADS TAB ── */}
      {activeTab === 'leads' && (
        <>
          {/* Filters */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
              <input value={leadsSearch} onChange={e => setLeadsSearch(e.target.value)}
                placeholder="Search by name, email, company…"
                className="w-full pl-9 pr-4 h-10 border border-[#E4E4E7] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]" />
            </div>
            <select value={leadsStatus} onChange={e => setLeadsStatus(e.target.value)}
              className="h-10 px-3 border border-[#E4E4E7] rounded-lg text-[13px] bg-white outline-none focus:ring-2 focus:ring-[#6366F1]/20">
              <option value="ALL">All Status</option>
              {LEAD_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
            </select>
          </div>

          {leadsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Inbox className="h-12 w-12 text-[#D4D4D8] mx-auto mb-3" />
                <p className="font-semibold text-[#09090B] mb-1">No leads yet</p>
                <p className="text-[13px] text-[#71717A]">
                  {leadsSearch || leadsStatus !== 'ALL' ? 'No leads match your filters' : 'Quote requests from buyers will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map(lead => {
                const style = leadStatusStyle[lead.status] || leadStatusStyle.NEW;
                const isExpanded = expandedLead === lead.id;
                return (
                  <Card key={lead.id} className="border-[#E4E4E7]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-bold text-sm flex-shrink-0">
                            {lead.buyer_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold text-[#09090B] text-[15px]">{lead.buyer_name}</span>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                                {lead.status}
                              </span>
                              {lead.inquiry_type && lead.inquiry_type !== 'QUOTE_REQUEST' && (
                                <span className="text-[11px] bg-[#F4F4F5] text-[#71717A] px-2 py-0.5 rounded-full">{lead.inquiry_type}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-[12px] text-[#71717A] flex-wrap">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.buyer_email}</span>
                              {lead.buyer_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.buyer_phone}</span>}
                              {lead.buyer_company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{lead.buyer_company}</span>}
                            </div>
                            {lead.product_name && (
                              <p className="mt-1 text-[12px] text-[#71717A] flex items-center gap-1">
                                <Package className="h-3 w-3" /> {lead.product_name}
                                {lead.bulk_quantity > 1 && <span className="font-medium text-[#09090B]"> × {lead.bulk_quantity}</span>}
                              </p>
                            )}
                            {lead.requirement && (
                              <p className="mt-1.5 text-[13px] text-[#52525B] line-clamp-2">{lead.requirement}</p>
                            )}
                            {lead.budget_range && (
                              <p className="mt-1 text-[12px] text-[#71717A] flex items-center gap-1">
                                <DollarSign className="h-3 w-3" /> Budget: {lead.budget_range}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] text-[#A1A1AA]">{new Date(lead.created_at).toLocaleDateString()}</span>
                          <button onClick={() => { setExpandedLead(isExpanded ? null : lead.id); setResponseNote(lead.response_notes || ''); }}
                            className="text-[#71717A] hover:text-[#09090B] transition-colors p-1">
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded: status update + notes */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#F4F4F5] space-y-3">
                          <div>
                            <label className="text-[12px] font-semibold text-[#09090B] mb-1.5 block">Update Status</label>
                            <div className="flex flex-wrap gap-2">
                              {LEAD_STATUSES.map(s => (
                                <button key={s} disabled={updatingLead === lead.id || lead.status === s}
                                  onClick={() => updateLeadStatus(lead.id, s, responseNote)}
                                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                                    lead.status === s
                                      ? 'bg-[#6366F1] text-white border-[#6366F1]'
                                      : 'bg-white text-[#52525B] border-[#E4E4E7] hover:border-[#6366F1] hover:text-[#6366F1]'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}>
                                  {s.charAt(0) + s.slice(1).toLowerCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[12px] font-semibold text-[#09090B] mb-1.5 block">Internal Notes</label>
                            <textarea value={responseNote} onChange={e => setResponseNote(e.target.value)} rows={2}
                              placeholder="Add notes about this lead…"
                              className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[13px] resize-none outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => updateLeadStatus(lead.id, lead.status, responseNote)}
                              disabled={updatingLead === lead.id}
                              className="px-4 py-2 bg-[#6366F1] text-white rounded-lg text-[13px] font-semibold hover:bg-[#5254CC] transition-colors disabled:opacity-50">
                              {updatingLead === lead.id ? 'Saving…' : 'Save Notes'}
                            </button>
                            <button onClick={() => setExpandedLead(null)}
                              className="px-4 py-2 border border-[#E4E4E7] text-[#52525B] rounded-lg text-[13px] font-semibold hover:bg-[#F4F4F5] transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── PRODUCT INQUIRIES TAB (existing, untouched logic) ── */}
      {activeTab === 'inquiries' && (
        <>
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search inquiries…"
                className="w-full pl-9 pr-4 h-10 border border-[#E4E4E7] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-10 px-3 border border-[#E4E4E7] rounded-lg text-[13px] bg-white outline-none">
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="RESPONDED">Responded</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {inquiriesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredInquiries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-[#D4D4D8] mx-auto mb-3" />
                <p className="font-semibold text-[#09090B] mb-1">No inquiries found</p>
                <p className="text-[13px] text-[#71717A]">
                  {searchTerm || statusFilter !== 'ALL' ? 'No inquiries match your filters' : 'No product inquiries yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredInquiries.map(inquiry => (
                <Card key={inquiry.id} className="hover:shadow-sm transition-shadow border-[#E4E4E7]">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[15px] text-[#09090B]">{inquiry.subject}</h3>
                          {inquiry.status === 'OPEN' && <span className="text-[11px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full">Open</span>}
                          {inquiry.status === 'RESPONDED' && <span className="text-[11px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">Responded</span>}
                          {inquiry.status === 'CLOSED' && <span className="text-[11px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full">Closed</span>}
                        </div>
                        <p className="text-[13px] text-[#71717A] line-clamp-2">{inquiry.question}</p>
                      </div>
                      <Link href={`/reseller/inquiries/${inquiry.id}`}>
                        <Button variant="outline" size="sm" className="ml-4 text-[13px]">View</Button>
                      </Link>
                    </div>
                    <div className="flex items-center gap-5 text-[12px] text-[#A1A1AA]">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{inquiry.user?.name || 'Unknown'}</span>
                      {inquiry.products && <span className="flex items-center gap-1"><Package className="h-3 w-3" />{inquiry.products.name}</span>}
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(inquiry.created_at).toLocaleDateString()}</span>
                      {inquiry.responded_at && <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" />Responded</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
