'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, CheckCircle, X, Download, AlertCircle } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/lib/simple-auth';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreditRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSimpleAuth();

  useEffect(() => {
    fetchCreditRequests();
  }, [user]);

  const fetchCreditRequests = async () => {
    if (!user?.organizationId) return;
    
    try {
      const { data, error } = await supabase
        .from('credit_requests')
        .select(`
          *,
          users:reseller_id(id, name, email),
          credit_request_documents(*)
        `)
        .eq('distributor_id', user.organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching credit requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, amount: number) => {
    try {
      const request = requests.find(r => r.id === requestId);
      
      const { error } = await supabase
        .from('credit_requests')
        .update({ 
          status: 'APPROVED',
          approved_limit: amount,
          reviewer_id: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Notify reseller
      if (request?.reseller_id) {
        await supabase.from('notifications').insert({
          user_id: request.reseller_id,
          notification_type: 'CREDIT_APPROVED',
          title: 'Credit Request Approved',
          message: `Your credit request for ${formatCurrency(amount)} has been approved`,
          link: `/reseller/credit`,
        });
      }

      toast.success('Credit request approved!');
      fetchCreditRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve credit request');
    }
  };

  const handleDecline = async (requestId: string, reason?: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      
      const { error } = await supabase
        .from('credit_requests')
        .update({ 
          status: 'REJECTED',
          rejection_reason: reason || 'Request declined by distributor',
          reviewer_id: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Notify reseller
      if (request?.reseller_id) {
        await supabase.from('notifications').insert({
          user_id: request.reseller_id,
          notification_type: 'CREDIT_REJECTED',
          title: 'Credit Request Declined',
          message: `Your credit request has been declined. Reason: ${reason || 'Not specified'}`,
          link: `/reseller/credit`,
        });
      }

      toast.info('Credit request declined');
      fetchCreditRequests();
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline credit request');
    }
  };

  const handleRequestMoreInfo = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('credit_requests')
        .update({ 
          status: 'UNDER_REVIEW',
          review_notes: 'Additional information requested',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Information request sent to reseller');
      fetchCreditRequests();
    } catch (error) {
      console.error('Error requesting info:', error);
      toast.error('Failed to request more information');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Requests</h1>
        <p className="text-gray-600">Review and approve credit requests from resellers</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading credit requests...</p>
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No credit requests yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Credit requests from resellers will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-2">{request.users?.name || 'Unknown Reseller'}</CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      request.status === 'PENDING' ? 'warning' :
                      request.status === 'UNDER_REVIEW' ? 'info' :
                      request.status === 'APPROVED' ? 'success' :
                      'danger'
                    }>
                      {request.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {formatRelativeTime(request.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{request.users?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Requested Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(request.amount)}</p>
                  <p className="text-sm text-gray-600 mt-1">{request.payment_terms || 'N/A'}</p>
                  {request.expected_monthly_volume && (
                    <p className="text-xs text-gray-500 mt-1">
                      Expected Monthly: {formatCurrency(request.expected_monthly_volume)}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.terms && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Business Justification</p>
                  <p className="text-sm text-gray-800">{request.terms}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-sm mb-3">Submitted Documents</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  {(request.credit_request_documents || []).map((doc: any) => (
                    <div key={doc.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">{doc.document_type || 'Document'}</span>
                      </div>
                      <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  ))}
                  {(!request.credit_request_documents || request.credit_request_documents.length === 0) && (
                    <p className="text-sm text-gray-500 col-span-3">No documents uploaded</p>
                  )}
                </div>
              </div>

              {request.status === 'APPROVED' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-sm text-green-900">Approved Credit Limit</p>
                      <p className="text-sm text-green-800">
                        {formatCurrency(request.approved_limit || 0)} - {request.payment_terms}
                      </p>
                      {request.reviewed_at && (
                        <p className="text-xs text-green-700 mt-1">
                          Reviewed {formatRelativeTime(request.reviewed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {request.status === 'REJECTED' && request.rejection_reason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-red-900">Declined</p>
                      <p className="text-sm text-red-800">{request.rejection_reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {request.status === 'PENDING' && (
                <div className="flex gap-3">
                  <Link href={`/distributor/credit/${request.id}/review`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Review Documents
                    </Button>
                  </Link>
                  <Button size="sm" onClick={() => handleApprove(request.id, request.amount)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDecline(request.id)}>
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRequestMoreInfo(request.id)}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Request More Info
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}
