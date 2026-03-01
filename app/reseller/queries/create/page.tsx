'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Send, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export default function CreateQueryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    requirement: '',
    estimatedBudget: '',
    urgency: 'MEDIUM',
  });

  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, rating, verified')
        .eq('type', 'DISTRIBUTOR')
        .eq('verified', true);
      
      if (error) throw error;
      setDistributors(data || []);
    } catch (error) {
      console.error('Error fetching distributors:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.requirement) {
      toast.error('Please fill in required fields');
      return;
    }

    if (selectedDistributors.length === 0) {
      toast.error('Please select at least one distributor');
      return;
    }

    if (!user?.id || !user?.organizationId) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);

    try {
      // Create a query for each selected distributor
      const queries = selectedDistributors.map(distributorId => ({
        reseller_id: user.id,
        reseller_organization_id: user.organizationId,
        distributor_id: distributorId,
        title: formData.title,
        requirement: formData.requirement,
        estimated_budget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : null,
        urgency: formData.urgency,
        status: 'OPEN',
      }));

      const { error } = await supabase
        .from('direct_queries')
        .insert(queries);

      if (error) throw error;

      toast.success(`Direct query sent to ${selectedDistributors.length} distributor(s)!`);
      router.push('/reseller/queries');
    } catch (error) {
      console.error('Error creating query:', error);
      toast.error('Failed to send query');
    } finally {
      setLoading(false);
    }
  };

  const toggleDistributor = (id: string) => {
    setSelectedDistributors(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Direct Query</h1>
          <p className="text-gray-600">Send a query directly to distributors for quick response</p>
        </div>

        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-blue-900 mb-2">About Direct Queries</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• No customer verification required</li>
              <li>• No deal locking or scoring</li>
              <li>• Quick responses from distributors</li>
              <li>• Ideal for general inquiries and pricing requests</li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Query Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Network Equipment Pricing Request"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Requirement Details *</label>
                <Textarea
                  value={formData.requirement}
                  onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                  rows={6}
                  placeholder="Describe your requirements in detail..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Budget (Optional)</label>
                  <Input
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Urgency</label>
                  <Select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option value="LOW">Low - Response within 1 week</option>
                    <option value="MEDIUM">Medium - Response within 3 days</option>
                    <option value="HIGH">High - Response within 24 hours</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Distributors</CardTitle>
              <p className="text-sm text-gray-600">Choose distributors to send your query</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search distributors..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {distributors
                  .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((dist) => (
                  <Card
                    key={dist.id}
                    className={`cursor-pointer transition-all ${
                      selectedDistributors.includes(dist.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => toggleDistributor(dist.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedDistributors.includes(dist.id)}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{dist.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              {dist.rating?.toFixed(1) || 'N/A'}
                            </span>
                            {dist.verified && <span className="text-green-600 text-xs">✓ Verified</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedDistributors.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-900 font-semibold">
                      {selectedDistributors.length} distributor{selectedDistributors.length > 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs text-green-800 mt-1">
                      Your query will be sent to the selected distributors
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Query'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
