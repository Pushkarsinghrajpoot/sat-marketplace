'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, CheckCircle, X, Download } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

export default function CreditRequestsPage() {
  const requests = [
    {
      id: '1',
      reseller: 'ABC Resellers Inc.',
      amount: 50000,
      terms: 'Net 60',
      status: 'PENDING',
      documents: ['Financial Statement Q4 2023', 'Bank Reference Letter', 'Tax ID Certificate'],
      submittedAt: '2024-01-20T10:00:00Z',
    },
    {
      id: '2',
      reseller: 'Premier Solutions Group',
      amount: 100000,
      terms: 'Net 90',
      status: 'APPROVED',
      approvedLimit: 100000,
      documents: ['Financial Statement Q4 2023', 'Bank Reference Letter'],
      submittedAt: '2024-01-15T14:30:00Z',
      reviewedAt: '2024-01-18T09:00:00Z',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Requests</h1>
        <p className="text-gray-600">Review and approve credit requests from resellers</p>
      </div>

      <div className="space-y-6">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-2">{request.reseller}</CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      request.status === 'PENDING' ? 'warning' :
                      request.status === 'APPROVED' ? 'success' :
                      'danger'
                    }>
                      {request.status}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Requested {formatRelativeTime(request.submittedAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(request.amount)}</p>
                  <p className="text-sm text-gray-600">{request.terms}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-3">Submitted Documents</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  {request.documents.map((doc, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">{doc}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {request.status === 'APPROVED' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-sm text-green-900">Approved Credit Limit</p>
                      <p className="text-sm text-green-800">{formatCurrency(request.approvedLimit!)} - {request.terms}</p>
                      {request.reviewedAt && (
                        <p className="text-xs text-green-700 mt-1">
                          Reviewed {formatRelativeTime(request.reviewedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {request.status === 'PENDING' && (
                <div className="flex gap-3">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Review Documents
                  </Button>
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button size="sm" variant="outline">
                    Request More Info
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
