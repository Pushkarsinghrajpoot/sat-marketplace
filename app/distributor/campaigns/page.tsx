'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Handshake, FileText, DollarSign, MoreVertical, Play, Pause, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('active');
  
  const campaigns = [
    {
      id: '1',
      name: 'Q1 Networking Promotion',
      status: 'ACTIVE',
      startDate: '2024-01-15',
      endDate: '2024-03-31',
      targetAudience: '250 qualified resellers',
      products: 12,
      analytics: { views: 1240, engagements: 45, quotes: 12, conversions: 5 },
      progress: 20,
    },
    {
      id: '2',
      name: 'Spring Security Sale',
      status: 'ACTIVE',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      targetAudience: '180 qualified resellers',
      products: 8,
      analytics: { views: 890, engagements: 32, quotes: 8, conversions: 3 },
      progress: 15,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Management</h1>
          <p className="text-gray-600">Create and manage your marketing campaigns</p>
        </div>
        <Link href="/distributor/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 border-b border-gray-200">
          {[
            { key: 'active', label: 'Active', count: 12 },
            { key: 'scheduled', label: 'Scheduled', count: 5 },
            { key: 'ended', label: 'Ended', count: 48 },
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

      <div className="space-y-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                        <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'default'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{campaign.startDate} - {campaign.endDate}</span>
                        <span>•</span>
                        <span>{campaign.targetAudience}</span>
                        <span>•</span>
                        <span>{campaign.products} products</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-6 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{campaign.analytics.views}</p>
                        <p className="text-xs text-gray-600">Views</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Handshake className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{campaign.analytics.engagements}</p>
                        <p className="text-xs text-gray-600">Engagements</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{campaign.analytics.quotes}</p>
                        <p className="text-xs text-gray-600">Quotes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{campaign.analytics.conversions}</p>
                        <p className="text-xs text-gray-600">Conversions</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress to goal</span>
                      <span className="font-semibold">{campaign.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/distributor/campaigns/${campaign.id}/analytics`}>
                      <Button variant="outline" size="sm">
                        View Analytics
                      </Button>
                    </Link>
                    <Link href={`/distributor/campaigns/${campaign.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Campaign
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">Create your first campaign to target qualified resellers with special offers</p>
              <Link href="/distributor/campaigns/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
