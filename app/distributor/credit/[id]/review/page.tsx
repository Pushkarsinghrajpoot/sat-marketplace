'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, FileText, Download, Eye, CheckCircle, X, AlertCircle, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function CreditReviewPage() {
  const params = useParams();
  const router = useRouter();
  const creditId = params.id as string;
  const { user } = useSimpleAuth();
  
  const [credit, setCredit] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [reviewData, setReviewData] = useState({
    approvedLimit: '',
    paymentTerms: '30',
    validityPeriod: '',
    reviewNotes: '',
    rejectionReason: ''
  });
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    if (user && creditId) {
      fetchCreditDetails();
      fetchActivities();
    }
  }, [user, creditId]);

  const fetchCreditDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_requests')
        .select(`
          *,
          users:reseller_id(id, name, email),
          organizations:distributor_id(id, name, logo),
          credit_request_documents(*)
        `)
        .eq('id', creditId)
        .single();

      if (error) throw error;
      setCredit(data);
      
      // Pre-fill review data with requested amount
      setReviewData(prev => ({
        ...prev,
        approvedLimit: data.amount?.toString() || '',
        paymentTerms: data.payment_terms?.replace('Net ', '') || '30'
      }));
    } catch (error) {
      console.error('Error fetching credit details:', error);
      toast.error('Failed to load credit request');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_request_activities')
        .select(`
          *,
          users:created_by(id, name, email)
        `)
        .eq('credit_request_id', creditId)
        .eq('is_internal', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleApprove = async () => {
    if (!reviewData.approvedLimit || parseFloat(reviewData.approvedLimit) <= 0) {
      toast.error('Please enter a valid approved credit limit');
      return;
    }

    setReviewing(true);
    try {
      const { error } = await supabase
        .from('credit_requests')
        .update({
          status: 'APPROVED',
          approved_limit: parseFloat(reviewData.approvedLimit),
          payment_terms: `Net ${reviewData.paymentTerms}`,
          credit_validity_period: reviewData.validityPeriod || null,
          review_notes: reviewData.reviewNotes,
          reviewer_id: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId);

      if (error) throw error;

      // Notify reseller
      await supabase.from('notifications').insert({
        user_id: credit.reseller_id,
        notification_type: 'CREDIT_APPROVED',
        title: 'Credit Request Approved',
        message: `Your credit request for ${formatCurrency(parseFloat(reviewData.approvedLimit))} has been approved`,
        link: `/reseller/credit/${creditId}`,
      });

      toast.success('Credit request approved successfully!');
      router.push('/distributor/credit');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve credit request');
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewData.rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setReviewing(true);
    try {
      const { error } = await supabase
        .from('credit_requests')
        .update({
          status: 'REJECTED',
          rejection_reason: reviewData.rejectionReason,
          review_notes: reviewData.reviewNotes,
          reviewer_id: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId);

      if (error) throw error;

      // Notify reseller
      await supabase.from('notifications').insert({
        user_id: credit.reseller_id,
        notification_type: 'CREDIT_REJECTED',
        title: 'Credit Request Declined',
        message: `Your credit request has been declined. Reason: ${reviewData.rejectionReason}`,
        link: `/reseller/credit/${creditId}`,
      });

      toast.success('Credit request rejected');
      router.push('/distributor/credit');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject credit request');
    } finally {
      setReviewing(false);
    }
  };

  const handleRequestMoreInfo = async () => {
    if (!reviewData.reviewNotes.trim()) {
      toast.error('Please specify what additional information is needed');
      return;
    }

    setReviewing(true);
    try {
      // Update credit request status
      const { error: updateError } = await supabase
        .from('credit_requests')
        .update({
          status: 'UNDER_REVIEW',
          additional_info_requested: true,
          additional_info_notes: reviewData.reviewNotes,
          reviewer_id: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId);

      if (updateError) throw updateError;

      // Create activity record
      const { error: activityError } = await supabase
        .from('credit_request_activities')
        .insert({
          credit_request_id: creditId,
          activity_type: 'INFO_REQUESTED',
          message: reviewData.reviewNotes,
          created_by: user?.id,
          is_internal: false
        });

      if (activityError) throw activityError;

      // Notify reseller
      await supabase.from('notifications').insert({
        user_id: credit.reseller_id,
        notification_type: 'CREDIT_MORE_INFO',
        title: 'Additional Information Required',
        message: `Your credit request requires additional information: ${reviewData.reviewNotes.substring(0, 100)}...`,
        link: `/reseller/credit/${creditId}`,
      });

      toast.success('Information request sent to reseller');
      router.push('/distributor/credit');
    } catch (error) {
      console.error('Error requesting info:', error);
      toast.error('Failed to request more information');
    } finally {
      setReviewing(false);
    }
  };

  const openDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const getDocumentPreviewUrl = (doc: any) => {
    const fileExtension = doc.file_name?.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
      return doc.document_url;
    }
    
    if (fileExtension === 'pdf') {
      return doc.document_url;
    }
    
    // For doc/docx files, use Microsoft Office Online viewer
    if (['doc', 'docx'].includes(fileExtension)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.document_url)}`;
    }
    
    // For xls/xlsx files
    if (['xls', 'xlsx'].includes(fileExtension)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.document_url)}`;
    }
    
    // For ppt/pptx files
    if (['ppt', 'pptx'].includes(fileExtension)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.document_url)}`;
    }
    
    // Fallback to direct URL
    return doc.document_url;
  };

  const getDocumentType = (doc: any) => {
    const fileExtension = doc.file_name?.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
      return 'image';
    }
    
    if (fileExtension === 'pdf') {
      return 'pdf';
    }
    
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension)) {
      return 'document';
    }
    
    return 'unknown';
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading credit request...</p>
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

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Credit Requests
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Request Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Credit Request #{credit.id.slice(-8)}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Submitted {formatRelativeTime(credit.created_at)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    By: {credit.users?.name} ({credit.users?.email})
                  </p>
                </div>
                <Badge variant="warning">PENDING REVIEW</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Requested Amount</p>
                  <p className="font-semibold">{formatCurrency(credit.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Monthly Volume</p>
                  <p className="font-semibold">{formatCurrency(credit.expected_monthly_volume || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested Payment Terms</p>
                  <p className="font-semibold">{credit.payment_terms || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Business Justification</p>
                  <p className="font-semibold text-sm">{credit.terms || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Review */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {credit.credit_request_documents?.map((doc: any) => (
                  <div key={doc.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-sm">
                          {doc.document_type?.replace('_', ' ') || 'Document'}
                        </span>
                        {doc.is_mandatory && <Badge variant="danger">Required</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openDocument(doc)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Uploaded: {formatRelativeTime(doc.created_at)}
                    </p>
                  </div>
                ))}
                {(!credit.credit_request_documents || credit.credit_request_documents.length === 0) && (
                  <p className="text-sm text-gray-500 col-span-2">No documents uploaded</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Communication History */}
          {activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className={`border-l-4 pl-4 py-2 ${
                      activity.activity_type === 'INFO_REQUESTED' ? 'border-orange-500' : 'border-blue-500'
                    }`}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={activity.activity_type === 'INFO_REQUESTED' ? 'warning' : 'info'}>
                            {activity.activity_type === 'INFO_REQUESTED' ? 'Info Requested' : 'Info Provided'}
                          </Badge>
                          <p className="text-sm font-semibold text-gray-700">
                            {activity.users?.name || 'System'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-800 mt-2">{activity.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Communication History */}
          {activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className={`border-l-4 pl-4 py-2 ${
                      activity.activity_type === 'INFO_REQUESTED' ? 'border-orange-500' : 'border-blue-500'
                    }`}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={activity.activity_type === 'INFO_REQUESTED' ? 'warning' : 'info'}>
                            {activity.activity_type === 'INFO_REQUESTED' ? 'Info Requested' : 'Info Provided'}
                          </Badge>
                          <p className="text-sm font-semibold text-gray-700">
                            {activity.users?.name || 'System'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-800 mt-2">{activity.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Form */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Approved Credit Limit (SAR) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={reviewData.approvedLimit}
                      onChange={(e) => setReviewData({ ...reviewData, approvedLimit: e.target.value })}
                      className="pl-10"
                      placeholder="50000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Terms (Days)</label>
                  <Input
                    type="number"
                    value={reviewData.paymentTerms}
                    onChange={(e) => setReviewData({ ...reviewData, paymentTerms: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Credit Validity Period (Optional)</label>
                <Input
                  type="date"
                  value={reviewData.validityPeriod}
                  onChange={(e) => setReviewData({ ...reviewData, validityPeriod: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Review Notes</label>
                <Textarea
                  value={reviewData.reviewNotes}
                  onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
                  rows={3}
                  placeholder="Add any notes about this credit decision..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rejection Reason (if rejecting)</label>
                <Textarea
                  value={reviewData.rejectionReason}
                  onChange={(e) => setReviewData({ ...reviewData, rejectionReason: e.target.value })}
                  rows={3}
                  placeholder="Reason for rejection..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleApprove} 
                  disabled={reviewing}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {reviewing ? 'Processing...' : 'Approve'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRequestMoreInfo}
                  disabled={reviewing}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Request More Info
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={reviewing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reseller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{credit.users?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-sm">{credit.users?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Organization</p>
                <p className="font-semibold">{credit.organizations?.name || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Verify all required documents are uploaded</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Check business financial standing</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Assess credit risk and payment capacity</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Set appropriate credit limits and terms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] w-full mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {selectedDocument.document_type?.replace('_', ' ') || 'Document'}
                </h3>
                <p className="text-sm text-gray-600">{selectedDocument.file_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={selectedDocument.document_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
                <Button variant="ghost" onClick={() => setShowDocumentModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {getDocumentType(selectedDocument) === 'image' && (
                <div className="flex justify-center">
                  <img
                    src={getDocumentPreviewUrl(selectedDocument)}
                    alt={selectedDocument.file_name}
                    className="max-w-full max-h-[70vh] object-contain rounded"
                  />
                </div>
              )}
              
              {getDocumentType(selectedDocument) === 'pdf' && (
                <iframe
                  src={getDocumentPreviewUrl(selectedDocument)}
                  className="w-full h-[70vh] border rounded"
                  title="PDF Preview"
                />
              )}
              
              {getDocumentType(selectedDocument) === 'document' && (
                <iframe
                  src={getDocumentPreviewUrl(selectedDocument)}
                  className="w-full h-[70vh] border rounded"
                  title="Document Preview"
                />
              )}
              
              {getDocumentType(selectedDocument) === 'unknown' && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                  <a href={selectedDocument.document_url} target="_blank" rel="noopener noreferrer">
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
