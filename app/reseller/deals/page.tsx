'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar, DollarSign, Users, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Lock, TrendingUp } from 'lucide-react';
import { getDeals } from '@/lib/data-helpers';
import { useAuthStore } from '@/lib/store';

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchDeals() {
      if (!user?.id) return;
      
      try {
        const data = await getDeals({ userId: user.id });
        setDeals(data);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, [user]);

  const filteredDeals = deals.filter(deal =>
    deal.opportunityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dealsByStage = {
    prospecting: filteredDeals.filter(d => d.status === 'DRAFT' && !d.isLocked && d.dealType !== 'DIRECT_QUERY'),
    registered: filteredDeals.filter(d => (d.status === 'DRAFT' || d.status === 'ACTIVE') && d.isLocked && d.dealType === 'DEAL_REGISTRATION'),
    bidding: filteredDeals.filter(d => d.dealType === 'BIDDING' && d.status === 'ACTIVE'),
    directQueries: filteredDeals.filter(d => d.dealType === 'DIRECT_QUERY'),
    quoted: filteredDeals.filter(d => d.status === 'QUOTED'),
    won: filteredDeals.filter(d => d.status === 'WON'),
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Deals</h1>
          <p className="text-gray-600">Manage your sales opportunities</p>
        </div>
        <Link href="/reseller/deals/register">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register New Deal
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Prospecting */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Prospecting</h2>
            <Badge variant="default">{dealsByStage.prospecting.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.prospecting.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="bg-gray-50 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.opportunityName}</h3>
                    <p className="text-xs text-gray-600 mb-3">{deal.customerName}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-bold text-gray-900">{formatCurrency(deal.estimatedValue || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.closeDate}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStage.prospecting.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No deals in prospecting</p>
            )}
          </div>
        </div>

        {/* Registered */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Registered</h2>
            <Badge variant="info">{dealsByStage.registered.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.registered.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm line-clamp-2 flex-1">{deal.opportunityName}</h3>
                      {deal.isLocked && (
                        <Lock className="h-4 w-4 text-yellow-600 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{deal.customerName}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-bold text-gray-900">{formatCurrency(deal.estimatedValue || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.closeDate}</span>
                      </div>
                      {deal.score > 0 && (
                        <div className="flex items-center gap-2 text-xs text-orange-600">
                          <TrendingUp className="h-3 w-3" />
                          <span className="font-semibold">{deal.score} points</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStage.registered.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No registered deals</p>
            )}
          </div>
        </div>

        {/* Bidding */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Bidding</h2>
            <Badge variant="info">{dealsByStage.bidding.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.bidding.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="bg-orange-50 border-orange-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.opportunityName}</h3>
                    <p className="text-xs text-gray-600 mb-3">{deal.customerName}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-bold text-gray-900">{formatCurrency(deal.estimatedValue || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.closeDate}</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3">
                      View Quotes
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStage.bidding.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No bidding deals</p>
            )}
          </div>
        </div>

        {/* Direct Queries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Direct Queries</h2>
            <Badge variant="default">{dealsByStage.directQueries.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.directQueries.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="bg-teal-50 border-teal-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.opportunityName}</h3>
                    <p className="text-xs text-gray-600 mb-3">{deal.customerName}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-bold text-gray-900">{formatCurrency(deal.estimatedValue || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-teal-600">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.closeDate}</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStage.directQueries.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No direct queries</p>
            )}
          </div>
        </div>

        {/* Quoted */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Quoted</h2>
            <Badge variant="warning">{dealsByStage.quoted.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.quoted.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="bg-purple-50 border-purple-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.opportunityName}</h3>
                    <p className="text-xs text-gray-600 mb-3">{deal.customerName}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-bold text-gray-900">{formatCurrency(deal.estimatedValue || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-purple-600">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.closeDate}</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3">
                      View Quotes
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStage.quoted.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No quoted deals</p>
            )}
          </div>
        </div>

        {/* Won */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Won</h2>
            <Badge variant="success">{dealsByStage.won.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.won.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.opportunityName}</h3>
                    <p className="text-xs text-gray-600 mb-3">{deal.customerName}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-bold text-green-700">{formatCurrency(deal.estimatedValue || 0)}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Closed: {deal.closeDate}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStage.won.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No won deals</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
