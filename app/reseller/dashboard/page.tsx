'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Briefcase, TrendingUp, Target, Plus, ArrowRight, Lock, Search, Send } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getDeals, getDirectQueries } from '@/lib/data-helpers';
import { useSimpleAuth } from '@/lib/simple-auth';

export default function ResellerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'registrations' | 'bidding' | 'queries'>('registrations');
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalValue: 0,
    avgDealSize: 0,
    winRate: 42.8,
    registrations: 0,
    bidding: 0,
    queries: 0,
  });

  const [dealRegistrations, setDealRegistrations] = useState<any[]>([]);
  const [biddingDeals, setBiddingDeals] = useState<any[]>([]);
  const [directQueries, setDirectQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSimpleAuth();

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;

      try {
        const [deals, queries] = await Promise.all([
          getDeals({ userId: user.id }),
          getDirectQueries({ userId: user.id }),
        ]);

        const registrations = deals.filter((d: any) => d.dealType === 'DEAL_REGISTRATION');
        const bidding = deals.filter((d: any) => d.dealType === 'BIDDING');
        
        const wonDeals = deals.filter((d: any) => d.status === 'WON');
        const totalValue = deals.reduce((sum: number, d: any) => sum + (d.estimatedValue || 0), 0);
        const avgDealSize = deals.length > 0 ? totalValue / deals.length : 0;
        const winRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;
        
        setStats({
          totalDeals: deals.length,
          totalValue,
          avgDealSize,
          winRate,
          registrations: registrations.length,
          bidding: bidding.length,
          queries: queries.length,
        });

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#09090B] mb-1">Reseller Dashboard</h1>
        <p className="text-[14px] text-[#71717A]">Manage your deals and opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/reseller/deals">
          <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-md flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-[#6366F1]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[#A1A1AA]" />
              </div>
              <div>
                <p className="text-[32px] font-bold text-[#09090B] leading-none">{stats.totalDeals}</p>
                <p className="text-[12px] text-[#71717A] mt-2">Total Deals</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reseller/analytics">
          <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#F0FDF4] rounded-md flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#22C55E]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[#A1A1AA]" />
              </div>
              <div>
                <p className="text-[32px] font-bold text-[#09090B] leading-none">{formatCurrency(stats.totalValue)}</p>
                <p className="text-[12px] text-[#71717A] mt-2">Total Pipeline Value</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#EFF6FF] rounded-md flex items-center justify-center">
                <Target className="h-5 w-5 text-[#2563EB]" />
              </div>
            </div>
            <div>
              <p className="text-[32px] font-bold text-[#09090B] leading-none">{formatCurrency(stats.avgDealSize)}</p>
              <p className="text-[12px] text-[#71717A] mt-2">Avg Deal Size</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#FFFBEB] rounded-md flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#F59E0B]" />
              </div>
            </div>
            <div>
              <p className="text-[32px] font-bold text-[#09090B] leading-none">{stats.winRate}%</p>
              <p className="text-[12px] text-[#71717A] mt-2">Win Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-semibold text-[#09090B]">My Deals & Queries</h2>
          <Button onClick={() => router.push('/reseller/deals/register')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>

        <div className="flex gap-1 border-b border-[#E4E4E7] mb-6">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-3 text-[14px] font-medium transition-colors ${
              activeTab === 'registrations'
                ? 'text-[#09090B] border-b-2 border-[#6366F1]'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Deal Registrations
              <Badge variant="info">{stats.registrations}</Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bidding')}
            className={`px-4 py-3 text-[14px] font-medium transition-colors ${
              activeTab === 'bidding'
                ? 'text-[#09090B] border-b-2 border-[#6366F1]'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Bidding Deals
              <Badge variant="warning">{stats.bidding}</Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`px-4 py-3 text-[14px] font-medium transition-colors ${
              activeTab === 'queries'
                ? 'text-[#09090B] border-b-2 border-[#6366F1]'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Direct Queries
              <Badge variant="default">{stats.queries}</Badge>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'registrations' && (
        <div className="space-y-3">
          {dealRegistrations.length > 0 ? (
            dealRegistrations.map((deal: any) => (
                <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                  <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <h4 className="font-medium text-[15px] text-[#09090B] mb-2 line-clamp-2">{deal.opportunityName}</h4>
                      <p className="text-[13px] text-[#71717A] mb-3">{deal.customerName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-[#09090B]">{formatCurrency(Number(deal.estimatedValue) || 0)}</span>
                        <span className="text-[12px] text-[#A1A1AA]">{deal.closeDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lock className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
                  <p className="text-[15px] font-medium text-[#09090B] mb-2">No deal registrations yet</p>
                  <p className="text-[14px] text-[#71717A] mb-6">Create a protected deal with customer verification</p>
                  <Button onClick={() => router.push('/reseller/deals/register')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Register First Deal
                  </Button>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      {activeTab === 'bidding' && (
        <div className="space-y-3">
          {biddingDeals.length > 0 ? (
            biddingDeals.map((deal: any) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <h4 className="font-medium text-[15px] text-[#09090B] mb-2">{deal.opportunityName}</h4>
                    <p className="text-[13px] text-[#71717A] mb-3">{deal.customerName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[#09090B]">{formatCurrency(Number(deal.estimatedValue) || 0)}</span>
                      <Badge variant="warning">Bidding</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
                <p className="text-[15px] font-medium text-[#09090B] mb-2">No bidding deals yet</p>
                <p className="text-[14px] text-[#71717A] mb-6">Create open bidding opportunities for quick quotes</p>
                <Button onClick={() => router.push('/reseller/deals/register')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bidding Deal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'queries' && (
        <div className="space-y-3">
          {directQueries.length > 0 ? (
            directQueries.map((query: any) => (
              <Card key={query.id} className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
                <CardContent className="p-5">
                  <h4 className="font-medium text-[15px] text-[#09090B] mb-2">{query.title}</h4>
                  <p className="text-[13px] text-[#71717A] mb-3">{query.requirement}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="info">{query.status}</Badge>
                    <span className="text-[12px] text-[#71717A]">{query.responses || 0} responses</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Send className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
                <p className="text-[15px] font-medium text-[#09090B] mb-2">No direct queries yet</p>
                <p className="text-[14px] text-[#71717A] mb-6">Send queries to distributors for quick responses</p>
                <Link href="/reseller/queries/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Query
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="font-medium text-[15px] text-[#09090B] mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/reseller/deals/register">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register Deal
              </Button>
            </Link>
            <Link href="/reseller/boq/upload">
              <Button variant="secondary">Upload BOQ</Button>
            </Link>
            <Link href="/categories">
              <Button variant="secondary">Browse Products</Button>
            </Link>
            <Link href="/reseller/services">
              <Button variant="secondary">Manage Services</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
