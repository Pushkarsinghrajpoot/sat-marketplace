'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Handshake, FileText, DollarSign, MoreVertical, Play, Pause, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getCampaigns, updateCampaign } from '@/lib/data-helpers';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user?.organizationId) return;
    
    try {
      const data = await getCampaigns({ distributorId: user.organizationId });
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseCampaign = async (campaignId: string, campaignName: string) => {
    try {
      await updateCampaign(campaignId, { status: 'PAUSED' });
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, status: 'PAUSED' } : c
      ));
      toast.success(`Campaign "${campaignName}" paused successfully`);
    } catch (error) {
      console.error('Error pausing campaign:', error);
      toast.error('Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async (campaignId: string, campaignName: string) => {
    try {
      await updateCampaign(campaignId, { status: 'ACTIVE' });
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, status: 'ACTIVE' } : c
      ));
      toast.success(`Campaign "${campaignName}" resumed successfully`);
    } catch (error) {
      console.error('Error resuming campaign:', error);
      toast.error('Failed to resume campaign');
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return c.status === 'ACTIVE';
    if (activeTab === 'scheduled') return c.status === 'SCHEDULED';
    if (activeTab === 'ended') return c.status === 'COMPLETED' || c.status === 'CANCELLED';
    return true;
  });

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
            { key: 'active', label: 'Active', count: campaigns.filter(c => c.status === 'ACTIVE').length },
            { key: 'scheduled', label: 'Scheduled', count: campaigns.filter(c => c.status === 'SCHEDULED').length },
            { key: 'ended', label: 'Ended', count: campaigns.filter(c => c.status === 'COMPLETED' || c.status === 'CANCELLED' || c.status === 'PAUSED').length },
            { key: 'all', label: 'All', count: campaigns.length },
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
        {filteredCampaigns.map((campaign) => (
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
                        <span>{campaign.targetAudienceType || 'All Resellers'}</span>
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
                        <p className="text-2xl font-bold text-gray-900">{campaign.analyticsViews || 0}</p>
                        <p className="text-xs text-gray-600">Views</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Handshake className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{campaign.analyticsEngagements || 0}</p>
                        <p className="text-xs text-gray-600">Engagements</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{campaign.analyticsQuotes || 0}</p>
                        <p className="text-xs text-gray-600">Quotes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{campaign.analyticsConversions || 0}</p>
                        <p className="text-xs text-gray-600">Conversions</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Engagement Rate</span>
                      <span className="font-semibold">
                        {campaign.analyticsViews > 0 
                          ? Math.round((campaign.analyticsEngagements / campaign.analyticsViews) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${campaign.analyticsViews > 0 
                            ? Math.round((campaign.analyticsEngagements / campaign.analyticsViews) * 100)
                            : 0}%` 
                        }}
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
                    {campaign.status === 'ACTIVE' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePauseCampaign(campaign.id, campaign.name)}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : campaign.status === 'PAUSED' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResumeCampaign(campaign.id, campaign.name)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    ) : null}
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
