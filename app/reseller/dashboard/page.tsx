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
import { useAuthStore } from '@/lib/store';

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
  const { user } = useAuthStore();

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
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reseller Dashboard</h1>
        <p className="text-gray-600">Manage your deals and opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/reseller/deals">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDeals}</p>
                <p className="text-sm text-gray-600 mt-1">Total Deals</p>
                <p className="text-xs text-blue-600 mt-2">Click to view all</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reseller/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                <p className="text-sm text-gray-600 mt-1">Total Pipeline Value</p>
                <p className="text-xs text-green-600 mt-2">+18% growth</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.avgDealSize)}</p>
              <p className="text-sm text-gray-600 mt-1">Avg Deal Size</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.winRate}%</p>
              <p className="text-sm text-gray-600 mt-1">Win Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Deals & Queries</h2>
          <Button onClick={() => router.push('/reseller/deals/register')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>

        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'registrations'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
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
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'bidding'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
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
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'queries'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
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
        <div className="space-y-4">
          {dealRegistrations.length > 0 ? (
            dealRegistrations.map((deal: any) => (
                <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                  <Card className="bg-gray-50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">{deal.name}</h4>
                      <p className="text-xs text-gray-600 mb-3">{deal.customer}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{formatCurrency(deal.value)}</span>
                        <span className="text-xs text-gray-500">{deal.closeDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No deal registrations yet</p>
                  <p className="text-sm text-gray-500 mb-4">Create a protected deal with customer verification</p>
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
        <div className="space-y-4">
          {biddingDeals.length > 0 ? (
            biddingDeals.map((deal: any) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-lg mb-2">{deal.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{deal.customer}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(deal.value)}</span>
                      <Badge variant="warning">Bidding</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No bidding deals yet</p>
                <p className="text-sm text-gray-500 mb-4">Create open bidding opportunities for quick quotes</p>
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
        <div className="space-y-4">
          {directQueries.length > 0 ? (
            directQueries.map((query: any) => (
              <Card key={query.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-2">{query.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{query.requirement}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="info">{query.status}</Badge>
                    <span className="text-sm text-gray-500">{query.responses || 0} responses</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No direct queries yet</p>
                <p className="text-sm text-gray-500 mb-4">Send queries to distributors for quick responses</p>
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
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/reseller/deals/register">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register Deal
              </Button>
            </Link>
            <Link href="/reseller/boq/upload">
              <Button variant="outline">Upload BOQ</Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline">Browse Products</Button>
            </Link>
            <Link href="/reseller/services">
              <Button variant="outline">Manage Services</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
