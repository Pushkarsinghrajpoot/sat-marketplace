'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, User, Building2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/lib/simple-auth';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

export default function RespondToQueryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSimpleAuth();
  const queryId = params.id as string;

  const [query, setQuery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState({
    message: '',
    estimatedCost: '',
    deliveryTimeline: '',
    additionalNotes: '',
  });

  useEffect(() => {
    fetchQuery();
  }, [queryId]);

  const fetchQuery = async () => {
    if (!queryId) return;

    try {
      const { data, error } = await supabase
        .from('direct_queries')
        .select(`
          *,
          users:reseller_id (
            id,
            name,
            email,
            organizations:organization_id (
              name
            )
          )
        `)
        .eq('id', queryId)
        .single();

      if (error) throw error;
      setQuery(data);
    } catch (error) {
      console.error('Error fetching query:', error);
      toast.error('Failed to load query');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!response.message.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    if (!user?.organizationId) {
      toast.error('Please login as distributor');
      return;
    }

    setSubmitting(true);

    try {
      // Update query status and add response
      const { error: updateError } = await supabase
        .from('direct_queries')
        .update({
          status: 'RESPONDED',
          response_message: response.message,
          response_date: new Date().toISOString(),
          estimated_cost: response.estimatedCost ? parseFloat(response.estimatedCost) : null,
          delivery_timeline: response.deliveryTimeline,
        })
        .eq('id', queryId);

      if (updateError) throw updateError;

      // Send notification to reseller
      await supabase.from('notifications').insert({
        user_id: query.reseller_id,
        notification_type: 'QUERY_RESPONSE',
        title: 'Query Response Received',
        message: `Your direct query "${query.title}" has been responded to`,
        link: `/reseller/queries`,
      });

      toast.success('Response sent successfully!');
      router.push('/distributor/dashboard');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading query...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 font-semibold">Query not found</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Respond to Direct Query</h1>
            <Badge variant={query.status === 'OPEN' ? 'warning' : 'default'}>
              {query.status}
            </Badge>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Query Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{query.title}</h3>
              <p className="text-gray-700">{query.requirement}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Reseller</p>
                  <p className="font-semibold">{query.users?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{query.users?.organizations?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">Urgency</p>
                  <Badge variant={query.urgency === 'HIGH' ? 'danger' : query.urgency === 'MEDIUM' ? 'warning' : 'default'}>
                    {query.urgency}
                  </Badge>
                </div>
              </div>
            </div>

            {query.estimated_budget && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600 mb-1">Estimated Budget</p>
                <p className="text-lg font-semibold">{formatCurrency(query.estimated_budget)}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-600">Submitted</p>
              <p className="text-sm font-medium">{formatRelativeTime(query.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        {query.status === 'RESPONDED' ? (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">Already Responded</p>
                  <p className="text-sm text-green-800">
                    You have already responded to this query on {new Date(query.response_date).toLocaleDateString()}
                  </p>
                  {query.response_message && (
                    <div className="mt-3 p-3 bg-white rounded border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Your Response:</p>
                      <p className="text-sm text-gray-900">{query.response_message}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Response Message *</label>
                <Textarea
                  value={response.message}
                  onChange={(e) => setResponse({ ...response, message: e.target.value })}
                  rows={6}
                  placeholder="Provide a detailed response to the query..."
                  className="resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Cost</label>
                  <Input
                    type="number"
                    value={response.estimatedCost}
                    onChange={(e) => setResponse({ ...response, estimatedCost: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Timeline</label>
                  <Input
                    value={response.deliveryTimeline}
                    onChange={(e) => setResponse({ ...response, deliveryTimeline: e.target.value })}
                    placeholder="e.g., 2-3 weeks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <Textarea
                  value={response.additionalNotes}
                  onChange={(e) => setResponse({ ...response, additionalNotes: e.target.value })}
                  rows={3}
                  placeholder="Any additional information or terms..."
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Sending Response...' : 'Send Response'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
