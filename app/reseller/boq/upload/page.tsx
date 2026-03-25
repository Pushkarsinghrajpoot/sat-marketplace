'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { getDeals, createDealActivity, getDistributors } from '@/lib/data-helpers';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notification-client';

// Create service role client for storage operations
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export default function BOQUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dealId, setDealId] = useState('');
  const [deals, setDeals] = useState<any[]>([]);
  const [visibility, setVisibility] = useState<'PROTECTED' | 'BIDDING'>('PROTECTED');
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSimpleAuth();

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) {
        console.log('BOQ: No user ID, skipping data fetch');
        return;
      }
      
      try {
        // Fetch deals
        console.log('BOQ: Fetching deals for user:', user.id);
        const dealsData = await getDeals({ userId: user.id });
        console.log('BOQ: Fetched deals:', dealsData.length, dealsData);
        setDeals(dealsData);
        
        if (dealsData.length === 0) {
          console.warn('BOQ: No deals found for user');
          toast.info('No deals found. Please create a deal first.');
        }

        // Fetch distributors
        const distributorsData = await getDistributors();
        console.log('BOQ: Fetched distributors:', distributorsData.length);
        setDistributors(distributorsData);
      } catch (error) {
        console.error('BOQ: Error fetching data:', error);
        toast.error('Failed to load data');
      }
    }

    fetchData();
  }, [user?.id]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      
      // Parse file (in production, use a library like xlsx or papaparse)
      setTimeout(() => {
        // Simulated parsing - in production, actually parse the file
        const mockData = [
          { sku: 'PARSE-001', product: 'Parsed Product 1', quantity: 1, specs: 'From file' },
        ];
        setParsedData(mockData);
        toast.success(`File parsed successfully! ${mockData.length} items found`);
      }, 1000);
    }
  };

  const handleSubmit = async () => {
    // Validate deal selection first
    if (!dealId) {
      toast.error('Please select a deal for this BOQ');
      return;
    }

    // Validate file upload
    if (!file) {
      toast.error('Please upload a BOQ file first');
      return;
    }

    // Validate file type
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a valid Excel or CSV file (.xlsx, .xls, .csv)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!user?.id) {
      toast.error('Please login to upload BOQ');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload file to Supabase Storage
      const fileName = `${dealId}_${Date.now()}_${file.name}`;
      console.log('Uploading file to bucket: boqs, filename:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabaseService.storage
        .from('boqs')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error details:', {
          error: uploadError,
          fileName,
          fileSize: file.size,
          fileType: file.type,
          bucket: 'boqs'
        });
        
        // Try to check if bucket exists
        try {
          const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
          console.log('Available buckets:', buckets);
          if (bucketError) {
            console.error('Error listing buckets:', bucketError);
          }
        } catch (e) {
          console.error('Failed to list buckets:', e);
        }
        
        throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabaseService.storage
        .from('boqs')
        .getPublicUrl(fileName);

      console.log('File uploaded to storage:', publicUrl);

      // 2. Create BOQ record in database
      const { data: boqData, error: boqError } = await supabase
        .from('boqs')
        .insert({
          deal_id: dealId,
          reseller_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          visibility: visibility,
        })
        .select()
        .single();

      if (boqError) {
        console.error('BOQ insert error:', boqError);
        throw new Error('Failed to create BOQ record');
      }

      console.log('BOQ created:', boqData);

      // 3. If we have parsed data, insert BOQ items
      if (parsedData.length > 0 && boqData.id) {
        const boqItems = parsedData.map(item => ({
          boq_id: boqData.id,
          product_name: item.product,
          quantity: item.quantity,
          sku: item.sku,
          specifications: item.specs,
        }));

        const { error: itemsError } = await supabase
          .from('boq_items')
          .insert(boqItems);

        if (itemsError) {
          console.error('BOQ items insert error:', itemsError);
          // Non-critical, continue
        }
      }

      // 4. If visibility is PROTECTED, insert invited distributors and notify them
      if (visibility === 'PROTECTED' && selectedDistributors.length > 0 && boqData.id) {
        // Insert invited distributors
        const invitations = selectedDistributors.map(distId => ({
          boq_id: boqData.id,
          distributor_id: distId,
        }));

        const { error: inviteError } = await supabase
          .from('boq_invited_distributors')
          .insert(invitations);

        if (inviteError) {
          console.error('Error inviting distributors:', inviteError);
        }

        // Send notifications to invited distributors
        for (const distId of selectedDistributors) {
          try {
            const { data: distributorUsers } = await supabase
              .from('users')
              .select('id, name, email')
              .eq('organization_id', distId)
              .eq('role', 'DISTRIBUTOR');
            
            if (distributorUsers && distributorUsers.length > 0) {
              for (const distUser of distributorUsers) {
                await sendNotification({
                  userId: distUser.id,
                  notificationType: 'BOQ_UPLOADED',
                  title: 'New BOQ Available',
                  message: `${user.name} uploaded a BOQ for deal: "${deals.find(d => d.id === dealId)?.opportunityName || 'Unknown'}"`,
                  link: `/distributor/deals`,
                  emailData: {
                    resellerName: user.name,
                    dealName: deals.find(d => d.id === dealId)?.opportunityName || 'Unknown',
                    fileName: file.name,
                  },
                });
              }
            }
          } catch (err) {
            console.error('Error sending BOQ notification to distributor:', distId, err);
          }
        }
      } else if (visibility === 'BIDDING' && boqData.id) {
        // For BIDDING, notify ALL verified distributors
        try {
          const { data: allDistributors } = await supabase
            .from('organizations')
            .select('id')
            .eq('type', 'DISTRIBUTOR')
            .eq('verified', true);
          
          if (allDistributors && allDistributors.length > 0) {
            for (const distributor of allDistributors) {
              const { data: distributorUsers } = await supabase
                .from('users')
                .select('id, name, email')
                .eq('organization_id', distributor.id)
                .eq('role', 'DISTRIBUTOR');
              
              if (distributorUsers && distributorUsers.length > 0) {
                for (const distUser of distributorUsers) {
                  await sendNotification({
                    userId: distUser.id,
                    notificationType: 'BOQ_UPLOADED',
                    title: 'New BOQ Available - Open Bidding',
                    message: `${user.name} uploaded a BOQ for open bidding: "${deals.find(d => d.id === dealId)?.opportunityName || 'Unknown'}"`,
                    link: `/distributor/deals`,
                    emailData: {
                      resellerName: user.name,
                      dealName: deals.find(d => d.id === dealId)?.opportunityName || 'Unknown',
                      fileName: file.name,
                    },
                  });
                }
              }
            }
          }
        } catch (err) {
          console.error('Error sending BOQ notifications to all distributors:', err);
        }
      }

      // 5. Create deal activity for tracking
      await createDealActivity({
        deal_id: dealId,
        reseller_id: user.id,
        activity_type: 'BOQ_REVISION',
        title: 'BOQ Uploaded',
        description: `BOQ file uploaded: ${file.name}`,
        status: 'ACKNOWLEDGED',
        points: 10,
      });

      // 6. Update deal status if needed
      await supabase
        .from('deals')
        .update({ is_locked: true })
        .eq('id', dealId);

      toast.success('BOQ uploaded successfully! Distributors can now view and submit quotes.');
      router.push('/reseller/deals');
    } catch (error: any) {
      console.error('Error uploading BOQ:', error);
      toast.error(error.message || 'Failed to upload BOQ');
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

                {file && parsedData.length === 0 && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-900">Parsing file...</span>
                  </div>
                )}

                {parsedData.length > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-900 font-medium">File parsed successfully - {parsedData.length} items found</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {parsedData.length > 0 && (
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
                        {parsedData.map((item, idx) => (
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
                        {deal.opportunityName} - {deal.customerName}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Visibility Settings *</label>
                  <Select value={visibility} onChange={(e) => setVisibility(e.target.value as 'PROTECTED' | 'BIDDING')}>
                    <option value="PROTECTED">Protected (Selected distributors only)</option>
                    <option value="BIDDING">Open Bidding (All qualified distributors)</option>
                  </Select>
                </div>

                {visibility === 'PROTECTED' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Distributors</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {distributors.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2">No distributors available</p>
                      ) : (
                        distributors.map((dist) => (
                          <label key={dist.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedDistributors.includes(dist.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDistributors([...selectedDistributors, dist.id]);
                                } else {
                                  setSelectedDistributors(selectedDistributors.filter(d => d !== dist.id));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{dist.name}</span>
                          </label>
                        ))
                      )}
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
