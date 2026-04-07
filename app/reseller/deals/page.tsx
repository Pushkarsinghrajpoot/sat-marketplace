'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar, DollarSign, Users, FileText, Star, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Lock, TrendingUp } from 'lucide-react';
import { getDeals, getDirectQueries } from '@/lib/data-helpers';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deals, setDeals] = useState<any[]>([]);
  const [directQueries, setDirectQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wonDistributors, setWonDistributors] = useState<Record<string, string>>({});
  const { user } = useSimpleAuth();

  useEffect(() => {
    async function fetchDeals() {
      console.log('DealsPage: Fetching deals, user:', user);
      
      if (!user?.id || !user?.organizationId) {
        console.log('DealsPage: No user ID or organizationId, setting loading to false');
        setLoading(false);
        return;
      }
      
      try {
        console.log('DealsPage: Fetching deals for organization:', user.organizationId);
        const [dealsData, queriesData] = await Promise.all([
          getDeals({ organizationId: user.organizationId }),
          getDirectQueries({ organizationId: user.organizationId })
        ]);
        console.log('DealsPage: Deals fetched:', dealsData.length, 'Direct queries:', queriesData.length);
        setDeals(dealsData);
        setDirectQueries(queriesData);

        // Enrich WON deals with winning distributor name
        const wonDeals = dealsData.filter(d => d.status === 'WON' && d.wonQuoteId);
        if (wonDeals.length > 0) {
          const wonQuoteIds = wonDeals.map(d => d.wonQuoteId);
          const { data: wonQuotes } = await supabase
            .from('quotes')
            .select('id, distributor_id, organizations!quotes_distributor_id_fkey(name)')
            .in('id', wonQuoteIds);
          if (wonQuotes) {
            const map: Record<string, string> = {};
            wonQuotes.forEach((q: any) => {
              map[q.id] = q.organizations?.name || 'Unknown Distributor';
            });
            setWonDistributors(map);
          }
        }
      } catch (error) {
        console.error('DealsPage: Error fetching deals:', error);
      } finally {
        console.log('DealsPage: Setting loading to false');
        setLoading(false);
      }
    }

    fetchDeals();
  }, [user?.id, user?.organizationId]);

  const filteredDeals = deals.filter(deal =>
    deal.opportunityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQueries = directQueries.filter(query =>
    query.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    query.requirement?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dealsByStage = {
    prospecting: filteredDeals.filter(d => d.status === 'DRAFT' && !d.isLocked && d.dealType !== 'DIRECT_QUERY'),
    registered: filteredDeals.filter(d => (d.status === 'DRAFT' || d.status === 'ACTIVE') && d.isLocked && d.dealType === 'DEAL_REGISTRATION'),
    bidding: filteredDeals.filter(d => d.dealType === 'BIDDING' && d.status === 'ACTIVE'),
    directQueries: filteredQueries, // Use actual direct queries from direct_queries table
    quoted: filteredDeals.filter(d => d.status === 'QUOTED'),
    closed: filteredDeals.filter(d => d.status === 'WON' || d.status === 'LOST'),
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-[14px] text-[#71717A]">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-[#09090B] mb-1">My Deals</h1>
          <p className="text-[14px] text-[#71717A]">Manage your sales opportunities</p>
        </div>
        <Link href="/reseller/deals/register">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register New Deal
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
          <Input
            type="search"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-[14px] text-[#09090B]">Prospecting</h2>
            <Badge variant="default">{dealsByStage.prospecting.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.prospecting.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-[14px] text-[#09090B] mb-2 line-clamp-2">{deal.opportunityName}</h3>
                    <p className="text-[12px] text-[#71717A] mb-3">{deal.customerName}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[12px]">
                        <DollarSign className="h-3 w-3 text-[#A1A1AA]" />
                        <span className="font-semibold text-[#09090B]">{formatCurrency(Number(deal.estimatedValue) || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#71717A]">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.closeDate}</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full mt-3">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStage.prospecting.length === 0 && (
              <p className="text-[13px] text-[#A1A1AA] text-center py-4">No deals in prospecting</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-[14px] text-[#09090B]">Registered</h2>
            <Badge variant="info">{dealsByStage.registered.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.registered.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer bg-[#EFF6FF] border-[#DBEAFE]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-[14px] text-[#09090B] line-clamp-2 flex-1">{deal.opportunityName}</h3>
                      {deal.isLocked && (
                        <Lock className="h-4 w-4 text-[#F59E0B] ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[12px] text-[#71717A] mb-3">{deal.customerName}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[12px]">
                        <DollarSign className="h-3 w-3 text-[#A1A1AA]" />
                        <span className="font-semibold text-[#09090B]">{formatCurrency(Number(deal.estimatedValue) || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#2563EB]">
                        <Calendar className="h-3 w-3" />
                        <span>{deal.closeDate}</span>
                      </div>
                      {deal.score > 0 && (
                        <div className="flex items-center gap-2 text-[12px] text-[#F59E0B]">
                          <TrendingUp className="h-3 w-3" />
                          <span className="font-medium">{deal.score} points</span>
                        </div>
                      )}
                    </div>
                    <Button variant="secondary" size="sm" className="w-full mt-3">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStage.registered.length === 0 && (
              <p className="text-[13px] text-[#A1A1AA] text-center py-4">No registered deals</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-[14px] text-[#09090B]">Bidding</h2>
            <Badge variant="warning">{dealsByStage.bidding.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.bidding.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}/quotes`}>
                <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer bg-[#FFFBEB] border-[#FEF3C7]">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-[14px] text-[#09090B] mb-2 line-clamp-2">{deal.opportunityName}</h3>
                    <p className="text-[12px] text-[#71717A] mb-3">{deal.customerName}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[12px]">
                        <DollarSign className="h-3 w-3 text-[#A1A1AA]" />
                        <span className="font-semibold text-[#09090B]">{formatCurrency(Number(deal.estimatedValue) || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#F59E0B]">
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
              <p className="text-[13px] text-[#A1A1AA] text-center py-4">No bidding deals</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-[14px] text-[#09090B]">Direct Queries</h2>
            <Badge variant="default">{dealsByStage.directQueries.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.directQueries.map((query) => (
              <Link key={query.id} href={`/reseller/queries/${query.id}`}>
                <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-[14px] text-[#09090B] mb-2 line-clamp-2">{query.title}</h3>
                    <p className="text-[12px] text-[#71717A] mb-3 line-clamp-2">{query.requirement}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[12px]">
                        <DollarSign className="h-3 w-3 text-[#A1A1AA]" />
                        <span className="font-semibold text-[#09090B]">{query.estimatedBudget ? formatCurrency(Number(query.estimatedBudget)) : 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px]">
                        <Badge variant="default">{query.urgency || 'MEDIUM'}</Badge>
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
              <p className="text-[13px] text-[#A1A1AA] text-center py-4">No direct queries</p>
            )}
          </div>
        </div>

        {/* Closed Deals Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-[14px] text-[#09090B]">Closed</h2>
            <Badge variant="default">{dealsByStage.closed.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.closed.map((deal) => (
              <Link key={deal.id} href={`/reseller/deals/${deal.id}`}>
                <Card className={`hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer ${
                  deal.status === 'WON' 
                    ? 'bg-[#F0FDF4] border-[#BBF7D0]' 
                    : 'bg-[#FEF2F2] border-[#FECACA]'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-[14px] text-[#09090B] line-clamp-2 flex-1">{deal.opportunityName}</h3>
                      {deal.status === 'WON' ? (
                        <CheckCircle className="h-4 w-4 text-[#22C55E] ml-2 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-[#EF4444] ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[12px] text-[#71717A] mb-2">{deal.customerName}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[12px]">
                        <DollarSign className="h-3 w-3 text-[#A1A1AA]" />
                        <span className="font-semibold text-[#09090B]">{formatCurrency(Number(deal.estimatedValue) || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px]">
                        <Badge variant={deal.status === 'WON' ? 'success' : 'error'}>
                          {deal.status}
                        </Badge>
                      </div>
                      {deal.status === 'WON' && deal.wonQuoteId && wonDistributors[deal.wonQuoteId] && (
                        <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-green-200">
                          <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-green-800">
                            Won by: {wonDistributors[deal.wonQuoteId]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full mt-3"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {dealsByStage.closed.length === 0 && (
              <p className="text-[13px] text-[#A1A1AA] text-center py-4">No closed deals</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
