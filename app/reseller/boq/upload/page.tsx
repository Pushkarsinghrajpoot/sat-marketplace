'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { getDeals, createDealActivity } from '@/lib/data-helpers';
import { useAuthStore } from '@/lib/store';

export default function BOQUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dealId, setDealId] = useState('');
  const [deals, setDeals] = useState<any[]>([]);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [parsed, setParsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchDeals() {
      if (!user?.id) return;
      
      try {
        const data = await getDeals({ userId: user.id });
        // Show all deals that are locked/registered or active
        setDeals(data.filter(d => d.is_locked || d.status === 'ACTIVE' || d.status === 'DRAFT'));
      } catch (error) {
        console.error('Error fetching deals:', error);
      }
    }

    fetchDeals();
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTimeout(() => {
        setParsed(true);
        toast.success('File parsed successfully!');
      }, 1000);
    }
  };

  const handleSubmit = async () => {
    if (!file || !dealId) {
      toast.error('Please upload a file and select a deal');
      return;
    }

    setLoading(true);

    try {
      // Create deal activity for BOQ upload
      await createDealActivity({
        deal_id: dealId,
        user_id: user?.id,
        activity_type: 'BOQ_REVISION',
        description: `BOQ file uploaded: ${file.name}`,
        metadata: {
          file_name: file.name,
          file_size: file.size,
          visibility,
          selected_distributors: selectedDistributors,
          boq_data: mockPreviewData
        }
      });

      toast.success('BOQ uploaded successfully! Distributors can now view and quote.');
      router.push('/reseller/deals');
    } catch (error) {
      console.error('Error uploading BOQ:', error);
      toast.error('Failed to upload BOQ');
    } finally {
      setLoading(false);
    }
  };

  const mockPreviewData = [
    { sku: 'CAT9300-48P', product: 'Cisco Catalyst 9300', quantity: 5, specs: '48-port PoE+' },
    { sku: 'FORTI-600E', product: 'Fortinet FortiGate 600E', quantity: 2, specs: 'NGFW with IPS' },
    { sku: 'DELL-R750-001', product: 'Dell PowerEdge R750', quantity: 8, specs: '2U Rack Server' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Bill of Quantities (BOQ)</h1>
          <p className="text-gray-600">Upload your BOQ to receive competitive quotes from distributors</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload BOQ File</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-4">
                      <FileSpreadsheet className="h-12 w-12 text-green-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Drag & drop your BOQ file or click to browse</p>
                      <p className="text-sm text-gray-500">Supported: Excel (.xlsx, .xls) or CSV (.csv)</p>
                    </>
                  )}
                </div>

                {file && !parsed && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-900">Parsing file...</span>
                  </div>
                )}

                {parsed && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-900 font-medium">File parsed successfully - {mockPreviewData.length} items found</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {parsed && (
              <Card>
                <CardHeader>
                  <CardTitle>File Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">SKU</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Product</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Quantity</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Specifications</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mockPreviewData.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-mono text-xs">{item.sku}</td>
                            <td className="px-4 py-3">{item.product}</td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3 text-gray-600">{item.specs}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>BOQ Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Deal *</label>
                  <Select value={dealId} onChange={(e) => setDealId(e.target.value)}>
                    <option value="">Select a deal</option>
                    {deals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {deal.deal_name} - {deal.customer_name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Visibility Settings *</label>
                  <Select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                    <option value="PUBLIC">Public Bidding (All qualified distributors)</option>
                    <option value="PRIVATE">Private Invites (Selected distributors only)</option>
                  </Select>
                </div>

                {visibility === 'PRIVATE' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Distributors</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {['TechDist Global', 'NetSupply Corp', 'CloudFirst Distribution'].map((dist) => (
                        <label key={dist} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedDistributors.includes(dist)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDistributors([...selectedDistributors, dist]);
                              } else {
                                setSelectedDistributors(selectedDistributors.filter(d => d !== dist));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{dist}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Upload Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Prepare Your File</p>
                      <p className="text-xs text-gray-600">Excel or CSV with SKU, quantity, and specs</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upload & Preview</p>
                      <p className="text-xs text-gray-600">Review parsed data for accuracy</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Configure Settings</p>
                      <p className="text-xs text-gray-600">Select deal and visibility options</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">4</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Receive Quotes</p>
                      <p className="text-xs text-gray-600">Distributors will submit their quotes</p>
                    </div>
                  </div>
                </div>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800">
                        Ensure your BOQ includes accurate SKUs and quantities for better quote accuracy
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Submitting...' : 'Submit BOQ'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
