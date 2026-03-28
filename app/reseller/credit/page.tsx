'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, XCircle, FileText, CreditCard, TrendingUp, AlertCircle, Calendar, Eye } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function CreditRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [approvedCredit, setApprovedCredit] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSimpleAuth();

  useEffect(() => {
    if (user) {
      fetchCreditRequests();
      fetchApprovedCredit();
      fetchCreditTransactions();
    }
  }, [user]);

  const fetchCreditRequests = async () => {
    if (!user?.id || !user?.organizationId) return;
    
    try {
      const { data, error } = await supabase
        .from('credit_requests')
        .select(`
          *,
          credit_request_documents(*),
          organizations:distributor_id(id, name, logo)
        `)
        .eq('reseller_organization_id', user.organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching credit requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedCredit = async () => {
    if (!user?.id || !user?.organizationId) return;
    
    try {
      const { data, error } = await supabase
        .from('credit_requests')
        .select(`
          *,
          organizations:distributor_id(id, name, logo)
        `)
        .eq('reseller_organization_id', user.organizationId)
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setApprovedCredit(data);
    } catch (error) {
      console.error('Error fetching approved credit:', error);
    }
  };

  const fetchCreditTransactions = async () => {
    if (!user?.id || !approvedCredit?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('credit_request_id', approvedCredit.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'UNDER_REVIEW': return 'info';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
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

  const calculateAvailableCredit = () => {
    if (!approvedCredit) return 0;
    const used = approvedCredit.used_credit || 0;
    const limit = approvedCredit.approved_limit || 0;
    return limit - used;
  };

  const creditUtilizationPercentage = () => {
    if (!approvedCredit?.approved_limit) return 0;
    const used = approvedCredit.used_credit || 0;
    return Math.round((used / approvedCredit.approved_limit) * 100);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Limit</h1>
            <p className="text-gray-600">Manage your credit facility and payment terms</p>
          </div>
          <Link href="/reseller/credit/request">
            <Button>
              <DollarSign className="h-4 w-4 mr-2" />
              Request Credit Limit
            </Button>
          </Link>
        </div>
      </div>

      {approvedCredit && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Approved Credit Limit</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(approvedCredit.approved_limit || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Payment Terms: {approvedCredit.payment_terms || 'Net 30'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">{creditUtilizationPercentage()}% Used</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Available Credit</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(calculateAvailableCredit())}
              </p>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${100 - creditUtilizationPercentage()}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Used Credit</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(approvedCredit.used_credit || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {approvedCredit.credit_validity_period 
                  ? `Valid until: ${new Date(approvedCredit.credit_validity_period).toLocaleDateString()}`
                  : 'No expiry date'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !approvedCredit && (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Credit Limit</h3>
            <p className="text-gray-600 mb-4">
              Request a credit facility from distributors to purchase products with flexible payment terms
            </p>
            <Link href="/reseller/credit/request">
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Request Credit Limit
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Credit Request History</h2>
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
                        {request.organizations && (
                          <p className="text-sm text-gray-600">
                            Distributor: {request.organizations.name}
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

                  <div className="flex gap-3 flex-wrap">
                    <Link href={`/reseller/credit/${request.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/reseller/credit/${request.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        View Communication
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
