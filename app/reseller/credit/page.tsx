'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function CreditRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSimpleAuth();

  useEffect(() => {
    fetchCreditRequests();
  }, [user]);

  const fetchCreditRequests = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('credit_requests')
        .select('*, credit_request_documents(*)')
        .eq('reseller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched credit requests:', data);
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching credit requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      case 'MORE_INFO_REQUIRED': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return Clock;
      case 'APPROVED': return CheckCircle;
      case 'REJECTED': return XCircle;
      default: return FileText;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Requests</h1>
            <p className="text-gray-600">Request and manage credit limits from distributors</p>
          </div>
          <Link href="/reseller/credit/request">
            <Button>
              <DollarSign className="h-4 w-4 mr-2" />
              New Credit Request
            </Button>
          </Link>
        </div>
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
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No credit requests yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Request credit from distributors to enable better payment terms
            </p>
            <Link href="/reseller/credit/request">
              <Button className="mt-4">Create Credit Request</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            
            return (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Request #{request.id.slice(-8)}
                        </h3>
                        <Badge variant={getStatusColor(request.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Submitted: {formatRelativeTime(request.created_at)}
                        </p>
                        {request.distributor_id && (
                          <p className="text-sm text-gray-600">
                            Distributor: {request.distributor_id}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Requested Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(request.amount || 0)}
                      </p>
                      {request.status === 'APPROVED' && request.approved_limit && (
                        <p className="text-sm text-green-600 mt-1">
                          Approved: {formatCurrency(request.approved_limit)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Payment Terms</p>
                      <p className="font-semibold">{request.terms || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Documents</p>
                      <p className="font-semibold">
                        {request.credit_request_documents?.length || 0} files
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Status Updated</p>
                      <p className="font-semibold">
                        {request.updated_at ? formatRelativeTime(request.updated_at) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {request.review_notes && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-900 font-semibold mb-1">Review Notes:</p>
                      <p className="text-sm text-blue-800">{request.review_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link href={`/reseller/credit/${request.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    {request.status === 'MORE_INFO_REQUIRED' && (
                      <Button size="sm" className="flex-1">
                        Update Request
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
