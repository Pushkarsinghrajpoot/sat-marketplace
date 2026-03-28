'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Award, X, Star, DollarSign, Calendar, Building, Users, Plus, Lock, CheckCircle, Upload, MessageCircle, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { updateDeal, getQuotes, getDistributors } from '@/lib/data-helpers';
import { convertDealToBidding, convertDealToDirectQuery } from '@/lib/deal-conversion';
import { createRating } from '@/lib/rating-helpers';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import MeetingActivityList from '@/components/meetings/MeetingActivityList';
import { useSimpleAuth } from '@/lib/simple-auth';
import { mapDeal } from '@/lib/data-mappers';
import Link from 'next/link';
import RatingButton from '@/components/ratings/RatingButton';

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeStatus, setCloseStatus] = useState<'WON' | 'LOST'>('WON');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [wonAmount, setWonAmount] = useState('');
  const [closeReason, setCloseReason] = useState('');

  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showConvertToQueryModal, setShowConvertToQueryModal] = useState(false);
  const [converting, setConverting] = useState(false);
  const [quotesCount, setQuotesCount] = useState(0);
  const [dealProducts, setDealProducts] = useState<any[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [showBOQModal, setShowBOQModal] = useState(false);
  const [boqFile, setBoqFile] = useState<File | null>(null);
  const [boqTitle, setBoqTitle] = useState('');
  const [boqDescription, setBoqDescription] = useState('');
  const [uploadingBOQ, setUploadingBOQ] = useState(false);
  const { user } = useSimpleAuth();

  useEffect(() => {
    async function fetchDeal() {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) throw error;
        
        // Map database fields to camelCase
        const mappedDeal = mapDeal(data);
        setDeal(mappedDeal);

        // Fetch quotes count for bidding deals
        if (mappedDeal.dealType === 'BIDDING') {
          const quotes = await getQuotes({ dealId: params.id as string });
          setQuotesCount(quotes.length);
        }

        // Fetch deal products
        const { data: productsData } = await supabase
          .from('deal_products')
          .select(`
            *,
            products (
              id,
              name,
              sku,
              price,
              brand,
              description,
              product_services (*)
            )
          `)
          .eq('deal_id', params.id);
        
        setDealProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching deal:', error);
        toast.error('Failed to load deal');
      } finally {
        setLoading(false);
      }
    }
    fetchDeal();
  }, [params.id]);

  useEffect(() => {
    async function loadDistributors() {
      const dists = await getDistributors();
      setDistributors(dists);
    }
    loadDistributors();
  }, []);

  const handleConvertToDirectQuery = async () => {
    if (!user?.id || !selectedDistributor) {
      toast.error('Please select a distributor');
      return;
    }
    setConverting(true);
    try {
      const result = await convertDealToDirectQuery(params.id as string, selectedDistributor, user.id);
      if (result.success) {
        toast.success('Deal converted to direct query successfully!');
        router.push(`/reseller/queries/${result.queryId}`);
      } else {
        toast.error('Failed to convert deal to direct query');
      }
    } catch (error) {
      console.error('Error converting deal:', error);
      toast.error('Failed to convert deal to direct query');
    } finally {
      setConverting(false);
      setShowConvertToQueryModal(false);
    }
  };

  const handleUploadBOQ = async () => {
    if (!user?.id || !boqFile || !boqTitle) {
      toast.error('Please provide title and file');
      return;
    }
    setUploadingBOQ(true);
    try {
      // Upload file to storage
      const fileExt = boqFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('boqs')
        .upload(filePath, boqFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('boqs')
        .getPublicUrl(filePath);

      // Create BOQ entry
      const { error: boqError } = await supabase
        .from('boqs')
        .insert({
          deal_id: params.id,
          reseller_id: user.id,
          reseller_organization_id: user.organizationId,
          title: boqTitle,
          description: boqDescription,
          file_url: publicUrl,
          file_name: boqFile.name,
          visibility: 'BIDDING',
          status: 'PENDING',
        });

      if (boqError) throw boqError;

      toast.success('BOQ uploaded successfully!');
      setShowBOQModal(false);
      setBoqFile(null);
      setBoqTitle('');
      setBoqDescription('');
      window.location.reload();
    } catch (error) {
      console.error('Error uploading BOQ:', error);
      toast.error('Failed to upload BOQ');
    } finally {
      setUploadingBOQ(false);
    }
  };

  const handleConvertToBidding = async () => {
    if (!user?.id) return;
    setConverting(true);
    try {
      await convertDealToBidding(params.id as string, user.id);
      toast.success('Deal converted to bidding successfully!');
      // Refresh deal data
      const { data } = await supabase.from('deals').select('*').eq('id', params.id).single();
      if (data) setDeal(mapDeal(data));
      setShowConvertModal(false);
    } catch (error) {
      console.error('Error converting deal:', error);
      toast.error('Failed to convert deal to bidding');
    } finally {
      setConverting(false);
    }
  };

  const handleCloseDeal = async () => {
    if (closeStatus === 'WON' && !wonAmount) {
      toast.error('Please enter the won amount');
      return;
    }

    try {
      await updateDeal(params.id as string, {
        status: closeStatus,
        updated_at: new Date().toISOString(),
      });

      toast.success(`Deal marked as ${closeStatus}!`);
      setShowCloseModal(false);
      
      if (closeStatus === 'WON') {
        setTimeout(() => setShowRatingModal(true), 500);
      } else {
        router.push('/reseller/deals');
      }
    } catch (error) {
      console.error('Error closing deal:', error);
      toast.error('Failed to update deal status');
    }
  };

  const handleSubmitRating = async () => {
    console.log('=== DEAL RATING SUBMISSION ===');
    console.log('user.id:', user?.id);
    console.log('user.organizationId:', user?.organizationId);
    console.log('deal.distributorId:', deal?.distributorId);
    console.log('rating:', rating);
    console.log('deal object:', deal);
    
    if (!user?.id || !user?.organizationId || !deal.distributorId || rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      // Get distributor organization ID from deal
      let distributorOrgId = deal.distributorOrganizationId;
      
      // If not in deal, fetch from distributor user
      if (!distributorOrgId && deal.distributorId) {
        const { data: distUser } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', deal.distributorId)
          .single();
        
        distributorOrgId = distUser?.organization_id;
        console.log('Fetched distributor org from user:', distributorOrgId);
      }

      console.log('Submitting rating with:', {
        dealId: deal.id,
        raterId: user.id,
        raterOrganizationId: user.organizationId,
        ratedUserId: deal.distributorId,
        ratedOrganizationId: distributorOrgId,
        rating
      });

      const result = await createRating({
        dealId: deal.id,
        raterId: user.id,
        raterOrganizationId: user.organizationId,
        ratedUserId: deal.distributorId,
        ratedOrganizationId: distributorOrgId || null as any,
        rating,
        reviewTitle: `Deal: ${deal.opportunityName}`,
        reviewText: ratingComment,
        ratingCategories: {
          communication: rating,
          pricing: rating,
          delivery: rating,
          quality: rating,
        },
      });

      if (result.success) {
        toast.success('Rating submitted successfully!');
        setShowRatingModal(false);
        router.push('/reseller/deals');
      } else {
        toast.error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };


  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Deal not found</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{deal.opportunityName || 'Untitled Deal'}</h1>
            <div className="flex items-center gap-3">
              <Badge variant={deal.status === 'WON' ? 'success' : 'warning'}>{deal.status || 'Unknown'}</Badge>
              <span className="text-gray-600">Deal ID: {deal.id}</span>
            </div>
          </div>
          <div className="flex gap-3">
            {deal.dealType === 'DEAL_REGISTRATION' && deal.isLocked && !deal.convertedToBidding && !deal.convertedToQuery && (
              <>
                <Button variant="outline" onClick={() => setShowConvertModal(true)}>
                  Convert to Bidding
                </Button>
                <Button variant="outline" onClick={() => setShowConvertToQueryModal(true)}>
                  Convert to Direct Query
                </Button>
              </>
            )}
            {deal.dealType === 'BIDDING' && (
              <Link href={`/reseller/deals/${deal.id}/quotes`}>
                <Button variant="outline">
                  View Quotes ({quotesCount})
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={() => setShowCloseModal(true)}>
              Close Deal
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Building className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Customer</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{deal.customerName || 'N/A'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Deal Value</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(deal.estimatedValue || 0)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Expected Close</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{deal.closeDate || 'Not set'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Lock Status Card */}
        {deal.isLocked && (
          <Card className="mb-6 bg-yellow-50 border-yellow-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-yellow-700" />
                <div>
                  <p className="font-semibold text-yellow-900">Deal Locked</p>
                  <p className="text-sm text-yellow-800">
                    Locked on {deal.lockedAt ? new Date(deal.lockedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {deal.score > 0 && (
                  <Badge variant="warning" className="ml-auto">
                    Score: {deal.score} points
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setShowBOQModal(true)}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Upload BOQ
              </Button>
              <Link href={`/reseller/messages?dealId=${deal.id}`}>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Distributor
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setShowMeetingModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Meeting/Activity
              </Button>
              {deal.status === 'WON' && deal.distributorId && (
                <RatingButton
                  type="organization"
                  targetId={deal.distributorOrganizationId || deal.distributorId}
                  targetName={deal.distributorName || 'Distributor'}
                  dealId={deal.id}
                  variant="outline"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-semibold text-gray-900">{deal.customerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Email</p>
                  <p className="font-semibold text-gray-900">{deal.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Company</p>
                  <p className="font-semibold text-gray-900">{deal.customerCompany || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Contact</p>
                  <p className="font-semibold text-gray-900">{deal.customerContact || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Deal Information</CardTitle>
                {deal.dealType === 'DEAL_REGISTRATION' && (
                  <Button onClick={() => setShowMeetingModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Deal Type</p>
                    <Badge>{deal.dealType ? deal.dealType.replace('_', ' ') : 'Unknown'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant="info">{deal.status || 'Unknown'}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <Badge variant={deal.priority === 'HIGH' ? 'danger' : deal.priority === 'NORMAL' ? 'default' : 'info'}>
                      {deal.priority || 'NORMAL'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="font-semibold text-gray-900">{deal.score || 0} points</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created Date</p>
                  <p className="font-semibold text-gray-900">
                    {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold text-gray-900">
                    {deal.updatedAt ? new Date(deal.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification & Lock Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {deal.isVerified && (
            <Card className="bg-green-50 border-green-300">
              <CardHeader>
                <CardTitle className="text-green-900">Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-green-900">Verified</p>
                  </div>
                  <p className="text-sm text-green-800">
                    Verified on: {deal.verifiedAt ? new Date(deal.verifiedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {deal.declarationAccepted && (
            <Card className="bg-blue-50 border-blue-300">
              <CardHeader>
                <CardTitle className="text-blue-900">Declaration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <p className="font-semibold text-blue-900">Declaration Accepted</p>
                  </div>
                  <p className="text-sm text-blue-800">
                    Accepted on: {deal.declarationAcceptedAt ? new Date(deal.declarationAcceptedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {deal.convertedToBidding && (
            <Card className="bg-purple-50 border-purple-300">
              <CardHeader>
                <CardTitle className="text-purple-900">Bidding Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold text-purple-900">Converted to Open Bidding</p>
                  <p className="text-sm text-purple-800">
                    Converted on: {deal.convertedToBiddingAt ? new Date(deal.convertedToBiddingAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Products Section */}
        {dealProducts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Products & Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealProducts.map((dealProduct) => (
                  <div key={dealProduct.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {dealProduct.products?.name || 'Product'}
                          </h4>
                          <Badge variant="info">Qty: {dealProduct.quantity}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">SKU</p>
                            <p className="font-medium">{dealProduct.products?.sku || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Brand</p>
                            <p className="font-medium">{dealProduct.products?.brand || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Unit Price</p>
                            <p className="font-medium">{formatCurrency(dealProduct.products?.price || 0)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Value</p>
                            <p className="font-semibold text-blue-600">
                              {formatCurrency((dealProduct.products?.price || 0) * dealProduct.quantity)}
                            </p>
                          </div>
                        </div>
                        {dealProduct.products?.description && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600">Description</p>
                            <p className="text-sm text-gray-900">{dealProduct.products.description}</p>
                          </div>
                        )}
                        {dealProduct.products?.product_services && dealProduct.products.product_services.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Associated Services:</p>
                            <div className="space-y-2">
                              {dealProduct.products.product_services.map((service: any) => (
                                <div key={service.id} className="bg-blue-50 border border-blue-200 rounded p-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-blue-900">{service.service_name}</p>
                                      <p className="text-xs text-blue-700">{service.service_type}</p>
                                    </div>
                                    <div className="text-right">
                                      {service.is_included ? (
                                        <Badge variant="success">Included</Badge>
                                      ) : (
                                        <p className="text-sm font-semibold text-blue-900">
                                          {formatCurrency(service.price || 0)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {service.description && (
                                    <p className="text-xs text-blue-800 mt-1">{service.description}</p>
                                  )}
                                  {service.duration && (
                                    <p className="text-xs text-blue-700 mt-1">Duration: {service.duration}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products/Services Needed Section */}
        {deal.notes && deal.notes.includes('[PRODUCTS_NEEDED]') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Products/Services Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">
                {deal.notes.match(/\[PRODUCTS_NEEDED\]([\s\S]*?)\[\/PRODUCTS_NEEDED\]/)?.[1] || ''}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notes Section */}
        {deal.notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">
                {deal.notes.replace(/\[PRODUCTS_NEEDED\][\s\S]*?\[\/PRODUCTS_NEEDED\]\n*/g, '').trim() || 'No additional notes'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Meeting Activities */}
        {(deal.dealType === 'DEAL_REGISTRATION' || deal.dealType === 'DIRECT_QUERY') && (
          <MeetingActivityList dealId={deal.id} userRole={user?.role as 'RESELLER' | 'DISTRIBUTOR' | 'END_USER'} />
        )}

        {/* Close Deal Modal */}
        {showCloseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Close Deal</h2>
                  <button onClick={() => setShowCloseModal(false)}>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Deal Outcome *</label>
                    <div className="flex gap-3">
                      <Button
                        variant={closeStatus === 'WON' ? 'primary' : 'outline'}
                        onClick={() => setCloseStatus('WON')}
                        className="flex-1"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Won
                      </Button>
                      <Button
                        variant={closeStatus === 'LOST' ? 'primary' : 'outline'}
                        onClick={() => setCloseStatus('LOST')}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Lost
                      </Button>
                    </div>
                  </div>

                  {closeStatus === 'WON' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Won Amount (SAR) *</label>
                      <input
                        type="number"
                        value={wonAmount}
                        onChange={(e) => setWonAmount(e.target.value)}
                        placeholder="118500"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                    <Textarea
                      value={closeReason}
                      onChange={(e) => setCloseReason(e.target.value)}
                      rows={3}
                      placeholder="Add any notes about the deal closure..."
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      {closeStatus === 'WON' 
                        ? "After closing, you'll be asked to rate the winning distributor."
                        : "This deal will be marked as lost and moved to your archive."}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleCloseDeal} className="flex-1">
                      Close Deal as {closeStatus}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCloseModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Rate Your Experience</h2>
                  <p className="text-gray-600">How was your experience with TechDist Global?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-3">Rating *</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-10 w-10 ${
                              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
                    <Textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      rows={4}
                      placeholder="Share your experience working with this distributor..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSubmitRating} className="flex-1">
                      Submit Rating
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowRatingModal(false);
                      router.push('/reseller/deals');
                    }}>
                      Skip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Convert to Bidding Modal */}
        {showConvertModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Convert to Bidding</h3>
                <p className="text-gray-600 mb-6">
                  This will convert your registered deal into a competitive bidding opportunity. 
                  Your lock status and activity score will remain visible to all participants.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>What happens next:</strong>
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Other resellers can participate</li>
                    <li>• Your lock badge remains visible</li>
                    <li>• Activity score is preserved</li>
                    <li>• Meeting history stays attached</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleConvertToBidding} 
                    disabled={converting}
                    className="flex-1"
                  >
                    {converting ? 'Converting...' : 'Convert to Bidding'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConvertModal(false)}
                    disabled={converting}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Convert to Direct Query Modal */}
        {showConvertToQueryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Convert to Direct Query</h3>
                <p className="text-gray-600 mb-6">
                  This will convert your registered deal into a direct query sent to a specific distributor.
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Distributor *</label>
                  <select
                    value={selectedDistributor}
                    onChange={(e) => setSelectedDistributor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a distributor</option>
                    {distributors.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {dist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>What happens next:</strong>
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Direct query created for selected distributor</li>
                    <li>• Original deal marked as converted</li>
                    <li>• You'll be redirected to the query page</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleConvertToDirectQuery} 
                    disabled={converting || !selectedDistributor}
                    className="flex-1"
                  >
                    {converting ? 'Converting...' : 'Convert to Query'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowConvertToQueryModal(false);
                      setSelectedDistributor('');
                    }}
                    disabled={converting}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* BOQ Upload Modal */}
        {showBOQModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Upload BOQ</h3>
                <p className="text-gray-600 mb-6">
                  Upload a Bill of Quantities document for this deal.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      value={boqTitle}
                      onChange={(e) => setBoqTitle(e.target.value)}
                      placeholder="e.g., Network Infrastructure BOQ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={boqDescription}
                      onChange={(e) => setBoqDescription(e.target.value)}
                      placeholder="Brief description of the BOQ..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">File *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept=".pdf,.xlsx,.xls,.csv"
                        onChange={(e) => setBoqFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="boq-file"
                      />
                      <label htmlFor="boq-file" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {boqFile ? boqFile.name : 'Click to upload file'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, Excel, or CSV files accepted
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    onClick={handleUploadBOQ} 
                    disabled={uploadingBOQ || !boqFile || !boqTitle}
                    className="flex-1"
                  >
                    {uploadingBOQ ? 'Uploading...' : 'Upload BOQ'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowBOQModal(false);
                      setBoqFile(null);
                      setBoqTitle('');
                      setBoqDescription('');
                    }}
                    disabled={uploadingBOQ}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Meeting Modal */}
        {showMeetingModal && user && (
          <CreateMeetingModal
            dealId={deal.id}
            resellerId={user.id}
            organizationId={user.organizationId}
            onClose={() => setShowMeetingModal(false)}
            onSuccess={() => {
              setShowMeetingModal(false);
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}
