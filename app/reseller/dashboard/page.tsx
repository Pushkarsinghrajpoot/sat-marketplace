'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign, Briefcase, TrendingUp, Target, Plus, ArrowRight, Lock,
  Search, Send, Trophy, FileText, Upload, Package, ChevronRight,
  Clock, CheckCircle, AlertCircle, Eye, FileSpreadsheet, Zap, Home
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getDeals, getDirectQueries } from '@/lib/data-helpers';
import { useSimpleAuth } from '@/lib/simple-auth';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  REGISTERED: { bg: 'rgba(70,72,212,0.1)', text: '#4648D4', dot: '#4648D4' },
  PENDING: { bg: 'rgba(245,158,11,0.1)', text: '#D97706', dot: '#F59E0B' },
  APPROVED: { bg: 'rgba(16,185,129,0.1)', text: '#059669', dot: '#10B981' },
  WON: { bg: 'rgba(16,185,129,0.1)', text: '#059669', dot: '#10B981' },
  LOST: { bg: 'rgba(239,68,68,0.1)', text: '#DC2626', dot: '#EF4444' },
  BIDDING: { bg: 'rgba(245,158,11,0.1)', text: '#D97706', dot: '#F59E0B' },
  OPEN: { bg: 'rgba(59,130,246,0.1)', text: '#2563EB', dot: '#3B82F6' },
};

function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] || { bg: 'rgba(118,118,125,0.1)', text: '#76767D', dot: '#76767D' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: colors.bg, color: colors.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function ResellerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'registrations' | 'bidding' | 'queries'>('registrations');
  const [stats, setStats] = useState({ totalDeals: 0, totalValue: 0, avgDealSize: 0, winRate: 0, registrations: 0, bidding: 0, queries: 0 });
  const [dealRegistrations, setDealRegistrations] = useState<any[]>([]);
  const [biddingDeals, setBiddingDeals] = useState<any[]>([]);
  const [directQueries, setDirectQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSimpleAuth();

  useEffect(() => {
    async function fetchData() {
      if (!user?.id || !user?.organizationId) return;
      try {
        const [deals, queries] = await Promise.all([
          getDeals({ organizationId: user.organizationId }),
          getDirectQueries({ organizationId: user.organizationId }),
        ]);
        const registrations = deals.filter((d: any) => d.dealType === 'DEAL_REGISTRATION');
        const bidding = deals.filter((d: any) => d.dealType === 'BIDDING');
        const wonDeals = deals.filter((d: any) => d.status === 'WON');
        const totalValue = deals.reduce((sum: number, d: any) => sum + (d.estimatedValue || 0), 0);
        const avgDealSize = deals.length > 0 ? totalValue / deals.length : 0;
        const winRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;
        setStats({ totalDeals: deals.length, totalValue, avgDealSize, winRate: Math.round(winRate * 10) / 10, registrations: registrations.length, bidding: bidding.length, queries: queries.length });
        setDealRegistrations(registrations);
        setBiddingDeals(bidding);
        setDirectQueries(queries);
      } catch (error) {
        console.error('Error fetching reseller data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const pipelineStages = [
    { label: 'Prospecting', count: stats.registrations + stats.bidding, color: '#94A3B8', bg: 'rgba(148,163,184,0.12)' },
    { label: 'Registered', count: stats.registrations, color: '#4648D4', bg: 'rgba(70,72,212,0.12)' },
    { label: 'Bidding', count: stats.bidding, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Won', count: 0, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Lost', count: 0, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  ];

  const tabs = [
    { key: 'registrations', label: 'Deal Registrations', icon: Lock, count: stats.registrations },
    { key: 'bidding', label: 'Bidding Deals', icon: Search, count: stats.bidding },
    { key: 'queries', label: 'Direct Queries', icon: Send, count: stats.queries },
  ];

  return (
    <div className="p-6 lg:p-8 min-h-full">

      {/* ===== PAGE HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-64 rounded-xl skeleton" />
              <div className="h-4 w-48 rounded-xl skeleton" />
            </div>
          ) : (
            <>
              <h1 className="text-[26px] font-extrabold text-[#161B2B] tracking-tight leading-none mb-1">
                {greeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-[14px] text-[#76767D]">Track your deals, quotes, and pipeline in real-time</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="flex items-center gap-2 h-11 px-5 text-[#161B2B] font-semibold text-[14px] rounded-full border border-[#e2e4ec] bg-white hover:bg-gray-50 transition-all shadow-sm">
              <Home className="h-4 w-4" />
              Homepage
            </button>
          </Link>
          <Link href="/reseller/deals/register">
            <button className="flex items-center gap-2 h-11 px-6 text-white font-semibold text-[14px] rounded-full transition-all hover:opacity-90 hover:shadow-[0_8px_20px_rgba(245,158,11,0.35)]"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              <Plus className="h-4 w-4" />
              Register Deal
            </button>
          </Link>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            label: 'Total Deals', value: loading ? '—' : String(stats.totalDeals),
            icon: Briefcase, iconBg: 'linear-gradient(135deg, #4648D4, #6063EE)',
            sub: 'All deal types', subColor: '#76767D', href: '/reseller/deals'
          },
          {
            label: 'Pipeline Value', value: loading ? '—' : formatCurrency(stats.totalValue),
            icon: TrendingUp, iconBg: 'linear-gradient(135deg, #10B981, #059669)',
            sub: 'Total opportunity', subColor: '#10B981', href: '/reseller/analytics'
          },
          {
            label: 'Avg Deal Size', value: loading ? '—' : formatCurrency(stats.avgDealSize),
            icon: Target, iconBg: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            sub: 'Per deal average', subColor: '#76767D', href: '/reseller/analytics'
          },
          {
            label: 'Win Rate', value: loading ? '—' : `${stats.winRate}%`,
            icon: Trophy, iconBg: 'linear-gradient(135deg, #F59E0B, #D97706)',
            sub: 'Deals converted', subColor: '#F59E0B', href: '/reseller/analytics'
          },
        ].map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="card-kpi group cursor-pointer">
              <div className="flex items-start justify-between mb-5">
                <div className="kpi-icon" style={{ background: card.iconBg }}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <ChevronRight className="h-4 w-4 text-[#C7C6CD] group-hover:text-[#4648D4] transition-colors" />
              </div>
              <p className="text-[28px] font-extrabold text-[#161B2B] leading-none mb-1.5 tracking-tight">{card.value}</p>
              <p className="text-[13px] font-medium text-[#76767D]">{card.label}</p>
              <p className="text-[11px] font-semibold mt-2" style={{ color: card.subColor }}>{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ===== PIPELINE STAGES ===== */}
      <div className="bg-white rounded-2xl border border-[rgba(199,198,205,0.3)] shadow-[0_1px_3px_rgba(22,27,43,0.06)] p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-bold text-[#161B2B]">Deal Pipeline</h2>
            <p className="text-[13px] text-[#76767D] mt-0.5">Your current opportunity funnel</p>
          </div>
          <Link href="/reseller/deals">
            <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4648D4] hover:underline">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {pipelineStages.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: stage.bg }}>
                <span className="text-[13px] font-semibold" style={{ color: stage.color }}>{stage.label}</span>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: stage.color }}>
                  {stage.count}
                </span>
              </div>
              {i < pipelineStages.length - 1 && (
                <ChevronRight className="h-4 w-4 text-[#C7C6CD] flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== DEALS TABS ===== */}
      <div className="bg-white rounded-2xl border border-[rgba(199,198,205,0.3)] shadow-[0_1px_3px_rgba(22,27,43,0.06)] mb-8">
        {/* Tab Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b border-[rgba(199,198,205,0.2)]">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 text-[13.5px] font-semibold border-b-2 transition-all -mb-px ${
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
          <button
            onClick={() => router.push('/reseller/deals/register')}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white rounded-full mb-2"
            style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Deal Registrations */}
          {activeTab === 'registrations' && (
            loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl skeleton" />)}
              </div>
            ) : dealRegistrations.length > 0 ? (
              <div className="space-y-3">
                {dealRegistrations.map((deal: any) => (
                  <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(199,198,205,0.2)] hover:border-[rgba(70,72,212,0.3)] hover:shadow-[0_4px_16px_rgba(22,27,43,0.08)] transition-all group cursor-pointer">
                      <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(180deg, #4648D4, #6063EE)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[14px] font-semibold text-[#161B2B] truncate group-hover:text-[#4648D4] transition-colors">{deal.opportunityName}</h4>
                          {deal.isLocked && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(70,72,212,0.08)] text-[#4648D4]">
                              <Lock className="h-2.5 w-2.5" /> Protected
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#76767D]">{deal.customerName || deal.customerCompany}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[15px] font-bold text-[#4648D4]">{formatCurrency(Number(deal.estimatedValue) || 0)}</p>
                        <p className="text-[11px] text-[#76767D] mt-0.5">{deal.closeDate || 'No close date'}</p>
                      </div>
                      <StatusBadge status={deal.status || 'REGISTERED'} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Lock}
                title="No deal registrations yet"
                description="Register your first deal to protect your customer opportunity and start getting quotes from distributors."
                action={{ label: 'Register First Deal', href: '/reseller/deals/register' }}
              />
            )
          )}

          {/* Bidding Deals */}
          {activeTab === 'bidding' && (
            loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl skeleton" />)}
              </div>
            ) : biddingDeals.length > 0 ? (
              <div className="space-y-3">
                {biddingDeals.map((deal: any) => (
                  <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(199,198,205,0.2)] hover:border-[rgba(245,158,11,0.3)] hover:shadow-[0_4px_16px_rgba(22,27,43,0.08)] transition-all group cursor-pointer">
                      <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(180deg, #F59E0B, #D97706)' }} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-semibold text-[#161B2B] truncate mb-1 group-hover:text-[#F59E0B] transition-colors">{deal.opportunityName}</h4>
                        <p className="text-[12px] text-[#76767D]">{deal.customerName || deal.customerCompany}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[15px] font-bold text-[#F59E0B]">{formatCurrency(Number(deal.estimatedValue) || 0)}</p>
                      </div>
                      <StatusBadge status="BIDDING" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="No bidding deals yet"
                description="Create open bidding opportunities to get competitive quotes from multiple distributors quickly."
                action={{ label: 'Create Bidding Deal', href: '/reseller/deals/register' }}
              />
            )
          )}

          {/* Direct Queries */}
          {activeTab === 'queries' && (
            loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl skeleton" />)}
              </div>
            ) : directQueries.length > 0 ? (
              <div className="space-y-3">
                {directQueries.map((query: any) => (
                  <div key={query.id} className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(199,198,205,0.2)] hover:border-[rgba(59,130,246,0.3)] hover:shadow-[0_4px_16px_rgba(22,27,43,0.08)] transition-all">
                    <div className="w-2 h-10 rounded-full flex-shrink-0 bg-[#3B82F6]" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-semibold text-[#161B2B] truncate mb-1">{query.title}</h4>
                      <p className="text-[12px] text-[#76767D] line-clamp-1">{query.requirement}</p>
                    </div>
                    <div className="text-right flex-shrink-0 text-[12px] text-[#76767D]">
                      {query.responses || 0} responses
                    </div>
                    <StatusBadge status={query.status || 'OPEN'} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Send}
                title="No direct queries yet"
                description="Send queries to distributors for quick pricing and availability responses."
                action={{ label: 'Create Query', href: '/reseller/queries/create' }}
              />
            )
          )}
        </div>
      </div>

      {/* ===== QUICK ACTIONS GRID ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Register Deal', sub: 'Protect your opportunity', icon: Lock, href: '/reseller/deals/register', gradient: 'linear-gradient(135deg, #4648D4, #6063EE)', textColor: 'white', subColor: 'rgba(255,255,255,0.7)' },
          { label: 'Upload BOQ', sub: 'Get competitive quotes', icon: Upload, href: '/reseller/boq/upload', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', textColor: 'white', subColor: 'rgba(255,255,255,0.7)' },
          { label: 'Browse Products', sub: 'Find the right solution', icon: Package, href: '/categories', gradient: 'white', textColor: '#161B2B', subColor: '#76767D', border: true },
          { label: 'View Quotes', sub: 'Review all submitted quotes', icon: FileText, href: '/reseller/quotes', gradient: 'white', textColor: '#161B2B', subColor: '#76767D', border: true },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <div className={`p-5 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${action.border ? 'border border-[rgba(199,198,205,0.3)] bg-white' : ''}`}
              style={{ background: action.gradient }}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${action.border ? 'bg-[#F2F3FF]' : 'bg-[rgba(255,255,255,0.15)]'}`}>
                <action.icon className={`h-5 w-5 ${action.border ? 'text-[#4648D4]' : 'text-white'}`} />
              </div>
              <p className="text-[14px] font-bold mb-0.5" style={{ color: action.textColor }}>{action.label}</p>
              <p className="text-[12px]" style={{ color: action.subColor }}>{action.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }: {
  icon: any; title: string; description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[#F2F3FF]">
        <Icon className="h-8 w-8 text-[#C0C1FF]" />
      </div>
      <h3 className="text-[16px] font-bold text-[#161B2B] mb-2">{title}</h3>
      <p className="text-[13px] text-[#76767D] max-w-[340px] leading-relaxed mb-6">{description}</p>
      {action && (
        <Link href={action.href}>
          <button className="flex items-center gap-2 h-10 px-6 text-white text-[13px] font-semibold rounded-full"
            style={{ background: 'linear-gradient(135deg, #4648D4, #6063EE)' }}>
            <Plus className="h-4 w-4" /> {action.label}
          </button>
        </Link>
      )}
    </div>
  );
}
