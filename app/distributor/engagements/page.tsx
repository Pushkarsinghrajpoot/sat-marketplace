'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Star, CheckCircle, Target, Clock, Package } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function EngagementsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  
  const engagements = [
    {
      id: '1',
      reseller: 'ABC Resellers Inc.',
      resellerLogo: 'A',
      rating: 4.5,
      verified: true,
      deal: {
        title: 'Enterprise Network Upgrade - XYZ Corp',
        value: 125000,
        closeDate: '2024-03-15',
        customer: 'XYZ Corporation',
        industry: 'Healthcare',
      },
      products: ['Cisco Catalyst 9300', 'Fortinet FortiGate 600E', 'NetApp Storage'],
      effort: { dealRegistered: true, boqUploaded: true, timeInvested: 15, customerVerified: true },
      message: 'Looking for best pricing on Cisco Catalyst switches for healthcare client. Need quote by Jan 20.',
      status: 'PENDING',
      requestedAt: '2024-01-18T10:30:00Z',
    },
    {
      id: '2',
      reseller: 'Premier Solutions Group',
      resellerLogo: 'P',
      rating: 4.9,
      verified: true,
      deal: {
        title: 'Data Center Modernization',
        value: 450000,
        closeDate: '2024-04-10',
        customer: 'Tech Corp',
        industry: 'Technology',
      },
      products: ['Dell PowerEdge R750', 'NetApp AFF A400'],
      effort: { dealRegistered: true, boqUploaded: true, timeInvested: 22, customerVerified: true },
      message: 'Major data center upgrade project. Multiple locations. Need comprehensive quote with support.',
      status: 'PENDING',
      requestedAt: '2024-01-17T14:20:00Z',
    },
  ];

  const handleAccept = (id: string) => {
    toast.success('Engagement request accepted! You can now submit a quote.');
  };

  const handleDecline = (id: string) => {
    toast.info('Engagement request declined');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Engagement Requests</h1>
        <p className="text-gray-600">Review and respond to engagement requests from resellers</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 border-b border-gray-200">
          {[
            { key: 'pending', label: 'Pending', count: 12 },
            { key: 'accepted', label: 'Accepted', count: 45 },
            { key: 'declined', label: 'Declined', count: 8 },
            { key: 'all', label: 'All', count: 65 },
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

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by reseller name or deal..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {engagements.map((engagement) => (
          <Card key={engagement.id} className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {engagement.resellerLogo}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{engagement.reseller}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({engagement.rating})</span>
                    {engagement.verified && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">{engagement.deal.title}</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    <span>{engagement.deal.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{formatCurrency(engagement.deal.value)}</span>
                    <span>•</span>
                    <span>Close: {engagement.deal.closeDate}</span>
                  </div>
                  <div>
                    <Badge variant="info" className="text-xs">{engagement.deal.industry}</Badge>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Products Requested:</p>
                <div className="flex items-center gap-1 text-xs">
                  <Package className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{engagement.products.length} products</span>
                </div>
                <div className="mt-2 space-y-1">
                  {engagement.products.slice(0, 2).map((product, idx) => (
                    <p key={idx} className="text-xs text-gray-700">• {product}</p>
                  ))}
                  {engagement.products.length > 2 && (
                    <p className="text-xs text-blue-600">+{engagement.products.length - 2} more</p>
                  )}
                </div>
              </div>

              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-800 mb-2">Effort Signals:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">Deal Registered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">BOQ Uploaded</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">{engagement.effort.timeInvested} days active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">Customer Verified</span>
                  </div>
                </div>
                <Badge variant="success" className="mt-2 text-xs">High Effort Score</Badge>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-1">Message:</p>
                <p className="text-xs text-gray-600 italic">"{engagement.message}"</p>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Requested {formatRelativeTime(engagement.requestedAt)}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleAccept(engagement.id)}
                >
                  Accept & Quote
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDecline(engagement.id)}
                >
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
