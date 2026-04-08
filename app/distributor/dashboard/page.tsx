'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package, ShoppingCart, DollarSign, Users, ArrowRight, Plus, Lock,
  Search, Send, TrendingUp, Clock, CheckCircle, FileSpreadsheet,
  ChevronRight, BarChart3, Zap, Trophy, Upload, Target, Download, Home
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getDeals, getDirectQueries, getQuotes, getBOQs } from '@/lib/data-helpers';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, React.CSSProperties> = {
    SUBMITTED: { backgroundColor: 'rgba(70,72,212,0.1)', color: '#4648D4' },
    WON: { backgroundColor: 'rgba(16,185,129,0.1)', color: '#059669' },
    LOST: { backgroundColor: 'rgba(239,68,68,0.1)', color: '#DC2626' },
    PENDING: { backgroundColor: 'rgba(245,158,11,0.1)', color: '#D97706' },
    OPEN: { backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563EB' },
    BIDDING: { backgroundColor: 'rgba(245,158,11,0.1)', color: '#D97706' },
  };
  const c = map[status] || { backgroundColor: 'rgba(118,118,125,0.1)', color: '#76767D' };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold" style={c}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function DistributorDashboard() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'registrations' | 'bidding' | 'queries' | 'quotes' | null;
  const [activeTab, setActiveTab] = useState<'registrations' | 'bidding' | 'queries' | 'quotes'>(
    tabParam && ['registrations', 'bidding', 'queries', 'quotes'].includes(tabParam) ? tabParam : 'registrations'
  );
  const [stats, setStats] = useState({ totalProducts: 0, activeQuotes: 0, monthlyRevenue: 0, activeCustomers: 0, dealRegistrations: 0, biddingDeals: 0, directQueries: 0, boqs: 0 });
  const [dealRegistrations, setDealRegistrations] = useState<any[]>([]);
  const [biddingDeals, setBiddingDeals] = useState<any[]>([]);
  const [directQueries, setDirectQueries] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [boqs, setBoqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSimpleAuth();

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const [deals, queries, quotesData, boqData] = await Promise.all([
          getDeals({ userRole: 'DISTRIBUTOR', distributorId: user.organizationId }),
          getDirectQueries({ userRole: 'DISTRIBUTOR', distributorId: user.organizationId }),
          getQuotes({ distributorId: user.organizationId }),
          getBOQs({ distributorId: user.organizationId }),
        ]);
        const registrations = deals.filter((d: any) => d.dealType === 'DEAL_REGISTRATION');
        const bidding = deals.filter((d: any) => d.dealType === 'BIDDING');
        const activeQuotes = quotesData.filter((q: any) => q.status === 'SUBMITTED' || q.status === 'PENDING');
        const monthlyRevenue = quotesData.filter((q: any) => q.status === 'WON').reduce((sum: number, q: any) => sum + (q.total || 0), 0);
        const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('organization_id', user.organizationId).in('status', ['ACTIVE', 'DRAFT']);
        setStats({ totalProducts: productCount || 0, activeQuotes: activeQuotes.length, monthlyRevenue, activeCustomers: new Set(deals.map((d: any) => d.resellerId)).size, dealRegistrations: registrations.length, biddingDeals: bidding.length, directQueries: queries.length, boqs: boqData.length });
        setDealRegistrations(registrations);
        setBiddingDeals(bidding);
        setDirectQueries(queries);
        setQuotes(quotesData);
        setBoqs(boqData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const tabs = [
    { key: 'registrations', label: 'Deal Registrations', icon: Lock, count: stats.dealRegistrations },
    { key: 'bidding', label: 'Bidding Deals', icon: Search, count: stats.biddingDeals },
    { key: 'queries', label: 'Direct Queries', icon: Send, count: stats.directQueries },
    { key: 'quotes', label: 'Quotes & BOQs', icon: ShoppingCart, count: stats.activeQuotes + stats.boqs },
  ];

  return (
    <div className="flex-1 p-8 max-w-[1440px] mx-auto w-full min-h-screen">
      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-64 rounded-xl skeleton" />
              <div className="h-4 w-48 rounded-xl skeleton" />
            </div>
          ) : (
             <>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#161B2B] dark:text-white mb-1">
                {greeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
              </h2>
              <p className="text-[#46464C] dark:text-slate-400">Here's what's happening with your business today.</p>
             </>
          )}
        </div>
        <div className="flex gap-3">
          <Link href="/">
             <button className="px-5 py-2.5 bg-white border border-[#c7c6cd]/30 text-[#161B2B] text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2">
               <Home className="w-[18px] h-[18px]" />
               Homepage
             </button>
          </Link>
          <Link href="/distributor/analytics">
             <button className="px-5 py-2.5 bg-white border border-[#c7c6cd]/30 text-[#161B2B] text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2">
               <Download className="w-[18px] h-[18px]" />
               Export Report
             </button>
          </Link>
          <Link href="/distributor/products/new">
             <button className="px-6 py-2.5 bg-gradient-to-r from-[#4648d4] to-[#6063ee] text-white text-sm font-bold rounded-full shadow-lg shadow-[#4648d4]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
               <Plus className="w-[18px] h-[18px]" />
               Add Product
             </button>
          </Link>
        </div>
      </div>

      {/* ROW 1: KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI 1 */}
        <Link href="/distributor/products">
           <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300 group cursor-pointer">
             <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                 <Package className="w-7 h-7" />
               </div>
               <div className="flex items-center text-emerald-600 text-[13px] font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                 <TrendingUp className="w-4 h-4 mr-1" /> Active
               </div>
             </div>
             <p className="text-[#46464c] text-sm font-medium">Total Products</p>
             <h3 className="text-2xl font-extrabold text-[#161B2B] mt-1">{loading ? '-' : stats.totalProducts}</h3>
           </div>
        </Link>
        {/* KPI 2 */}
        <Link href="/distributor/campaigns">
           <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300 group cursor-pointer">
             <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                 <Zap className="w-7 h-7" />
               </div>
               <div className="flex items-center text-amber-600 text-[13px] font-bold bg-amber-50 px-2 py-1 rounded-lg">
                 Live
               </div>
             </div>
             <p className="text-[#46464c] text-sm font-medium">Active Campaigns</p>
             <h3 className="text-2xl font-extrabold text-[#161B2B] mt-1">12</h3>
           </div>
        </Link>
        {/* KPI 3 */}
        <Link href="/distributor/quotes">
           <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300 group cursor-pointer">
             <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                 <FileSpreadsheet className="w-7 h-7" />
               </div>
               {stats.boqs > 0 && <div className="flex items-center text-red-600 text-[13px] font-bold bg-red-50 border border-red-100 px-2 py-1 rounded-lg">{stats.boqs} Urgent</div>}
             </div>
             <p className="text-[#46464c] text-sm font-medium">Pending BOQs</p>
             <h3 className="text-2xl font-extrabold text-[#161B2B] mt-1">{loading ? '-' : stats.boqs}</h3>
           </div>
        </Link>
        {/* KPI 4 */}
        <Link href="/distributor/analytics">
           <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300 group cursor-pointer">
             <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <DollarSign className="w-7 h-7" />
               </div>
               <div className="flex items-center text-emerald-600 text-[13px] font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                 <TrendingUp className="w-4 h-4 mr-1" /> Won Revenue
               </div>
             </div>
             <p className="text-[#46464c] text-sm font-medium">Revenue This Month</p>
             <h3 className="text-2xl font-extrabold text-[#161B2B] mt-1">{loading ? '-' : formatCurrency(stats.monthlyRevenue)}</h3>
           </div>
        </Link>
      </div>

       {/* PIPELINE TABS (Re-styled as a large glass card) */}
       <div className="glass-card rounded-2xl overflow-hidden mb-8 shadow-sm">
         {/* Tab Header */}
         <div className="flex items-center justify-between px-6 pt-5 border-b border-[#dee1f7]/50 bg-white/40">
           <div className="flex gap-0 overflow-x-auto">
             {tabs.map((tab) => (
               <button
                 key={tab.key}
                 onClick={() => setActiveTab(tab.key as any)}
                 className={`flex items-center gap-2 px-5 py-4 text-[13px] font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                   activeTab === tab.key
                     ? 'border-[#4648D4] text-[#4648D4]'
                     : 'border-transparent text-[#76767D] hover:text-[#161B2B]'
                 }`}
               >
                 <tab.icon className="h-4 w-4" />
                 {tab.label}
                 <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                   activeTab === tab.key ? 'bg-[rgba(70,72,212,0.1)] text-[#4648D4]' : 'bg-[#F2F3FF] text-[#94A3B8]'
                 }`}>{tab.count}</span>
               </button>
             ))}
           </div>
           <button className="text-sm font-bold text-[#4648D4] hidden sm:block">View All Deals</button>
         </div>

         {/* Tab Content */}
         <div className="p-6 bg-white/40">
           {/* Deal Registrations */}
           {activeTab === 'registrations' && (
             loading ? <SkeletonList /> :
             dealRegistrations.length > 0 ? (
               <div className="space-y-4">
                 {dealRegistrations.map((deal: any) => (
                   <div key={deal.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#dee1f7] hover:border-[#4648d4]/40 hover:shadow-lg transition-all group">
                     <div className="w-1.5 h-12 rounded-full flex-shrink-0 bg-gradient-to-b from-[#4648D4] to-[#6063EE]" />
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                         <h4 className="text-[14px] font-bold text-[#161B2B] truncate">{deal.opportunityName}</h4>
                         {deal.isLocked && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4648D4]/10 text-[#4648D4]"><Lock className="h-2.5 w-2.5" /> Locked</span>}
                       </div>
                       <p className="text-[12px] text-[#76767D]">{deal.customerCompany || deal.customerName}</p>
                       <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#94A3B8] font-medium">
                         <span className="text-[#161B2B]">Value: {formatCurrency(deal.estimatedValue)}</span>
                         {deal.lockedAt && <span>• Locked: {new Date(deal.lockedAt).toLocaleDateString()}</span>}
                       </div>
                     </div>
                     <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Link href={`/distributor/deals/${deal.id}`}>
                         <button className="h-8 px-4 text-[12px] font-bold text-[#4648D4] rounded-lg border border-[#4648D4]/30 hover:bg-[#F2F3FF] transition-colors">View Details</button>
                       </Link>
                       <Link href="/distributor/activities">
                         <button className="h-8 px-4 text-[12px] font-bold text-white rounded-lg bg-gradient-to-r from-[#4648D4] to-[#6063EE] shadow-md hover:scale-105 transition-all">Acknowledge</button>
                       </Link>
                     </div>
                   </div>
                 ))}
               </div>
             ) : <EmptyState icon={Lock} title="No deal registrations yet" description="Resellers will register deals here for your review and quoting." />
           )}

           {/* Bidding Deals */}
           {activeTab === 'bidding' && (
             loading ? <SkeletonList /> :
             biddingDeals.length > 0 ? (
               <div className="space-y-4">
                 {biddingDeals.map((deal: any) => (
                   <div key={deal.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#dee1f7] hover:border-[#F59E0B]/40 hover:shadow-lg transition-all group">
                     <div className="w-1.5 h-12 rounded-full flex-shrink-0 bg-[#F59E0B]" />
                     <div className="flex-1 min-w-0">
                       <h4 className="text-[14px] font-bold text-[#161B2B] truncate mb-1">{deal.opportunityName}</h4>
                       <p className="text-[12px] text-[#76767D] mb-1.5">{deal.customerCompany}</p>
                       <div className="flex gap-2">
                         {deal.isLocked && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/10 text-[#059669]">Deal Registered</span>}
                         {deal.isVerified && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4648D4]/10 text-[#4648D4]">Verified</span>}
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${deal.score >= 100 ? 'bg-[#10B981]/10 text-[#059669]' : deal.score >= 50 ? 'bg-[#F59E0B]/10 text-[#D97706]' : 'bg-slate-100 text-[#76767D]'}`}>
                           {deal.score >= 100 ? 'High' : deal.score >= 50 ? 'Medium' : 'Low'} Effort
                         </span>
                       </div>
                     </div>
                     <div className="text-right flex-shrink-0 mr-4">
                       <p className="text-[15px] font-extrabold text-[#F59E0B]">{formatCurrency(deal.estimatedValue)}</p>
                       <p className="text-[11px] text-[#76767D] mt-0.5">{new Date(deal.createdAt).toLocaleDateString()}</p>
                     </div>
                     <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Link href={`/distributor/deals/${deal.id}`}>
                         <button className="h-8 px-4 text-[12px] font-bold text-[#4648D4] rounded-lg border border-[#4648D4]/30 hover:bg-[#F2F3FF] transition-colors">View Details</button>
                       </Link>
                       <Link href={`/distributor/quotes/create?dealId=${deal.id}`}>
                         <button className="h-8 px-4 text-[12px] font-bold text-white rounded-lg bg-gradient-to-r from-[#4648D4] to-[#6063EE] shadow-md hover:scale-105 transition-all">Submit Quote</button>
                       </Link>
                     </div>
                   </div>
                 ))}
               </div>
             ) : <EmptyState icon={Search} title="No bidding deals yet" description="Open bidding opportunities from resellers will appear here." />
           )}

           {/* Direct Queries */}
           {activeTab === 'queries' && (
             loading ? <SkeletonList /> :
             directQueries.length > 0 ? (
               <div className="space-y-4">
                 {directQueries.map((query: any) => (
                   <div key={query.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#dee1f7] hover:border-[#3B82F6]/40 hover:shadow-lg transition-all group">
                     <div className="w-1.5 h-12 rounded-full flex-shrink-0 bg-[#3B82F6]" />
                     <div className="flex-1 min-w-0">
                       <h4 className="text-[14px] font-bold text-[#161B2B] truncate mb-1">{query.title}</h4>
                       <p className="text-[12px] text-[#76767D] line-clamp-1 mb-1.5">{query.requirement}</p>
                       <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] font-medium">
                         <span className="flex items-center gap-1 text-[#F59E0B]"><Clock className="h-3 w-3" />{query.urgency}</span>
                         <span className="text-[#161B2B]">Budget: {query.estimated_budget ? formatCurrency(query.estimated_budget) : 'N/A'}</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Link href={`/distributor/queries/${query.id}`}>
                         <button className="h-8 px-4 text-[12px] font-bold text-[#4648D4] rounded-lg border border-[#4648D4]/30 hover:bg-[#F2F3FF] transition-colors">View Details</button>
                       </Link>
                       <Link href={`/distributor/queries/${query.id}/respond`}>
                         <button className="h-8 px-4 text-[12px] font-bold text-white rounded-lg bg-gradient-to-r from-[#4648D4] to-[#6063EE] shadow-md hover:scale-105 transition-all">Respond</button>
                       </Link>
                     </div>
                   </div>
                 ))}
               </div>
             ) : <EmptyState icon={Send} title="No direct queries yet" description="Direct queries from resellers will appear here for you to respond." />
           )}

           {/* Quotes & BOQs */}
           {activeTab === 'quotes' && (
             loading ? <SkeletonList /> : (
               <div className="space-y-4">
                 {boqs.length > 0 && (
                   <>
                     <p className="text-[12px] font-extrabold text-[#76767D] uppercase tracking-widest mb-3">BOQ Requests</p>
                     {boqs.map((boq: any) => (
                       <div key={boq.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#F59E0B]/30 hover:shadow-lg transition-all group">
                         <div className="w-1.5 h-12 rounded-full flex-shrink-0 bg-[#F59E0B]" />
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                             <h4 className="text-[14px] font-bold text-[#161B2B]">BOQ-{boq.id.slice(-8)}</h4>
                             <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/10 text-[#D97706]">BOQ Request</span>
                           </div>
                           <p className="text-[12px] text-[#76767D]">{boq.deal?.opportunityName} • {boq.reseller?.name}</p>
                           <p className="text-[11px] text-[#94A3B8] font-medium mt-1">{boq.fileName} • {boq.items?.length || 0} items</p>
                         </div>
                         <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => window.open(boq.fileUrl, '_blank')} className="h-8 px-4 text-[12px] font-bold text-[#4648D4] rounded-lg border border-[#4648D4]/30 hover:bg-[#F2F3FF] transition-colors">View BOQ</button>
                           <Link href={`/distributor/quotes/create?boqId=${boq.id}&dealId=${boq.dealId}`}>
                             <button className="h-8 px-4 text-[12px] font-bold text-white rounded-lg bg-gradient-to-r from-[#4648D4] to-[#6063EE] shadow-md hover:scale-105 transition-all">Create Quote</button>
                           </Link>
                         </div>
                       </div>
                     ))}
                   </>
                 )}
                 {quotes.length > 0 && (
                   <>
                     {boqs.length > 0 && <p className="text-[12px] font-extrabold text-[#76767D] uppercase tracking-widest mt-6 mb-3">Submitted Quotes</p>}
                     {quotes.map((quote: any) => (
                       <div key={quote.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#dee1f7] hover:shadow-lg transition-all group">
                         <div className={`w-1.5 h-12 rounded-full flex-shrink-0 ${quote.status === 'WON' ? 'bg-[#10B981]' : quote.status === 'LOST' ? 'bg-[#EF4444]' : 'bg-[#4648D4]'}`} />
                         <div className="flex-1 min-w-0">
                           <h4 className="text-[14px] font-bold text-[#161B2B] mb-1">Quote #{quote.id.substring(0, 8)}</h4>
                           <p className="text-[12px] text-[#76767D] font-medium">{new Date(quote.created_at).toLocaleDateString()}</p>
                         </div>
                         <p className="text-[15px] font-extrabold text-[#161B2B] mr-4">{formatCurrency(quote.total || 0)}</p>
                         <StatusBadge status={quote.status} />
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <Link href={`/distributor/quotes/${quote.id}`}>
                              <button className="h-8 px-4 text-[12px] font-bold text-[#4648D4] rounded-lg border border-[#4648D4]/30 hover:bg-[#F2F3FF] transition-colors">View Details</button>
                            </Link>
                         </div>
                       </div>
                     ))}
                   </>
                 )}
                 {boqs.length === 0 && quotes.length === 0 && (
                   <EmptyState icon={ShoppingCart} title="No quotes or BOQ requests yet" description="BOQ requests and submitted quotes will appear here." />
                 )}
               </div>
             )
           )}
         </div>
       </div>

    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl skeleton bg-white/60 backdrop-blur-md" />)}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center py-16 px-8 text-center bg-white/50 rounded-xl">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[#F2F3FF] shadow-sm">
        <Icon className="h-8 w-8 text-[#C0C1FF]" />
      </div>
      <h3 className="text-[16px] font-extrabold text-[#161B2B] mb-2">{title}</h3>
      <p className="text-[13px] text-[#76767D] font-medium max-w-[320px] leading-relaxed">{description}</p>
    </div>
  );
}
