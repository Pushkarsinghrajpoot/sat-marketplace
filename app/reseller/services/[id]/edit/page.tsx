'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    pricing: '',
    pricingType: 'PROJECT',
    status: 'DRAFT',
  });

  const categories = [
    'Professional Services',
    'Cloud Services',
    'Infrastructure',
    'Security',
    'Consulting',
    'Support',
    'Training',
    'Other'
  ];

  useEffect(() => {
    // Simulate fetching service data
    const mockService = {
      id: params.id,
      name: 'IT Consulting Services',
      category: 'Professional Services',
      description: 'End-to-end IT consulting for enterprise clients. We provide comprehensive IT solutions including infrastructure assessment, system design, implementation, and ongoing support.',
      pricing: 'Starting at $5,000/project',
      pricingType: 'PROJECT',
      status: 'ACTIVE',
    };

    setTimeout(() => {
      setFormData(mockService);
      setFetchLoading(false);
    }, 500);
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.description || !formData.pricing) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, this would update the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Service updated successfully!');
      router.push(`/reseller/services/${params.id}`);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
            <p className="text-gray-600">Update your service details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Service Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., IT Consulting Services"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    placeholder="Describe your service in detail..."
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Pricing Type</label>
                  <Select
                    value={formData.pricingType}
                    onChange={(e) => setFormData({...formData, pricingType: e.target.value})}
                  >
                    <option value="PROJECT">Project-based</option>
                    <option value="HOURLY">Hourly</option>
                    <option value="MONTHLY">Monthly Retainer</option>
                    <option value="CUSTOM">Custom Quote</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Pricing *</label>
                  <Input
                    value={formData.pricing}
                    onChange={(e) => setFormData({...formData, pricing: e.target.value})}
                    placeholder="e.g., $5,000/project or $150/hour"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publishing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="DRAFT">Draft (Not Published)</option>
                    <option value="ACTIVE">Active (Published)</option>
                  </Select>
                </div>

                {formData.status === 'ACTIVE' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This service will be visible to clients once published.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
