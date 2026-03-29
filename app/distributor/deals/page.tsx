'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Calendar, DollarSign, FileText, Building } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';

export default function DistributorDealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [engagedDeals, setEngagedDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, organization } = useSimpleAuth();

  useEffect(() => {
    async function fetchEngagedDeals() {
      if (!organization?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('deal_engaged_distributors')
          .select(`
            *,
            deals (
              id,
              opportunity_name,
              customer_name,
              customer_company,
              estimated_value,
              close_date,
              status,
              deal_type,
              created_at
            )
          `)
          .eq('distributor_id', organization.id)
          .order('engaged_at', { ascending: false });

        if (error) throw error;

        const dealsData = (data || [])
          .filter(item => item.deals)
          .map(item => ({
            id: item.deals.id,
            opportunityName: item.deals.opportunity_name,
            customerName: item.deals.customer_name,
            customerCompany: item.deals.customer_company,
            estimatedValue: item.deals.estimated_value,
            closeDate: item.deals.close_date,
            status: item.deals.status,
            dealType: item.deals.deal_type,
            engagedAt: item.engaged_at,
            createdAt: item.deals.created_at,
          }));

        setEngagedDeals(dealsData);
      } catch (error) {
        console.error('Error fetching engaged deals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEngagedDeals();
  }, [organization?.id]);

  const filteredDeals = engagedDeals.filter(deal =>
    deal.opportunityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.customerCompany?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dealsByStatus = {
    active: filteredDeals.filter(d => d.status === 'ACTIVE'),
    quoted: filteredDeals.filter(d => d.status === 'QUOTED'),
    won: filteredDeals.filter(d => d.status === 'WON'),
    lost: filteredDeals.filter(d => d.status === 'LOST'),
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Engaged Deals</h1>
        <p className="text-sm text-gray-600">Deals where you've been invited to participate</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
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
        {/* Active Deals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-sm text-gray-900">Active</h2>
            <Badge variant="default">{dealsByStatus.active.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStatus.active.map((deal) => (
              <Link key={deal.id} href={`/distributor/deals/${deal.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                      {deal.opportunityName}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-600 truncate">
                        {deal.customerCompany || deal.customerName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(Number(deal.estimatedValue) || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.closeDate || 'No date'}</span>
                      </div>
                      <Badge variant="info" className="text-xs">
                        {deal.dealType?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStatus.active.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No active deals</p>
            )}
          </div>
        </div>

        {/* Quoted Deals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-sm text-gray-900">Quoted</h2>
            <Badge variant="warning">{dealsByStatus.quoted.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStatus.quoted.map((deal) => (
              <Link key={deal.id} href={`/distributor/deals/${deal.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                      {deal.opportunityName}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-600 truncate">
                        {deal.customerCompany || deal.customerName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(Number(deal.estimatedValue) || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="h-3 w-3 text-amber-600" />
                        <span className="text-amber-600 font-medium">Quote submitted</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStatus.quoted.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No quoted deals</p>
            )}
          </div>
        </div>

        {/* Won Deals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-sm text-gray-900">Won</h2>
            <Badge variant="success">{dealsByStatus.won.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStatus.won.map((deal) => (
              <Link key={deal.id} href={`/distributor/deals/${deal.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                      {deal.opportunityName}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-600 truncate">
                        {deal.customerCompany || deal.customerName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(Number(deal.estimatedValue) || 0)}
                        </span>
                      </div>
                      <Badge variant="success" className="text-xs">
                        WON
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStatus.won.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No won deals</p>
            )}
          </div>
        </div>

        {/* Lost Deals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-sm text-gray-900">Lost</h2>
            <Badge variant="error">{dealsByStatus.lost.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStatus.lost.map((deal) => (
              <Link key={deal.id} href={`/distributor/deals/${deal.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                      {deal.opportunityName}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-600 truncate">
                        {deal.customerCompany || deal.customerName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(Number(deal.estimatedValue) || 0)}
                        </span>
                      </div>
                      <Badge variant="error" className="text-xs">
                        LOST
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStatus.lost.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No lost deals</p>
            )}
          </div>
        </div>
      </div>

      {filteredDeals.length === 0 && !loading && (
        <Card className="mt-8">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No engaged deals found</p>
            <p className="text-sm text-gray-400 mt-2">
              You'll see deals here when resellers invite you to participate
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
