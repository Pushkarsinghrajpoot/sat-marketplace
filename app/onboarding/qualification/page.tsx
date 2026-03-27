'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Building } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  { value: 'GST_CERTIFICATE', label: 'GST Certificate', required: true },
  { value: 'PAN_CARD', label: 'PAN Card', required: true },
  { value: 'TRADE_LICENSE', label: 'Trade License', required: false },
  { value: 'COMPANY_REGISTRATION', label: 'Company Registration Certificate', required: true },
  { value: 'BANK_STATEMENT', label: 'Bank Statement (Last 3 months)', required: false },
];

export default function QualificationPage() {
  const router = useRouter();
  const { user } = useSimpleAuth();
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qualificationStatus, setQualificationStatus] = useState<string>('');

  useEffect(() => {
    loadQualificationStatus();
  }, [user?.id]);

  const loadQualificationStatus = async () => {
    if (!user?.id) return;

    try {
      // Get user qualification status
      const { data: userData } = await supabase
        .from('users')
        .select('qualification_status')
        .eq('id', user.id)
        .single();

      if (userData) {
        setQualificationStatus(userData.qualification_status);
        
        // If already approved, redirect to dashboard
        if (userData.qualification_status === 'APPROVED') {
          router.push('/dashboard');
          return;
        }
      }

      // Load uploaded documents
      if (user.organizationId) {
        const { data: docs } = await supabase
          .from('organization_documents')
          .select('*')
          .eq('organization_id', user.organizationId);

        setUploadedDocs(docs || []);
      }
    } catch (error) {
      console.error('Error loading qualification status:', error);
    }
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!user?.organizationId) {
      toast.error('Organization not found');
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}-${Date.now()}.${fileExt}`;
      const filePath = `qualifications/${user.organizationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      const { error: docError } = await supabase
        .from('organization_documents')
        .insert({
          organization_id: user.organizationId,
          document_type: documentType,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          status: 'PENDING',
        });

      if (docError) throw docError;

      toast.success('Document uploaded successfully!');
      loadQualificationStatus();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitQualification = async () => {
    if (!user?.id || !user?.organizationId) return;

    // Check if all required documents are uploaded
    const requiredDocs = DOCUMENT_TYPES.filter(d => d.required);
    const uploadedTypes = uploadedDocs.map(d => d.document_type);
    const missingDocs = requiredDocs.filter(d => !uploadedTypes.includes(d.value));

    if (missingDocs.length > 0) {
      toast.error(`Please upload required documents: ${missingDocs.map(d => d.label).join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      // Update user qualification status
      const { error: userError } = await supabase
        .from('users')
        .update({
          qualification_status: 'PENDING',
          qualification_submitted_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update organization qualification status
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          qualification_status: 'PENDING',
          qualification_submitted_at: new Date().toISOString(),
        })
        .eq('id', user.organizationId);

      if (orgError) throw orgError;

      toast.success('Qualification submitted for review!');
      setQualificationStatus('PENDING');
    } catch (error) {
      console.error('Error submitting qualification:', error);
      toast.error('Failed to submit qualification');
    } finally {
      setSubmitting(false);
    }
  };

  const isDocumentUploaded = (docType: string) => {
    return uploadedDocs.some(d => d.document_type === docType);
  };

  const getDocumentStatus = (docType: string) => {
    const doc = uploadedDocs.find(d => d.document_type === docType);
    return doc?.status || null;
  };

  if (qualificationStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Qualification Under Review</h2>
            <p className="text-gray-600 mb-6">
              Your qualification documents have been submitted and are currently under review by our admin team.
              You will receive a notification once the review is complete.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>What's Next:</strong><br/>
                • Our team will review your documents within 24-48 hours<br/>
                • You'll receive an email notification with the decision<br/>
                • If additional information is required, we'll reach out to you
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (qualificationStatus === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Qualification Not Approved</h2>
            <p className="text-gray-600 mb-6">
              Unfortunately, your qualification could not be approved at this time.
              Please review the feedback and resubmit your application.
            </p>
            <Button onClick={() => setQualificationStatus('INCOMPLETE')}>
              Resubmit Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Qualification</h1>
          <p className="text-gray-600">
            Upload required documents to verify your organization and gain marketplace access
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DOCUMENT_TYPES.map((docType) => {
                const uploaded = isDocumentUploaded(docType.value);
                const status = getDocumentStatus(docType.value);

                return (
                  <div
                    key={docType.value}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{docType.label}</p>
                        {docType.required && (
                          <Badge variant="danger" className="text-xs">Required</Badge>
                        )}
                      </div>
                      {uploaded && (
                        <div className="flex items-center gap-2 mt-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            {uploadedDocs.find(d => d.document_type === docType.value)?.file_name}
                          </span>
                          {status && (
                            <Badge 
                              variant={
                                status === 'APPROVED' ? 'success' : 
                                status === 'REJECTED' ? 'danger' : 
                                'warning'
                              }
                              className="text-xs"
                            >
                              {status}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id={`file-${docType.value}`}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(docType.value, file);
                          }
                        }}
                        disabled={uploading}
                      />
                      <label htmlFor={`file-${docType.value}`}>
                        <Button
                          variant={uploaded ? 'outline' : 'primary'}
                          size="sm"
                          disabled={uploading}
                          onClick={() => document.getElementById(`file-${docType.value}`)?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploaded ? 'Re-upload' : 'Upload'}
                        </Button>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Document Requirements</p>
                  <p>All documents must be clear, legible, and in PDF, JPG, or PNG format</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Verification Process</p>
                  <p>Your documents will be reviewed within 24-48 hours by our admin team</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Data Privacy</p>
                  <p>All documents are securely stored and only used for verification purposes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={handleSubmitQualification}
            disabled={submitting || uploadedDocs.length === 0}
            size="lg"
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
      </div>
    </div>
  );
}
