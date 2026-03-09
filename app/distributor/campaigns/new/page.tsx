'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleAuth } from '@/lib/simple-auth';
import { toast } from 'sonner';
import { createCampaign } from '@/lib/data-helpers';

export default function NewCampaignPage() {
  const router = useRouter();
  const { user } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetAudience: '',
    selectedProducts: [] as string[],
    discount: 0,
    campaignType: '',
    incentiveType: '',
    targetRevenue: '',
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.organizationId) {
      toast.error('User organization not found');
      return;
    }

    setLoading(true);

    try {
      const campaignData = {
        distributor_id: user.organizationId,
        name: formData.name,
        description: formData.description,
        campaign_type: formData.campaignType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: new Date(formData.startDate) > new Date() ? 'SCHEDULED' : 'ACTIVE',
        target_audience_type: formData.targetAudience,
        incentive_type: formData.incentiveType,
        incentive_discount: formData.discount ? Number(formData.discount) : null,
        goal_target_revenue: formData.targetRevenue ? parseFloat(formData.targetRevenue) : null,
      };

      await createCampaign(campaignData);

      toast.success('Campaign created successfully!');
      router.push('/distributor/campaigns');
      setTimeout(() => router.refresh(), 100);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSubmit}>Launch Campaign</Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Q1 Networking Promotion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Describe your campaign..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Audience</label>
                <Input
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  placeholder="e.g., 250 qualified resellers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount (%)</label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                  placeholder="10"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
