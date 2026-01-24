'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, FileText, Eye, Edit, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

export default function QuotesPage() {
  const [activeTab, setActiveTab] = useState('to-submit');
  
  const quotes = [
    {
      id: 'Q-2024-1234',
      customer: 'XYZ Corporation',
      reseller: 'ABC Resellers Inc.',
      dealName: 'Enterprise Network Upgrade',
      value: 118500,
      lineItems: 15,
      status: 'TO_SUBMIT',
      validUntil: '2024-02-15',
      competitors: 3,
      rank: '2nd lowest price',
      difference: -2500,
      submittedAt: null,
      createdAt: '2024-01-18T10:00:00Z',
    },
    {
      id: 'Q-2024-1235',
      customer: 'Tech Corp',
      reseller: 'Premier Solutions Group',
      dealName: 'Data Center Modernization',
      value: 445000,
      lineItems: 28,
      status: 'SUBMITTED',
      validUntil: '2024-03-01',
      competitors: 4,
      rank: 'Best price',
      difference: 0,
      submittedAt: '2024-01-17T16:30:00Z',
      createdAt: '2024-01-15T09:00:00Z',
    },
    {
      id: 'Q-2024-1220',
      customer: 'Finance Inc',
      reseller: 'TechVentures LLC',
      dealName: 'Security Infrastructure',
      value: 178000,
      lineItems: 12,
      status: 'WON',
      validUntil: '2024-02-28',
      submittedAt: '2024-01-10T11:20:00Z',
      createdAt: '2024-01-08T14:00:00Z',
    },
  ];

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
            { key: 'to-submit', label: 'To Submit', count: 8 },
            { key: 'submitted', label: 'Submitted', count: 24 },
            { key: 'won', label: 'Won', count: 12 },
            { key: 'lost', label: 'Lost', count: 6 },
            { key: 'all', label: 'All', count: 50 },
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
        {quotes.map((quote) => (
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
        ))}
      </div>
    </div>
  );
}
