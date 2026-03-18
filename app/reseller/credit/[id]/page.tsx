'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Download, CreditCard, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { getCreditTransactions } from '@/lib/credit-helpers';

export default function CreditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const creditId = params.id as string;
  const { user } = useSimpleAuth();
  
  const [credit, setCredit] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && creditId) {
      fetchCreditDetails();
      fetchTransactions();
    }
  }, [user, creditId]);

  const fetchCreditDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_requests')
        .select(`
          *,
          organizations:distributor_id(id, name, logo),
          credit_request_documents(*)
        `)
        .eq('id', creditId)
        .single();

      if (error) throw error;
      setCredit(data);
    } catch (error) {
      console.error('Error fetching credit details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    const txns = await getCreditTransactions(creditId);
    setTransactions(txns);
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

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading credit details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!credit) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Credit request not found</p>
            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableCredit = credit.approved_limit - (credit.used_credit || 0);
  const utilizationPercentage = credit.approved_limit 
    ? Math.round(((credit.used_credit || 0) / credit.approved_limit) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Credit Requests
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Credit Request #{credit.id.slice(-8)}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Submitted {formatRelativeTime(credit.created_at)}
                  </p>
                </div>
                <Badge variant={getStatusColor(credit.status)}>
                  {credit.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Distributor</p>
                  <p className="font-semibold">{credit.organizations?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Terms</p>
                  <p className="font-semibold">{credit.payment_terms || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested Amount</p>
                  <p className="font-semibold">{formatCurrency(credit.amount)}</p>
                </div>
                {credit.expected_monthly_volume && (
                  <div>
                    <p className="text-sm text-gray-600">Expected Monthly Volume</p>
                    <p className="font-semibold">{formatCurrency(credit.expected_monthly_volume)}</p>
                  </div>
                )}
              </div>

              {credit.terms && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Business Justification</p>
                  <p className="text-sm text-gray-800">{credit.terms}</p>
                </div>
              )}

              {credit.status === 'APPROVED' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-green-900">Approved Credit Limit</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(credit.approved_limit)}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-green-700">Used</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(credit.used_credit || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700">Available</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(availableCredit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700">Utilization</p>
                      <p className="text-lg font-bold text-green-900">{utilizationPercentage}%</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 transition-all"
                      style={{ width: `${utilizationPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {credit.status === 'REJECTED' && credit.rejection_reason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900 mb-2">Rejection Reason</p>
                  <p className="text-sm text-red-800">{credit.rejection_reason}</p>
                </div>
              )}

              {credit.review_notes && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-2">Review Notes</p>
                  <p className="text-sm text-blue-800">{credit.review_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {credit.status === 'APPROVED' && transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {txn.transaction_type === 'USAGE' ? (
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingDown className="h-4 w-4 text-orange-600" />
                          </div>
                        ) : (
                          <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold">{txn.description}</p>
                          <p className="text-xs text-gray-600">
                            {formatRelativeTime(txn.created_at)} • {txn.reference_type}
                          </p>
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${
                        txn.transaction_type === 'USAGE' ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {txn.transaction_type === 'USAGE' ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {credit.credit_request_documents?.map((doc: any) => (
                  <div key={doc.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">
                          {doc.document_type?.replace('_', ' ') || 'Document'}
                        </span>
                      </div>
                      <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
                {(!credit.credit_request_documents || credit.credit_request_documents.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">No documents uploaded</p>
                )}
              </div>
            </CardContent>
          </Card>

          {credit.credit_validity_period && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Credit Valid Until</p>
                    <p className="font-semibold">
                      {new Date(credit.credit_validity_period).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
