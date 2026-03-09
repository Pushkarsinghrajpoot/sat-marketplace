'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Search, Send, TrendingUp, Eye, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getDeals, getDirectQueries } from '@/lib/data-helpers';
import { useSimpleAuth } from '@/lib/simple-auth';

export default function EndUserDashboard() {
  const [activeTab, setActiveTab] = useState<'registrations' | 'bidding' | 'queries'>('registrations');
  const [stats, setStats] = useState({
    dealRegistrations: 0,
    biddingDeals: 0,
    directQueries: 0,
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

        const registrations = deals.filter((d: any) => d.deal_type === 'DEAL_REGISTRATION');
        const bidding = deals.filter((d: any) => d.deal_type === 'BIDDING');
        
        setStats({
          dealRegistrations: registrations.length,
          biddingDeals: bidding.length,
          directQueries: queries.length,
        });
        
        setDealRegistrations(registrations);
        setBiddingDeals(bidding);
        setDirectQueries(queries);
      } catch (error) {
        console.error('Error fetching end-user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return (
    <div className="p-6 lg:p-8">
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-blue-900 mb-1">View-Only Access</p>
              <p className="text-xs text-blue-800">
                You have read-only access to view deals, quotes, and activities. You cannot create or modify any deals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">View deals and queries from your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.dealRegistrations}</p>
              <p className="text-sm text-gray-600 mt-1">Deal Registrations</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.biddingDeals}</p>
              <p className="text-sm text-gray-600 mt-1">Bidding Deals</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Send className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.directQueries}</p>
              <p className="text-sm text-gray-600 mt-1">Direct Queries</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">View Deals & Queries</h2>

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
              <Badge variant="info">{stats.dealRegistrations}</Badge>
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
              <Badge variant="warning">{stats.biddingDeals}</Badge>
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
              <Badge variant="default">{stats.directQueries}</Badge>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'registrations' && (
        <div className="space-y-4">
          {dealRegistrations.length > 0 ? (
            dealRegistrations.map((deal: any) => (
              <Card key={deal.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
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
                            Score: {deal.score}/100
                          </span>
                        )}
                        {deal.priority === 'GOLD' && (
                          <Badge variant="warning">Gold Deal</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{deal.customerCompany}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Lock Information</p>
                      <div className="text-sm">
                        <p>Locked By: <span className="font-medium">{deal.lockedBy || 'Not locked'}</span></p>
                        <p>Lock Date: <span className="font-medium">{deal.lockedAt ? new Date(deal.lockedAt).toLocaleDateString() : 'N/A'}</span></p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Deal Details</p>
                      <div className="text-sm">
                        <p>Value: <span className="font-medium">{formatCurrency(deal.estimatedValue)}</span></p>
                        <p>Close Date: <span className="font-medium">{deal.closeDate}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      <span>View-only access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No deal registrations to view</p>
                <p className="text-sm text-gray-500">Resellers from your organization will register deals</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'bidding' && (
        <div className="space-y-4">
          {biddingDeals.length > 0 ? (
            biddingDeals.map((deal: any) => (
              <Card key={deal.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{deal.opportunityName}</h3>
                      <p className="text-sm text-gray-600 mb-3">{deal.customerCompany}</p>
                    </div>
                    <Badge variant="warning">Bidding</Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Deal Information</p>
                      <div className="text-sm">
                        <p>Value: <span className="font-medium">{formatCurrency(deal.estimatedValue)}</span></p>
                        <p>Created: <span className="font-medium">{new Date(deal.createdAt).toLocaleDateString()}</span></p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <div className="text-sm">
                        <p>Status: <span className="font-medium">{deal.status}</span></p>
                        <p>Quotes: <span className="font-medium">{deal.quotes?.length || 0}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      <span>View-only access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No bidding deals to view</p>
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
              <Card key={query.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{query.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{query.requirement}</p>
                    </div>
                    <Badge variant="info">{query.status}</Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Query Details</p>
                      <div className="text-sm">
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Urgency: <span className="font-medium">{query.urgency}</span>
                        </p>
                        <p>Created: <span className="font-medium">{new Date(query.createdAt).toLocaleDateString()}</span></p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Responses</p>
                      <div className="text-sm">
                        <p>Total: <span className="font-medium">{query.responses?.length || 0}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      <span>View-only access</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No queries to view</p>
                <p className="text-sm text-gray-500">Direct queries will appear here</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="mt-8 bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-yellow-900 mb-2">Restricted Actions</p>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• Cannot create deal registrations or bidding deals</li>
                <li>• Cannot send direct queries to distributors</li>
                <li>• Cannot lock deals or upload BOQs</li>
                <li>• Cannot perform activities or acknowledge/reject requests</li>
                <li>• Can only view deals and queries from your organization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
