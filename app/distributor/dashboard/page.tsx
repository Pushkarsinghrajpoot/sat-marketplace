'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingCart, DollarSign, Users, ArrowRight, Plus, Lock, Search, Send, TrendingUp, Clock, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getDeals, getDirectQueries, getQuotes, getBOQs } from '@/lib/data-helpers';
import { useSimpleAuth } from '@/lib/simple-auth';

export default function DistributorDashboard() {
  const [activeTab, setActiveTab] = useState<'registrations' | 'bidding' | 'queries' | 'quotes' | 'boqs'>('registrations');
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeQuotes: 0,
    monthlyRevenue: 328000,
    activeCustomers: 89,
    dealRegistrations: 0,
    biddingDeals: 0,
    directQueries: 0,
    boqs: 0,
  });

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
        // Distributors should see ALL deals (not filtered by userId)
        // They see deals they can engage with, not deals they created
        const [deals, queries, quotes, boqData] = await Promise.all([
          getDeals({}), // Fetch all deals for distributor view
          getDirectQueries({}), // Fetch all queries for distributor view
          getQuotes({ distributorId: user.organizationId }),
          getBOQs({ distributorId: user.organizationId }),
        ]);

        console.log('Dashboard - Fetched BOQs:', boqData.length, boqData);

        const registrations = deals.filter((d: any) => d.dealType === 'DEAL_REGISTRATION');
        const bidding = deals.filter((d: any) => d.dealType === 'BIDDING');
        
        const activeQuotes = quotes.filter((q: any) => q.status === 'SUBMITTED' || q.status === 'PENDING');
        const monthlyRevenue = quotes
          .filter((q: any) => q.status === 'ACCEPTED')
          .reduce((sum, q) => sum + (q.total || 0), 0);
        
        setStats({
          totalProducts: 0,
          activeQuotes: activeQuotes.length,
          monthlyRevenue,
          activeCustomers: new Set(deals.map((d: any) => d.resellerId)).size,
          dealRegistrations: registrations.length,
          biddingDeals: bidding.length,
          directQueries: queries.length,
          boqs: boqData.length,
        });
        
        setDealRegistrations(registrations);
        setBiddingDeals(bidding);
        setDirectQueries(queries);
        setQuotes(quotes);
        setBoqs(boqData);
      } catch (error) {
        console.error('Error fetching distributor data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#09090B] mb-1">Good morning 👋</h1>
        <p className="text-[14px] text-[#71717A]">Here's what's happening with your business today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/distributor/products">
          <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-md flex items-center justify-center">
                  <Package className="h-5 w-5 text-[#6366F1]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[#A1A1AA]" />
              </div>
              <div>
                <p className="text-[32px] font-bold text-[#09090B] leading-none">{stats.totalProducts}</p>
                <p className="text-[12px] text-[#71717A] mt-2">Total Products</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributor/quotes">
          <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#F0FDF4] rounded-md flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-[#22C55E]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[#A1A1AA]" />
              </div>
              <div>
                <p className="text-[32px] font-bold text-[#09090B] leading-none">{stats.activeQuotes}</p>
                <p className="text-[12px] text-[#71717A] mt-2">Active Quotes</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributor/quotes">
          <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#FFFBEB] rounded-md flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-[#F59E0B]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[#A1A1AA]" />
              </div>
              <div>
                <p className="text-[32px] font-bold text-[#09090B] leading-none">{stats.boqs}</p>
                <p className="text-[12px] text-[#71717A] mt-2">BOQ Requests</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributor/analytics">
          <Card className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#EFF6FF] rounded-md flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#2563EB]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[#A1A1AA]" />
              </div>
              <div>
                <p className="text-[32px] font-bold text-[#09090B] leading-none">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-[12px] text-[#71717A] mt-2">Monthly Revenue</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-[#09090B] mb-6">Deal Pipeline</h2>

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
              <Badge variant="info">{stats.dealRegistrations}</Badge>
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
              <Badge variant="warning">{stats.biddingDeals}</Badge>
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
              <Badge variant="success">{stats.directQueries}</Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-3 text-[14px] font-medium transition-colors ${
              activeTab === 'quotes'
                ? 'text-[#09090B] border-b-2 border-[#6366F1]'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Quotes
              <Badge variant="default">{stats.activeQuotes + stats.boqs}</Badge>
            </div>
          </button>
        </div>

        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {dealRegistrations.length > 0 ? (
              dealRegistrations.map((deal: any) => (
                <Card key={deal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{deal.opportunityName}</h3>
                          {deal.isLocked && (
                            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              <Lock className="h-3 w-3" />
                              Locked
                            </span>
                          )}
                          {deal.score > 0 && (
                            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              <TrendingUp className="h-3 w-3" />
                              Score: {deal.score}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{deal.customerCompany}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Locked by: {deal.lockedBy || 'N/A'}</span>
                          <span>•</span>
                          <span>Date: {deal.lockedAt ? new Date(deal.lockedAt).toLocaleDateString() : 'N/A'}</span>
                          <span>•</span>
                          <span>Value: {formatCurrency(deal.estimatedValue)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/distributor/deals/${deal.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                        <Link href="/distributor/activities">
                          <Button size="sm">Acknowledge</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No deal registrations yet</p>
                  <p className="text-sm text-gray-500">Resellers will register deals here</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'bidding' && (
          <div className="space-y-4">
            {biddingDeals.length > 0 ? (
              biddingDeals.map((deal: any) => (
                <Card key={deal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{deal.opportunityName}</h3>
                        <p className="text-sm text-gray-600 mb-3">{deal.customerCompany}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span>Created: {new Date(deal.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Value: {formatCurrency(deal.estimatedValue)}</span>
                        </div>
                        
                        {/* Effort Signals */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {deal.isLocked && (
                            <Badge variant="success" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Deal Registered
                            </Badge>
                          )}
                          {deal.isVerified && (
                            <Badge variant="success" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Customer Verified
                            </Badge>
                          )}
                          {deal.score > 0 && (
                            <Badge variant="info" className="text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Score: {deal.score}
                            </Badge>
                          )}
                          <Badge variant={deal.score >= 100 ? 'success' : deal.score >= 50 ? 'warning' : 'default'} className="text-xs">
                            {deal.score >= 100 ? 'High' : deal.score >= 50 ? 'Medium' : 'Low'} Effort
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/distributor/deals/${deal.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                        <Link href={`/distributor/quotes/create?dealId=${deal.id}`}>
                          <Button size="sm">Submit Quote</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No bidding deals yet</p>
                  <p className="text-sm text-gray-500">Open bidding opportunities will appear here</p>
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{query.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{query.requirement}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {query.urgency}
                          </span>
                          <span>•</span>
                          <span>Budget: {query.estimated_budget ? formatCurrency(query.estimated_budget) : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/distributor/queries/${query.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                        <Link href={`/distributor/queries/${query.id}/respond`}>
                          <Button size="sm">Respond</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Send className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No direct queries yet</p>
                  <p className="text-sm text-gray-500">Direct queries from resellers will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="space-y-4">
            {/* Show BOQs first */}
            {boqs.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">BOQ Requests</h3>
                {boqs.map((boq: any) => (
                  <Card key={boq.id} className="hover:shadow-md transition-shadow border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">BOQ-{boq.id.slice(-8)}</h3>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">BOQ Request</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              boq.visibility === 'BIDDING' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {boq.visibility}
                            </span>
                          </div>
                          <div className="space-y-1 mb-2">
                            <p className="font-semibold text-gray-700">{boq.deal?.opportunityName || 'Deal Opportunity'}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Customer: {boq.deal?.customerName || 'Unknown'}</span>
                              <span>•</span>
                              <span>Reseller: {boq.reseller?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>File: {boq.fileName}</span>
                              <span>•</span>
                              <span>Items: {boq.items?.length || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Created: {new Date(boq.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Value: {boq.deal?.estimatedValue ? formatCurrency(boq.deal.estimatedValue) : 'TBD'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(boq.fileUrl, '_blank')}
                          >
                            View BOQ
                          </Button>
                          <Link href={`/distributor/quotes/create?boqId=${boq.id}&dealId=${boq.dealId}`}>
                            <Button size="sm">Create Quote</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Show regular quotes */}
            {quotes.length > 0 && (
              <>
                {boqs.length > 0 && <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Submitted Quotes</h3>}
                {quotes.map((quote: any) => (
                  <Card key={quote.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">Quote #{quote.id.substring(0, 8)}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              quote.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                              quote.status === 'WON' ? 'bg-green-100 text-green-800' :
                              quote.status === 'LOST' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {quote.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <span>Total: {formatCurrency(quote.total || 0)}</span>
                            <span>•</span>
                            <span>Created: {new Date(quote.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/distributor/quotes/${quote.id}`}>
                            <Button size="sm" variant="outline">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Show empty state if no BOQs and no quotes */}
            {boqs.length === 0 && quotes.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No quotes or BOQ requests yet</p>
                  <p className="text-sm text-gray-500">BOQ requests and your submitted quotes will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Analytics Overview</CardTitle>
            <Link href="/distributor/analytics">
              <Button variant="ghost" size="sm">View Detailed Analytics</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-2">Analytics Coming Soon</p>
            <p className="text-sm text-gray-500">
              Revenue trends and sales analytics will be available once you have quote and order data
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quick Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/distributor/products/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Link href="/distributor/campaigns/new">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
            <Link href="/distributor/engagements">
              <Button variant="outline" className="w-full">
                View Engagements
              </Button>
            </Link>
            <Link href="/distributor/quotes">
              <Button variant="outline" className="w-full">
                Manage Quotes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
