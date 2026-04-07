'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Clock, DollarSign, User, CheckCircle, ThumbsUp, MessageSquare, FileText, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { useSimpleAuth } from '@/lib/simple-auth';
import { sendNotification } from '@/lib/notification-client';
import Link from 'next/link';

export default function DirectQueryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSimpleAuth();
  const queryId = params.id as string;
  const [query, setQuery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [showClarificationInput, setShowClarificationInput] = useState(false);
  const [clarificationMsg, setClarificationMsg] = useState('');

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
          distributor:distributor_id (
            id,
            name
          )
        `)
        .eq('id', queryId)
        .single();

      if (error) throw error;
      setQuery(data);
    } catch (error) {
      console.error('Error fetching query:', error);
      toast.error('Failed to load query details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptResponse = async () => {
    if (!query) return;
    setActioning(true);
    try {
      await supabase.from('direct_queries').update({ status: 'ACCEPTED' }).eq('id', queryId);

      // Notify distributor users to create a formal quote
      const { data: distUsers } = await supabase
        .from('users').select('id')
        .eq('organization_id', query.distributor_id).eq('role', 'DISTRIBUTOR');
      if (distUsers?.length) {
        for (const du of distUsers) {
          await sendNotification({
            userId: du.id,
            notificationType: 'QUOTE_MESSAGE',
            title: 'Response Accepted — Create Formal Quote',
            message: `The reseller has accepted your response for query "${query.title}". Please create a formal quote.`,
            link: `/distributor/queries/${queryId}`,
          });
        }
      }

      toast.success('Response accepted! Distributor notified to create a formal quote.');
      fetchQuery();
    } catch (err) {
      toast.error('Failed to accept response');
    } finally {
      setActioning(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!clarificationMsg.trim()) {
      toast.error('Please enter your feedback or clarification request');
      return;
    }
    setActioning(true);
    try {
      await supabase.from('direct_queries').update({
        status: 'OPEN',
        clarification_message: clarificationMsg.trim(),
        response_message: null,
        response_date: null,
        estimated_cost: null,
      }).eq('id', queryId);

      // Notify distributor to review feedback
      const { data: distUsers } = await supabase
        .from('users').select('id')
        .eq('organization_id', query.distributor_id).eq('role', 'DISTRIBUTOR');
      if (distUsers?.length) {
        for (const du of distUsers) {
          await sendNotification({
            userId: du.id,
            notificationType: 'QUOTE_MESSAGE',
            title: 'Reseller Requested Changes',
            message: `The reseller has requested changes for query "${query.title}": ${clarificationMsg.trim()}`,
            link: `/distributor/queries/${queryId}`,
          });
        }
      }

      toast.success('Feedback sent. Query re-opened for distributor.');
      setClarificationMsg('');
      setShowClarificationInput(false);
      fetchQuery();
    } catch (err) {
      toast.error('Failed to send feedback');
    } finally {
      setActioning(false);
    }
  };

  const handleCloseQuery = async () => {
    setActioning(true);
    try {
      await supabase.from('direct_queries').update({ status: 'CLOSED' }).eq('id', queryId);
      toast.success('Query closed.');
      fetchQuery();
    } catch {
      toast.error('Failed to close query');
    } finally {
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading...</p>
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
            <Button className="mt-4" onClick={() => router.push('/reseller/deals')}>
              Back to My Deals
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
          <Button variant="outline" onClick={() => router.push('/reseller/deals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Deals
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Direct Query Details</h1>
            <Badge variant={
              query.status === 'OPEN' ? 'warning' : 
              query.status === 'RESPONDED' ? 'success' : 
              'default'
            }>
              {query.status}
            </Badge>
          </div>
          <p className="text-gray-600">Track your direct query and distributor responses</p>
        </div>

        <div className="space-y-6">
          {/* Query Information */}
          <Card>
            <CardHeader>
              <CardTitle>Query Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{query.title}</h3>
                <p className="text-gray-700">{query.requirement}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Urgency</p>
                    <Badge variant={
                      query.urgency === 'HIGH' ? 'danger' : 
                      query.urgency === 'MEDIUM' ? 'warning' : 
                      'default'
                    }>
                      {query.urgency || 'MEDIUM'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Estimated Budget</p>
                    <p className="font-semibold">
                      {query.estimated_budget ? formatCurrency(query.estimated_budget) : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {query.distributor && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Sent to Distributor</p>
                      <p className="font-semibold">{query.distributor?.name || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600">Submitted</p>
                <p className="text-sm font-medium">{formatRelativeTime(query.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Response from Distributor */}
          {query.status === 'RESPONDED' && query.response_message && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-900">Response Received</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-green-900">{query.response_message}</p>
                </div>

                {query.estimated_cost && (
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700 mb-1">Estimated Cost</p>
                    <p className="text-lg font-semibold text-green-900">
                      {formatCurrency(query.estimated_cost)}
                    </p>
                  </div>
                )}

                {query.delivery_timeline && (
                  <div>
                    <p className="text-xs text-green-700 mb-1">Delivery Timeline</p>
                    <p className="font-medium text-green-900">{query.delivery_timeline}</p>
                  </div>
                )}

                {query.response_date && (
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700">Responded on</p>
                    <p className="text-sm font-medium text-green-900">
                      {formatRelativeTime(query.response_date)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reseller Actions */}
          {query.status === 'OPEN' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">Waiting for Distributor Response</p>
                    <p className="text-sm text-blue-800">
                      The distributor will review your query and respond with pricing and timeline.
                    </p>
                    {query.clarification_message && (
                      <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                        <p className="text-xs text-blue-700 mb-1 font-medium">Your Feedback Sent:</p>
                        <p className="text-sm text-gray-800">{query.clarification_message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {query.status === 'RESPONDED' && (
            <Card className="border-2 border-blue-200">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-gray-800 mb-4">What would you like to do next?</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1"
                    onClick={handleAcceptResponse}
                    disabled={actioning}
                  >
                    {actioning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
                    Accept & Request Formal Quote
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowClarificationInput(v => !v)}
                    disabled={actioning}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>
                  <Button
                    variant="outline"
                    className="text-gray-500"
                    onClick={handleCloseQuery}
                    disabled={actioning}
                  >
                    Close Query
                  </Button>
                </div>

                {showClarificationInput && (
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Feedback / Clarification for Distributor</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={clarificationMsg}
                      onChange={e => setClarificationMsg(e.target.value)}
                      placeholder="Describe what changes or clarifications you need..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleRequestChanges} disabled={actioning || !clarificationMsg.trim()}>
                        {actioning ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                        Send Feedback
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowClarificationInput(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {query.status === 'ACCEPTED' && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Response Accepted</p>
                    <p className="text-sm text-green-800">Distributor has been notified to create a formal quote.</p>
                  </div>
                  {query.linked_quote_id && (
                    <Link href={`/reseller/quotes/${query.linked_quote_id}`}>
                      <Button size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Quote
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {query.status === 'CLOSED' && (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">This query has been closed.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
