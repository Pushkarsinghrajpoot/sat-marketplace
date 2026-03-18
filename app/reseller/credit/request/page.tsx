'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Upload, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { getDistributors } from '@/lib/data-helpers';
import { formatCurrency } from '@/lib/utils';

export default function CreateCreditRequestPage() {
  const router = useRouter();
  const { user } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    distributorId: '',
    amount: '',
    monthlyPurchase: '',
    paymentTerms: '',
    businessJustification: '',
  });
  const [documents, setDocuments] = useState<{
    financials: File | null;
    tradeLicense: File | null;
    bankLetter: File | null;
  }>({
    financials: null,
    tradeLicense: null,
    bankLetter: null,
  });

  useEffect(() => {
    async function fetchDistributors() {
      const data = await getDistributors();
      setDistributors(data);
    }
    fetchDistributors();
  }, []);

  const handleFileChange = (field: 'financials' | 'tradeLicense' | 'bankLetter', file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('credit-documents')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('credit-documents')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Please login to submit credit request');
      return;
    }

    if (!formData.distributorId) {
      toast.error('Please select a distributor');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid credit amount');
      return;
    }

    if (!documents.financials || !documents.tradeLicense) {
      toast.error('Please upload required documents (Financials and Trade License)');
      return;
    }

    setLoading(true);

    try {
      // Create credit request
      const { data: creditRequest, error: requestError } = await supabase
        .from('credit_requests')
        .insert({
          reseller_id: user.id,
          distributor_id: formData.distributorId,
          amount: parseFloat(formData.amount),
          terms: `${formData.paymentTerms} days payment terms. Expected monthly purchase: $${formData.monthlyPurchase}. ${formData.businessJustification}`,
          status: 'PENDING',
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Upload and link documents
      const uploadPromises = [];

      if (documents.financials) {
        const url = await uploadFile(documents.financials, 'financials');
        uploadPromises.push(
          supabase.from('credit_request_documents').insert({
            credit_request_id: creditRequest.id,
            document_url: url,
            document_type: 'FINANCIALS',
          })
        );
      }

      if (documents.tradeLicense) {
        const url = await uploadFile(documents.tradeLicense, 'licenses');
        uploadPromises.push(
          supabase.from('credit_request_documents').insert({
            credit_request_id: creditRequest.id,
            document_url: url,
            document_type: 'TRADE_LICENSE',
          })
        );
      }

      if (documents.bankLetter) {
        const url = await uploadFile(documents.bankLetter, 'bank-letters');
        uploadPromises.push(
          supabase.from('credit_request_documents').insert({
            credit_request_id: creditRequest.id,
            document_url: url,
            document_type: 'BANK_LETTER',
          })
        );
      }

      await Promise.all(uploadPromises);

      // Notify distributor
      await supabase.from('notifications').insert({
        notification_type: 'CREDIT_REQUEST',
        title: 'New Credit Request',
        message: `${user.name} requested ${formatCurrency(parseFloat(formData.amount))} credit limit`,
        link: `/distributor/credit/${creditRequest.id}`,
      });

      toast.success('Credit request submitted successfully!');
      router.push('/reseller/credit');
    } catch (error: any) {
      console.error('Error submitting credit request:', error);
      toast.error(error.message || 'Failed to submit credit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Credit Limit</h1>
          <p className="text-gray-600">Submit a request to get credit terms from a distributor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Distributor *</label>
                <Select
                  value={formData.distributorId}
                  onChange={(e) => setFormData({ ...formData, distributorId: e.target.value })}
                  required
                >
                  <option value="">Select a distributor</option>
                  {distributors.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name} - {dist.city || 'N/A'}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Requested Credit Limit (SAR) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="pl-10"
                    placeholder="50000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expected Monthly Purchase (SAR) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={formData.monthlyPurchase}
                    onChange={(e) => setFormData({ ...formData, monthlyPurchase: e.target.value })}
                    className="pl-10"
                    placeholder="10000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Terms Requested (Days) *</label>
                <Input
                  type="number"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="30"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Typical terms: 30, 60, or 90 days</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Justification *</label>
                <Textarea
                  value={formData.businessJustification}
                  onChange={(e) => setFormData({ ...formData, businessJustification: e.target.value })}
                  rows={4}
                  placeholder="Explain why you need this credit limit and how it will help your business..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 mb-1">Document Requirements</p>
                      <p className="text-xs text-yellow-800">
                        Please upload clear, legible copies of the required documents. All documents should be recent (within last 6 months).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Audited Financials * <span className="text-red-600">Required</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('financials', e.target.files?.[0] || null)}
                    className="hidden"
                    id="financials"
                  />
                  <label htmlFor="financials" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {documents.financials ? documents.financials.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC up to 10MB</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Trade License/CR * <span className="text-red-600">Required</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => handleFileChange('tradeLicense', e.target.files?.[0] || null)}
                    className="hidden"
                    id="tradeLicense"
                  />
                  <label htmlFor="tradeLicense" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {documents.tradeLicense ? documents.tradeLicense.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, JPG, PNG up to 10MB</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bank Letter (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('bankLetter', e.target.files?.[0] || null)}
                    className="hidden"
                    id="bankLetter"
                  />
                  <label htmlFor="bankLetter" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {documents.bankLetter ? documents.bankLetter.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC up to 10MB</p>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Credit Request'}
              <FileText className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
