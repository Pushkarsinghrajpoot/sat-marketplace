'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, DollarSign, Users, ArrowRight, Plus, Lock, Search, Send, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { getDeals, getDirectQueries, getQuotes } from '@/lib/data-helpers';
import { useAuthStore } from '@/lib/store';

export default function DistributorDashboard() {
  const [activeTab, setActiveTab] = useState<'registrations' | 'bidding' | 'queries' | 'quotes'>('registrations');
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeQuotes: 0,
    monthlyRevenue: 328000,
    activeCustomers: 89,
    dealRegistrations: 0,
    biddingDeals: 0,
    directQueries: 0,
  });

  const [dealRegistrations, setDealRegistrations] = useState<any[]>([]);
  const [biddingDeals, setBiddingDeals] = useState<any[]>([]);
  const [directQueries, setDirectQueries] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;

      try {
        // Distributors should see ALL deals (not filtered by userId)
        // They see deals they can engage with, not deals they created
        const [deals, queries, quotes] = await Promise.all([
          getDeals({}), // Fetch all deals for distributor view
          getDirectQueries({}), // Fetch all queries for distributor view
          getQuotes({ distributorId: user.organizationId }),
        ]);

        const registrations = deals.filter((d: any) => d.deal_type === 'DEAL_REGISTRATION');
        const bidding = deals.filter((d: any) => d.deal_type === 'BIDDING');
        
        const activeQuotes = quotes.filter((q: any) => q.status === 'SUBMITTED' || q.status === 'PENDING');
        const monthlyRevenue = quotes
          .filter((q: any) => q.status === 'ACCEPTED')
          .reduce((sum, q) => sum + (q.total_amount || 0), 0);
        
        setStats({
          totalProducts: 0,
          activeQuotes: activeQuotes.length,
          monthlyRevenue,
          activeCustomers: new Set(deals.map((d: any) => d.reseller_id)).size,
          dealRegistrations: registrations.length,
          biddingDeals: bidding.length,
          directQueries: queries.length,
        });
        
        setDealRegistrations(registrations);
        setBiddingDeals(bidding);
        setDirectQueries(queries);
        setQuotes(quotes);
      } catch (error) {
        console.error('Error fetching distributor data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const salesByCategory = [
    { category: 'Networking', sales: 35 },
    { category: 'Security', sales: 25 },
    { category: 'Storage', sales: 20 },
    { category: 'Servers', sales: 15 },
    { category: 'Cloud', sales: 5 },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Good morning 👋</h1>
        <p className="text-gray-600">Here's what's happening with your business today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/distributor/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-gray-600 mt-1">Total Products</p>
                <p className="text-xs text-blue-600 mt-2">Click to manage</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributor/quotes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.activeQuotes}</p>
                <p className="text-sm text-gray-600 mt-1">Active Quotes</p>
                <p className="text-xs text-green-600 mt-2">Click to view</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributor/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-sm text-gray-600 mt-1">Monthly Revenue</p>
                <p className="text-xs text-purple-600 mt-2">+12% from last month</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributor/engagements">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.activeCustomers}</p>
                <p className="text-sm text-gray-600 mt-1">Active Customers</p>
                <p className="text-xs text-orange-600 mt-2">Click to manage</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Deal Pipeline</h2>

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
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{stats.dealRegistrations}</span>
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
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{stats.biddingDeals}</span>
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
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{stats.directQueries}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'quotes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Quotes
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">{stats.activeQuotes}</span>
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
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Acknowledge</Button>
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
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Created: {new Date(deal.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Value: {formatCurrency(deal.estimatedValue)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Submit Quote</Button>
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
                          <span>Responses: {query.responses?.length || 0}</span>
                        </div>
                      </div>
                      <Button size="sm">Respond</Button>
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
            {quotes.length > 0 ? (
              quotes.map((quote: any) => (
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
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No quotes yet</p>
                  <p className="text-sm text-gray-500">Your submitted quotes will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Trend</CardTitle>
              <Link href="/distributor/analytics">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0066CC" strokeWidth={2} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales by Category</CardTitle>
              <Link href="/distributor/analytics">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#0066CC" name="Sales (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
