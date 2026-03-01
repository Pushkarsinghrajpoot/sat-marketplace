'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, Handshake, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { getCampaign } from '@/lib/data-helpers';

export default function CampaignAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [params.id]);

  const fetchCampaign = async () => {
    try {
      const data = await getCampaign(params.id as string);
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Failed to load campaign analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-gray-500">Campaign not found</p>
      </div>
    );
  }

  const metrics = [
    { label: 'Views', value: campaign.analyticsViews || 0, icon: Eye, color: 'blue' },
    { label: 'Engagements', value: campaign.analyticsEngagements || 0, icon: Handshake, color: 'green' },
    { label: 'Quotes', value: campaign.analyticsQuotes || 0, icon: FileText, color: 'purple' },
    { label: 'Conversions', value: campaign.analyticsConversions || 0, icon: DollarSign, color: 'orange' },
  ];

  const conversionRate = campaign.analyticsViews > 0 
    ? ((campaign.analyticsConversions / campaign.analyticsViews) * 100).toFixed(2)
    : '0.00';

  const engagementRate = campaign.analyticsViews > 0
    ? ((campaign.analyticsEngagements / campaign.analyticsViews) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push('/distributor/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <p className="text-gray-600 mt-2">{campaign.description}</p>
            </div>
            <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'default'}>
              {campaign.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{campaign.start_date} - {campaign.end_date || 'Ongoing'}</span>
            <span>•</span>
            <span>{campaign.target_audience_type || 'All Resellers'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${metric.color}-100 rounded-lg flex items-center justify-center`}>
                    <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{metric.value.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Engagement Rate</span>
                  <span className="text-lg font-semibold">{engagementRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${Math.min(parseFloat(engagementRate), 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-lg font-semibold">{conversionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue Generated</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(campaign.analytics_revenue || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.goal_target_revenue && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Revenue Goal</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(campaign.analytics_revenue || 0)} / {formatCurrency(campaign.goal_target_revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(((campaign.analytics_revenue || 0) / campaign.goal_target_revenue) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {campaign.goal_target_conversions && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Conversion Goal</span>
                    <span className="text-sm font-semibold">
                      {campaign.analytics_conversions || 0} / {campaign.goal_target_conversions}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(((campaign.analytics_conversions || 0) / campaign.goal_target_conversions) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {!campaign.goal_target_revenue && !campaign.goal_target_conversions && (
                <p className="text-sm text-gray-500">No goals set for this campaign</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Campaign Type</p>
                <p className="font-semibold">{campaign.campaign_type || 'General'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Incentive Type</p>
                <p className="font-semibold">{campaign.incentive_type || 'None'}</p>
              </div>
              {campaign.incentive_discount && (
                <div>
                  <p className="text-sm text-gray-600">Discount</p>
                  <p className="font-semibold">{campaign.incentive_discount}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
