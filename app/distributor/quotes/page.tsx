'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, FileText, Eye, Edit, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { getQuotes, getBOQs } from '@/lib/data-helpers';
import { useAuth } from '@/lib/auth-context';

export default function QuotesPage() {
  const [activeTab, setActiveTab] = useState('boqs');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [boqs, setBOQs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.organizationId) return;
    
    try {
      console.log('Fetching quotes and BOQs for distributor:', user.organizationId);
      const [quotesData, boqsData] = await Promise.all([
        getQuotes({ distributorId: user.organizationId }),
        getBOQs({ distributorId: user.organizationId })
      ]);
      
      console.log('Fetched quotes:', quotesData.length);
      console.log('Fetched BOQs:', boqsData.length, boqsData);
      
      setQuotes(quotesData);
      setBOQs(boqsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // No sample data - use only real database quotes

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TO_SUBMIT': return 'warning';
      case 'SUBMITTED': return 'info';
      case 'UNDER_REVIEW': return 'default';
      case 'WON': return 'success';
      case 'LOST': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Management</h1>
        <p className="text-gray-600">Manage your quotes and proposals</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 border-b border-gray-200">
          {[
            { key: 'boqs', label: 'BOQ Requests', count: boqs.length },
            { key: 'to-submit', label: 'To Submit', count: quotes.filter(q => q.status === 'TO_SUBMIT').length },
            { key: 'submitted', label: 'Submitted', count: quotes.filter(q => q.status === 'SUBMITTED').length },
            { key: 'won', label: 'Won', count: quotes.filter(q => q.status === 'WON').length },
            { key: 'lost', label: 'Lost', count: quotes.filter(q => q.status === 'LOST').length },
            { key: 'all', label: 'All Quotes', count: quotes.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by customer, reseller, or deal..."
                className="pl-10"
              />
            </div>
            <Select>
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Oldest</option>
              <option value="value-high">Value: High to Low</option>
              <option value="value-low">Value: Low to High</option>
              <option value="expiring">Expiring Soon</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Loading data...</p>
            </CardContent>
          </Card>
        ) : activeTab === 'boqs' ? (
          // BOQ Display Section
          boqs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">No BOQ requests found</p>
                <p className="text-sm text-gray-500 mt-2">BOQs from resellers will appear here for you to quote</p>
              </CardContent>
            </Card>
          ) : (
            boqs.map((boq) => (
              <Card key={boq.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">BOQ-{boq.id.slice(-8)}</h3>
                        <Badge variant="info">BOQ Request</Badge>
                        <Badge variant={boq.visibility === 'PUBLIC' ? 'success' : 'warning'}>
                          {boq.visibility}
                        </Badge>
                      </div>
                      <div className="space-y-1">
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
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {boq.deal?.estimatedValue ? formatCurrency(boq.deal.estimatedValue) : 'TBD'}
                      </p>
                      <p className="text-sm text-gray-500">Estimated Value</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Created</p>
                      <p className="font-semibold text-sm">{formatRelativeTime(boq.createdAt)}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Deal Type</p>
                      <p className="font-semibold text-sm">{boq.deal?.dealType || 'Unknown'}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <p className="font-semibold text-sm">{boq.deal?.status || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(boq.fileUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View BOQ Details
                    </Button>
                    <Link href={`/distributor/quotes/create?boqId=${boq.id}&dealId=${boq.dealId}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Create Quote
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : (
          // Quotes Display Section
          (() => {
            const filteredQuotes = quotes.filter((q: any) => {
              if (activeTab === 'all') return true;
              if (activeTab === 'to-submit') return q.status === 'TO_SUBMIT';
              if (activeTab === 'submitted') return q.status === 'SUBMITTED';
              if (activeTab === 'won') return q.status === 'WON';
              if (activeTab === 'lost') return q.status === 'LOST';
              return true;
            });

            if (filteredQuotes.length === 0) {
              return (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-semibold">No quotes found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {activeTab === 'all' 
                        ? 'Start creating quotes for your deals'
                        : `No ${activeTab.replace('-', ' ')} quotes at this time`
                      }
                    </p>
                  </CardContent>
                </Card>
              );
            }

            return filteredQuotes.map((quote: any) => (
          <Card key={quote.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{quote.id}</h3>
                    <Badge variant={getStatusColor(quote.status)}>
                      {quote.status.replace('_', ' ')}
                    </Badge>
                    {quote.status === 'TO_SUBMIT' && (
                      <Badge variant="danger" className="animate-pulse">
                        Action Required
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-700">{quote.dealName}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Customer: {quote.customer}</span>
                      <span>•</span>
                      <span>Reseller: {quote.reseller}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(quote.value)}</p>
                  <p className="text-sm text-gray-500">{quote.lineItems} line items</p>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Valid Until</p>
                  <p className="font-semibold text-sm">{quote.validUntil}</p>
                  <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Expires in 5 days</span>
                  </div>
                </div>

                {quote.competitors && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Competition</p>
                    <p className="font-semibold text-sm">{quote.competitors} other quotes</p>
                    {quote.rank && (
                      <p className="text-xs text-blue-600 mt-1">{quote.rank}</p>
                    )}
                  </div>
                )}

                {quote.difference !== undefined && quote.difference !== 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">vs Average</p>
                    <p className="font-semibold text-sm text-green-700">{formatCurrency(quote.difference)}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Better pricing</span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Created</p>
                  <p className="font-semibold text-sm">{formatRelativeTime(quote.createdAt)}</p>
                  {quote.submittedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted {formatRelativeTime(quote.submittedAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/distributor/quotes/${quote.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
                
                {quote.status === 'TO_SUBMIT' && (
                  <>
                    <Link href={`/distributor/quotes/${quote.id}/edit`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Complete & Submit
                      </Button>
                    </Link>
                  </>
                )}
                
                {quote.status === 'SUBMITTED' && (
                  <Button variant="outline" size="sm">
                    Update Quote
                  </Button>
                )}

                {quote.status === 'WON' && (
                  <Button variant="secondary" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
            ));
          })()
        )}
      </div>
    </div>
  );
}
