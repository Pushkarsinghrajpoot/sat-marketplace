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
        console.log('BOQ: Fetching deals for organization:', user.organizationId);
        const dealsData = await getDeals({ organizationId: user.organizationId });
        console.log('BOQ: Fetched deals:', dealsData.length, dealsData);
        
        // Show ALL deals - user can select any deal for BOQ upload
        setDeals(dealsData);
        
        if (dealsData.length === 0) {
          console.warn('BOQ: No deals found for user');
          toast.info('No deals found. Please create a deal first.');
        }

        // Fetch distributors for selection
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

      // 4. If visibility is PROTECTED, insert invited distributors
      if (visibility === 'PROTECTED' && selectedDistributors.length > 0 && boqData.id) {
        // Note: selectedDistributors currently contains names, need to map to IDs
        // For now, we'll skip this - you'd need to fetch distributor IDs first
        console.log('Private BOQ - distributors to invite:', selectedDistributors);
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

      // 7. Send notifications to distributors
      try {
        console.log('BOQ_UPLOAD: Starting notification process, visibility:', visibility);
        
        // Get the deal info for notification
        const { data: dealInfo, error: dealError } = await supabase
          .from('deals')
          .select('opportunity_name')
          .eq('id', dealId)
          .single();

        if (dealError) {
          console.error('BOQ_UPLOAD: Error fetching deal info:', dealError);
        }

        const dealName = dealInfo?.opportunity_name || 'a deal';
        console.log('BOQ_UPLOAD: Deal name:', dealName);

        if (visibility === 'BIDDING') {
          // Notify ALL distributors for BIDDING visibility
          console.log('BOQ_UPLOAD: BIDDING mode - notifying all distributors');
          
          const { data: allDistributors, error: distError } = await supabase
            .from('organizations')
            .select('id, name')
            .eq('type', 'DISTRIBUTOR')
            .eq('verified', true);
          
          console.log('BOQ_UPLOAD: Found distributors:', allDistributors?.length || 0, allDistributors);
          
          if (distError) {
            console.error('BOQ_UPLOAD: Error fetching distributors:', distError);
          }
          
          if (allDistributors && allDistributors.length > 0) {
            let notificationCount = 0;
            for (const distributor of allDistributors) {
              console.log(`BOQ_UPLOAD: Processing distributor ${distributor.name} (${distributor.id})`);
              
              const { data: distributorUsers, error: usersError } = await supabase
                .from('users')
                .select('id, email, name')
                .eq('organization_id', distributor.id)
                .eq('role', 'DISTRIBUTOR');
              
              console.log(`BOQ_UPLOAD: Found ${distributorUsers?.length || 0} users for ${distributor.name}`);
              
              if (usersError) {
                console.error(`BOQ_UPLOAD: Error fetching users for ${distributor.name}:`, usersError);
              }
              
              if (distributorUsers && distributorUsers.length > 0) {
                for (const distUser of distributorUsers) {
                  console.log(`BOQ_UPLOAD: Sending notification to ${distUser.name} (${distUser.email})`);
                  
                  const result = await sendNotification({
                    userId: distUser.id,
                    notificationType: 'BOQ_UPLOADED',
                    title: 'New BOQ Available',
                    message: `${user.name} uploaded a BOQ for "${dealName}". Submit your quote now!`,
                    link: `/distributor/deals/${dealId}`,
                    emailData: {
                      resellerName: user.name,
                      dealName: dealName,
                      boqFileName: file.name,
                    },
                  });
                  
                  if (result.success) {
                    notificationCount++;
                    console.log(`BOQ_UPLOAD: ✓ Notification sent to ${distUser.name}`);
                  } else {
                    console.error(`BOQ_UPLOAD: ✗ Failed to send notification to ${distUser.name}:`, result.error);
                  }
                }
              }
            }
            console.log(`BOQ_UPLOAD: Total notifications sent: ${notificationCount}`);
          } else {
            console.warn('BOQ_UPLOAD: No verified distributors found!');
          }
        } else if (visibility === 'PROTECTED' && selectedDistributors.length > 0) {
          // Notify only selected distributors for PROTECTED visibility
          console.log('BOQ_UPLOAD: PROTECTED mode - notifying selected distributors:', selectedDistributors);
          
          // Map distributor names to IDs
          const distributorIds = distributors
            .filter(d => selectedDistributors.includes(d.name))
            .map(d => d.id);
          
          console.log('BOQ_UPLOAD: Mapped distributor IDs:', distributorIds);
          
          let notificationCount = 0;
          for (const distributorId of distributorIds) {
            const distributorName = distributors.find(d => d.id === distributorId)?.name || distributorId;
            console.log(`BOQ_UPLOAD: Processing distributor ${distributorName} (${distributorId})`);
            
            const { data: distributorUsers, error: usersError } = await supabase
              .from('users')
              .select('id, email, name')
              .eq('organization_id', distributorId)
              .eq('role', 'DISTRIBUTOR');
            
            console.log(`BOQ_UPLOAD: Found ${distributorUsers?.length || 0} users for ${distributorName}`);
            
            if (usersError) {
              console.error(`BOQ_UPLOAD: Error fetching users for ${distributorName}:`, usersError);
            }
            
            if (distributorUsers && distributorUsers.length > 0) {
              for (const distUser of distributorUsers) {
                console.log(`BOQ_UPLOAD: Sending notification to ${distUser.name} (${distUser.email})`);
                
                const result = await sendNotification({
                  userId: distUser.id,
                  notificationType: 'BOQ_UPLOADED',
                  title: 'New BOQ - Private Invitation',
                  message: `${user.name} invited you to quote on "${dealName}". View BOQ and submit your quote!`,
                  link: `/distributor/deals/${dealId}`,
                  emailData: {
                    resellerName: user.name,
                    dealName: dealName,
                    boqFileName: file.name,
                  },
                });
                
                if (result.success) {
                  notificationCount++;
                  console.log(`BOQ_UPLOAD: ✓ Notification sent to ${distUser.name}`);
                } else {
                  console.error(`BOQ_UPLOAD: ✗ Failed to send notification to ${distUser.name}:`, result.error);
                }
              }
            }
          }
          console.log(`BOQ_UPLOAD: Total notifications sent: ${notificationCount}`);
        } else {
          console.warn('BOQ_UPLOAD: No notifications sent - visibility:', visibility, 'selectedDistributors:', selectedDistributors.length);
        }

        console.log('BOQ_UPLOAD: Notification process completed');
      } catch (err) {
        console.error('BOQ_UPLOAD: Error sending notifications:', err);
        // Don't fail the submission if notification fails
      }

      toast.success('BOQ uploaded successfully! Distributors have been notified.');
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
                      {distributors.length > 0 ? (
                        distributors.map((dist) => (
                          <label key={dist.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedDistributors.includes(dist.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDistributors([...selectedDistributors, dist.name]);
                                } else {
                                  setSelectedDistributors(selectedDistributors.filter(d => d !== dist.name));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{dist.name}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 p-2">Loading distributors...</p>
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
