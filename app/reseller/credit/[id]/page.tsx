'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Download, CreditCard, TrendingDown, TrendingUp, Calendar, MessageSquare, Send, AlertCircle, CheckCircle, X } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { getCreditTransactions } from '@/lib/credit-helpers';
import { toast } from 'sonner';
import { sendNotification } from '@/lib/notification-client';

export default function CreditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const creditId = params.id as string;
  const { user } = useSimpleAuth();
  
  const [credit, setCredit] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [newMessageIndicator, setNewMessageIndicator] = useState(false);

  useEffect(() => {
    if (user && creditId) {
      fetchCreditDetails();
      fetchTransactions();
      fetchActivities();
    }
  }, [user, creditId]);

  // Real-time subscription for credit request activities
  useEffect(() => {
    if (!creditId) return;

    // Subscribe to real-time changes for this credit request's activities
    const channel = supabase
      .channel(`credit_activities_${creditId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credit_request_activities',
          filter: `credit_request_id=eq.${creditId}`
        },
        (payload) => {
          console.log('Real-time activity update:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Add new activity to the list
            setActivities(prev => [...prev, payload.new]);
            // Show indicator for new message
            setNewMessageIndicator(true);
            setTimeout(() => setNewMessageIndicator(false), 3000);
            
            // Show toast notification
            if (payload.new.created_by !== user?.id) {
              toast.info('New message received');
            }
          } else if (payload.eventType === 'UPDATE') {
            // Update existing activity
            setActivities(prev => 
              prev.map(activity => 
                activity.id === payload.new.id ? payload.new : activity
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove activity from list
            setActivities(prev => 
              prev.filter(activity => activity.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription established for credit activities');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Real-time subscription error');
        }
      });

    // Also subscribe to credit request changes
    const creditChannel = supabase
      .channel(`credit_request_${creditId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'credit_requests',
          filter: `id=eq.${creditId}`
        },
        (payload) => {
          console.log('Real-time credit request update:', payload);
          setCredit(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(creditChannel);
    };
  }, [creditId]);

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
      
      console.log('Credit Request Data:', {
        id: data.id,
        status: data.status,
        additional_info_requested: data.additional_info_requested,
        additional_info_notes: data.additional_info_notes,
        updated_at: data.updated_at
      });
      
      // Check if there are any info request activities
      const hasInfoRequestActivities = activities.some(activity => activity.activity_type === 'INFO_REQUESTED');
      console.log('Has info request activities:', hasInfoRequestActivities);
      console.log('Activities:', activities);
      
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

  const handleSubmitResponse = async () => {
    if (!responseMessage.trim() && attachmentFiles.length === 0) {
      toast.error('Please enter a response or attach files');
      return;
    }

    setSubmitting(true);
    try {
      // Upload attachments first if any
      let uploadedFiles: any[] = [];
      if (attachmentFiles.length > 0) {
        for (const file of attachmentFiles) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `credit-responses/${creditId}/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('credit-documents')
            .upload(filePath, file);

          if (uploadError) {
            console.error('File upload failed:', uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('credit-documents')
            .getPublicUrl(filePath);

          uploadedFiles.push({
            name: file.name,
            url: publicUrl,
            size: file.size,
            type: file.type
          });
        }
      }

      // Create activity record with attachments
      const activityData = {
        credit_request_id: creditId,
        activity_type: 'INFO_PROVIDED',
        message: responseMessage,
        created_by: user?.id,
        is_internal: false,
        attachments: uploadedFiles
      };

      console.log('Creating activity record:', activityData);

      const { data: activityResult, error: activityError } = await supabase
        .from('credit_request_activities')
        .insert(activityData)
        .select()
        .single();

      if (activityError) {
        console.error('Activity creation failed:', activityError);
        throw activityError;
      }
      
      console.log('Activity created successfully:', activityResult);

      // Update credit request to clear additional info flag
      const { error: updateError } = await supabase
        .from('credit_requests')
        .update({
          additional_info_requested: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId);

      if (updateError) throw updateError;

      // Notify distributor - send to reviewer if available, otherwise skip notification
      if (credit.reviewer_id) {
        console.log('Creating notification for distributor reviewer:', {
          reviewer_id: credit.reviewer_id,
          distributor_name: credit.organizations?.name,
          credit_request_id: creditId
        });

        await sendNotification({
          userId: credit.reviewer_id,
          notificationType: 'CREDIT_INFO_PROVIDED',
          title: 'Additional Information Provided',
          message: `Reseller has provided additional information for credit request${uploadedFiles.length > 0 ? ` with ${uploadedFiles.length} file(s)` : ''}`,
          link: `/distributor/credit/${creditId}/review`,
          emailData: {
            hasAttachments: uploadedFiles.length > 0,
          },
        });
      } else {
        console.log('No reviewer_id found, skipping notification');
      }

      toast.success(`Response submitted successfully${uploadedFiles.length > 0 ? ` with ${uploadedFiles.length} file(s)` : ''}`);
      setResponseMessage('');
      setAttachmentFiles([]);
      fetchActivities();
      fetchCreditDetails();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
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

          {/* Communication/Activity Timeline */}
          <Card className={`border-2 border-gray-100 transition-all duration-300 ${newMessageIndicator ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
            <CardHeader className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-b transition-all duration-300 ${newMessageIndicator ? 'bg-blue-100' : ''}`}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <MessageSquare className={`h-5 w-5 text-blue-600 transition-all duration-300 ${newMessageIndicator ? 'animate-pulse' : ''}`} />
                  Communication History
                  {newMessageIndicator && (
                    <span className="text-xs text-blue-600 font-medium animate-fade-in">New message!</span>
                  )}
                </CardTitle>
                {activities.length > 0 && (
                  <Badge variant="info" className={`bg-blue-100 text-blue-800 transition-all duration-300 ${newMessageIndicator ? 'bg-blue-200 text-blue-900' : ''}`}>
                    {activities.length} {activities.length === 1 ? 'message' : 'messages'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {activities.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className={`p-6 ${
                      activity.activity_type === 'INFO_REQUESTED' ? 'bg-orange-50/50' : 'bg-green-50/30'
                    } ${index === 0 ? 'rounded-t-lg' : ''} ${index === activities.length - 1 ? 'rounded-b-lg' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.activity_type === 'INFO_REQUESTED' 
                            ? 'bg-orange-200 text-orange-700' 
                            : 'bg-green-200 text-green-700'
                        }`}>
                          {activity.activity_type === 'INFO_REQUESTED' ? (
                            <AlertCircle className="h-5 w-5" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                activity.activity_type === 'INFO_REQUESTED'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {activity.activity_type === 'INFO_REQUESTED' ? 'Information Requested' : 'Information Provided'}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {activity.users?.name || 'System'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(activity.created_at)}
                            </span>
                          </div>
                          <div className="text-gray-700 leading-relaxed">
                            {activity.message}
                          </div>
                          
                          {/* Display attachments */}
                          {activity.attachments && activity.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-medium text-gray-600">Attachments:</p>
                              <div className="space-y-2">
                                {activity.attachments.map((attachment: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-gray-500" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">{attachment.name}</p>
                                        <p className="text-xs text-gray-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                                      </div>
                                    </div>
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      View
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Response Form - Only show if additional info is requested */}
                  {credit && (credit.additional_info_requested || credit.status === 'UNDER_REVIEW' || activities.some(a => a.activity_type === 'INFO_REQUESTED')) && (
                    <div className="p-6 bg-orange-50/30 border-t border-orange-200">
                      <div className="space-y-4">
                        
                    
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">Your Response</label>
                          <Textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            rows={4}
                            placeholder="Provide the requested information here..."
                            className="bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">Attachments (Optional)</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileText className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                  <span>Upload files</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    multiple
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || []);
                                      setAttachmentFiles([...attachmentFiles, ...files]);
                                    }}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF up to 10MB each</p>
                            </div>
                            
                            {attachmentFiles.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                                {attachmentFiles.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                                      <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setAttachmentFiles(attachmentFiles.filter((_, i) => i !== index))}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button 
                          onClick={handleSubmitResponse}
                          disabled={submitting || (!responseMessage.trim() && attachmentFiles.length === 0)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium"
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {submitting ? 'Submitting Response...' : 'Submit Response'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Communication Yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Communication history will appear here once the distributor reaches out or you respond to requests.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
