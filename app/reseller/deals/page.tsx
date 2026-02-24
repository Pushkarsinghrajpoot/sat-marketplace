'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar, DollarSign, Users, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
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
    searchQuery === '' || 
    deal.deal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dealsByStage = {
    prospecting: filteredDeals.filter(d => d.status === 'DRAFT' || d.status === 'PENDING'),
    registered: filteredDeals.filter(d => d.status === 'ACTIVE' && d.deal_type === 'DEAL_REGISTRATION'),
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
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.deal_name}</h3>
                    <p className="text-xs text-gray-600 mb-3">{deal.customer_name}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-bold text-gray-900">{formatCurrency(deal.deal_value || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.expected_close_date}</span>
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
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.deal_name}</h3>
                    <p className="text-xs text-gray-600 mb-3">{deal.customer_name}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-bold text-gray-900">{formatCurrency(deal.deal_value || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.expected_close_date}</span>
                      </div>
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
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.deal_name}</h3>
                    <p className="text-xs text-gray-600 mb-3">{deal.customer_name}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-bold text-gray-900">{formatCurrency(deal.deal_value || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-purple-600">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.expected_close_date}</span>
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
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.deal_name}</h3>
                    <p className="text-xs text-gray-600 mb-3">{deal.customer_name}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-bold text-green-700">{formatCurrency(deal.deal_value || 0)}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Closed: {deal.expected_close_date}
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
