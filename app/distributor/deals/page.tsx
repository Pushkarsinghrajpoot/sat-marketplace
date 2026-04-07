'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, DollarSign, FileText, Building, Lock, Gavel, MessageSquare, FileCheck, Trophy, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useSimpleAuth } from '@/lib/simple-auth';
import { getDeals } from '@/lib/data-helpers';
import { supabase } from '@/lib/supabase';

export default function DistributorDealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [allDeals, setAllDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributorQuoteStatus, setDistributorQuoteStatus] = useState<Record<string, string>>({});
  const { user, organization } = useSimpleAuth();

  useEffect(() => {
    async function fetchAllDeals() {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        const deals = await getDeals({ 
          userRole: 'DISTRIBUTOR',
          distributorId: user.organizationId 
        });

        setAllDeals(deals);

        // For WON BIDDING deals, check if THIS distributor's quote won or lost
        const wonBiddingDeals = deals.filter(
          (d: any) => d.status === 'WON' && d.dealType === 'BIDDING'
        );
        if (wonBiddingDeals.length > 0) {
          const dealIds = wonBiddingDeals.map((d: any) => d.id);
          const { data: myQuotes } = await supabase
            .from('quotes')
            .select('deal_id, status')
            .in('deal_id', dealIds)
            .eq('distributor_id', user.organizationId);
          if (myQuotes) {
            const statusMap: Record<string, string> = {};
            myQuotes.forEach((q: any) => {
              // If multiple quotes per deal, prefer WON > LOST
              if (!statusMap[q.deal_id] || q.status === 'WON') {
                statusMap[q.deal_id] = q.status;
              }
            });
            setDistributorQuoteStatus(statusMap);
          }
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllDeals();
  }, [user?.organizationId]);

  const filteredDeals = allDeals.filter(deal =>
    deal.opportunityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.customerCompany?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by deal type first
  const dealsByType = {
    DEAL_REGISTRATION: filteredDeals.filter(d => d.dealType === 'DEAL_REGISTRATION'),
    BIDDING: filteredDeals.filter(d => d.dealType === 'BIDDING'),
    DIRECT_QUERY: filteredDeals.filter(d => d.dealType === 'DIRECT_QUERY'),
  };

  // Get active tab deals
  const currentDeals = activeTab === 'all' ? filteredDeals : dealsByType[activeTab as keyof typeof dealsByType] || [];

  // Resolve per-distributor outcome for WON BIDDING deals
  const getDistributorDealOutcome = (deal: any): 'won' | 'lost' | null => {
    if (deal.status === 'WON' && deal.dealType === 'BIDDING') {
      const myQuoteStatus = distributorQuoteStatus[deal.id];
      if (myQuoteStatus === 'WON') return 'won';
      if (myQuoteStatus === 'LOST') return 'lost';
      return 'lost'; // WON deal with no quote from this distributor = lost
    }
    return null;
  };

  // Group current deals by status (accounting for per-distributor bidding outcome)
  const dealsByStatus = {
    active: currentDeals.filter(d => d.status === 'ACTIVE' || d.status === 'REGISTERED'),
    quoted: currentDeals.filter(d => d.status === 'QUOTED'),
    won: currentDeals.filter(d => {
      if (d.status === 'WON' && d.dealType === 'BIDDING') return getDistributorDealOutcome(d) === 'won';
      return d.status === 'WON';
    }),
    lost: currentDeals.filter(d => {
      if (d.status === 'WON' && d.dealType === 'BIDDING') return getDistributorDealOutcome(d) === 'lost';
      return d.status === 'LOST';
    }),
  };

  const tabs = [
    { id: 'all', label: 'All Deals', count: filteredDeals.length, icon: FileCheck },
    { id: 'DEAL_REGISTRATION', label: 'Deal Registrations', count: dealsByType.DEAL_REGISTRATION.length, icon: Lock },
    { id: 'BIDDING', label: 'Bidding Deals', count: dealsByType.BIDDING.length, icon: Gavel },
    { id: 'DIRECT_QUERY', label: 'Direct Queries', count: dealsByType.DIRECT_QUERY.length, icon: MessageSquare },
  ];

  const renderDealCard = (deal: any) => {
    const cardBgClass = 
      deal.status === 'QUOTED' ? 'bg-amber-50 border-amber-200' :
      deal.status === 'WON' ? 'bg-green-50 border-green-200' :
      deal.status === 'LOST' ? 'bg-red-50 border-red-200' :
      '';

    return (
      <Link key={deal.id} href={`/distributor/deals/${deal.id}`}>
        <Card className={`hover:shadow-md transition-shadow cursor-pointer ${cardBgClass}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">
                {deal.opportunityName}
              </h3>
              {deal.isLocked && <Lock className="h-3 w-3 text-blue-600 ml-2 flex-shrink-0" />}
            </div>
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
              <div className="flex gap-2 flex-wrap">
                <Badge variant="default" className="text-xs">
                  {deal.dealType?.replace('_', ' ')}
                </Badge>
                {deal.status === 'QUOTED' && (
                  <Badge variant="warning" className="text-xs">Quoted</Badge>
                )}
                {deal.status === 'WON' && deal.dealType === 'BIDDING' && (() => {
                  const outcome = getDistributorDealOutcome(deal);
                  if (outcome === 'won') return (
                    <Badge variant="success" className="text-xs flex items-center gap-1">
                      <Trophy className="h-2.5 w-2.5" /> Won
                    </Badge>
                  );
                  if (outcome === 'lost') return (
                    <Badge variant="error" className="text-xs flex items-center gap-1">
                      <XCircle className="h-2.5 w-2.5" /> Lost Bid
                    </Badge>
                  );
                  return <Badge variant="error" className="text-xs">Lost Bid</Badge>;
                })()}
                {deal.status === 'WON' && deal.dealType !== 'BIDDING' && (
                  <Badge variant="success" className="text-xs">Won</Badge>
                )}
                {deal.status === 'LOST' && (
                  <Badge variant="error" className="text-xs">Lost</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
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

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="whitespace-nowrap"
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
                <Badge variant="default" className="ml-2">{tab.count}</Badge>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Active/Open Deals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-sm text-gray-900">Active/Open</h2>
            <Badge variant="default">{dealsByStatus.active.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStatus.active.map(renderDealCard)}
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
            {dealsByStatus.quoted.map(renderDealCard)}
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
            {dealsByStatus.won.map(renderDealCard)}
            {dealsByStatus.won.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No won deals</p>
            )}
          </div>
        </div>

        {/* Lost Deals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-sm text-gray-900">Lost/Closed</h2>
            <Badge variant="error">{dealsByStatus.lost.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStatus.lost.map(renderDealCard)}
            {dealsByStatus.lost.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No lost deals</p>
            )}
          </div>
        </div>
      </div>

      {currentDeals.length === 0 && !loading && (
        <Card className="mt-8 col-span-4">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">
              {activeTab === 'all' 
                ? 'No engaged deals found'
                : `No ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} found`
              }
            </p>
            <p className="text-sm text-gray-400 mt-2">
              You'll see deals here when resellers invite you to participate
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
