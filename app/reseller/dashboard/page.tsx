'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Briefcase, TrendingUp, Target, Plus, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ResellerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalValue: 0,
    avgDealSize: 0,
    winRate: 42.8,
  });

  const [dealsByStage, setDealsByStage] = useState({
    prospecting: [] as any[],
    registered: [] as any[],
    quoted: [] as any[],
    won: [] as any[],
  });

  useEffect(() => {
    const deals = JSON.parse(localStorage.getItem('deals') || '[]');
    
    if (deals.length === 0) {
      const sampleDeals = [
        { id: '1', name: 'Healthcare Network Upgrade', customer: 'City Hospital', value: 125000, closeDate: '2024-03-15', status: 'PROSPECTING' },
        { id: '2', name: 'Campus WiFi Deployment', customer: 'State University', value: 89000, closeDate: '2024-03-20', status: 'PROSPECTING' },
        { id: '3', name: 'Data Center Modernization', customer: 'Tech Corp', value: 450000, closeDate: '2024-04-10', status: 'REGISTERED', distributors: 3 },
        { id: '4', name: 'Security Infrastructure', customer: 'Finance Inc', value: 180000, closeDate: '2024-03-25', status: 'QUOTED', quotes: 5 },
        { id: '5', name: 'Cloud Migration', customer: 'Retail Co', value: 95000, closeDate: '2024-02-28', status: 'WON' },
      ];
      localStorage.setItem('deals', JSON.stringify(sampleDeals));
      
      setStats({
        totalDeals: sampleDeals.length,
        totalValue: sampleDeals.reduce((sum, d) => sum + d.value, 0),
        avgDealSize: sampleDeals.reduce((sum, d) => sum + d.value, 0) / sampleDeals.length,
        winRate: 42.8,
      });

      setDealsByStage({
        prospecting: sampleDeals.filter(d => d.status === 'PROSPECTING'),
        registered: sampleDeals.filter(d => d.status === 'REGISTERED'),
        quoted: sampleDeals.filter(d => d.status === 'QUOTED'),
        won: sampleDeals.filter(d => d.status === 'WON'),
      });
    } else {
      setStats({
        totalDeals: deals.length,
        totalValue: deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0),
        avgDealSize: deals.length > 0 ? deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0) / deals.length : 0,
        winRate: 42.8,
      });

      setDealsByStage({
        prospecting: deals.filter((d: any) => d.status === 'PROSPECTING'),
        registered: deals.filter((d: any) => d.status === 'REGISTERED'),
        quoted: deals.filter((d: any) => d.status === 'QUOTED'),
        won: deals.filter((d: any) => d.status === 'WON'),
      });
    }
  }, []);

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

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Deal Pipeline</h2>
        <Button onClick={() => router.push('/reseller/deals/register')}>
          <Plus className="h-4 w-4 mr-2" />
          Register New Deal
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Prospecting</h3>
            <Badge variant="default">{dealsByStage.prospecting.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.prospecting.length > 0 ? (
              dealsByStage.prospecting.map((deal) => (
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
              <Card className="bg-gray-50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-gray-500">No deals in this stage</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Registered</h3>
            <Badge variant="info">{dealsByStage.registered.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.registered.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2">{deal.name}</h4>
                    <p className="text-xs text-gray-600 mb-3">{deal.customer}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{formatCurrency(deal.value)}</span>
                      <span className="text-xs text-blue-600">{deal.distributors || 0} distributors</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Quoted</h3>
            <Badge variant="warning">{dealsByStage.quoted.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.quoted.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="bg-purple-50 border-purple-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2">{deal.name}</h4>
                    <p className="text-xs text-gray-600 mb-3">{deal.customer}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{formatCurrency(deal.value)}</span>
                      <span className="text-xs text-purple-600">{deal.quotes || 0} quotes</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Won</h3>
            <Badge variant="success">{dealsByStage.won.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.won.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2">{deal.name}</h4>
                    <p className="text-xs text-gray-600 mb-3">{deal.customer}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-green-700">{formatCurrency(deal.value)}</span>
                      <Badge variant="success" className="text-xs">Closed</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

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
