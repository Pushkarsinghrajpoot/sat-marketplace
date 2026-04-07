'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Award, X, DollarSign, Calendar, Building, Users, Plus, Lock, CheckCircle, Upload, MessageCircle, FileSpreadsheet, Star, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { updateDeal, getQuotes, getDistributors } from '@/lib/data-helpers';
import { sendNotification, sendBulkNotification } from '@/lib/notification-client';
import { convertDealToBidding, convertDealToDirectQuery } from '@/lib/deal-conversion';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import MeetingActivityList from '@/components/meetings/MeetingActivityList';
import { useSimpleAuth } from '@/lib/simple-auth';
import { mapDeal } from '@/lib/data-mappers';
import Link from 'next/link';
import RatingModal from '@/components/ratings/RatingModal';

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeStatus, setCloseStatus] = useState<'WON' | 'LOST'>('WON');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingDistributorId, setRatingDistributorId] = useState<string>('');
  const [ratingDistributorName, setRatingDistributorName] = useState<string>('');
  const [existingRating, setExistingRating] = useState<any>(null);
  const [loadingRating, setLoadingRating] = useState(false);
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
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [showMessageDistributorModal, setShowMessageDistributorModal] = useState(false);
  const [messageDistributorTarget, setMessageDistributorTarget] = useState('');
  const [messageDistributorText, setMessageDistributorText] = useState('');
  const [sendingDistributorMsg, setSendingDistributorMsg] = useState(false);
  const [engagedDistributors, setEngagedDistributors] = useState<any[]>([]);
  const [wonDistributorName, setWonDistributorName] = useState<string | null>(null);
  const [showBOQModal, setShowBOQModal] = useState(false);
  const [boqFile, setBoqFile] = useState<File | null>(null);
  const [boqTitle, setBoqTitle] = useState('');
  const [boqDescription, setBoqDescription] = useState('');
  const [uploadingBOQ, setUploadingBOQ] = useState(false);
  const [dealMessages, setDealMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
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

        // Fetch quotes count for all deals
        const quotes = await getQuotes({ dealId: params.id as string });
        setQuotesCount(quotes.length);

        // Load deal messages thread
        loadDealMessages();

        // Fetch winning distributor name for WON deals
        if (mappedDeal.status === 'WON' && mappedDeal.wonQuoteId) {
          const { data: wonQuote } = await supabase
            .from('quotes')
            .select('distributor_id, organizations!quotes_distributor_id_fkey(name)')
            .eq('id', mappedDeal.wonQuoteId)
            .single();
          if (wonQuote?.organizations) {
            setWonDistributorName((wonQuote.organizations as any).name || null);
          }
        }

        // Fetch engaged distributors for message target
        const { data: engagedData } = await supabase
          .from('deal_engaged_distributors')
          .select('distributor_id, organizations!deal_engaged_distributors_distributor_id_fkey(id, name)')
          .eq('deal_id', params.id);
        if (engagedData) {
          setEngagedDistributors(engagedData.map((e: any) => e.organizations).filter(Boolean));
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

        // Check if user has already rated this deal
        if (user?.id && (mappedDeal.status === 'WON' || mappedDeal.status === 'LOST')) {
          await checkExistingRating();
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
        toast.error('Failed to load deal');
      } finally {
        setLoading(false);
      }
    }
    fetchDeal();
  }, [params.id, user?.id]);

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
        // Notify selected distributor users about the new direct query
        try {
          const { data: distUsers } = await supabase
            .from('users')
            .select('id')
            .eq('organization_id', selectedDistributor)
            .eq('role', 'DISTRIBUTOR');

          if (distUsers?.length) {
            await sendBulkNotification(
              distUsers.map((u: any) => u.id),
              'ENGAGEMENT_REQUEST',
              'New Direct Query — Action Required',
              `${user.name || 'A reseller'} has sent you a direct query: "${deal?.opportunityName}". Please review and respond.`,
              `/distributor/queries`,
              {
                resellerName: user.name || 'Reseller',
                dealName: deal?.opportunityName || 'Direct Query',
                engagementType: 'Direct Query',
              }
            );
          }
        } catch (notifErr) {
          console.error('Notification failed (non-blocking):', notifErr);
        }

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
          file_url: publicUrl,
          file_name: boqFile.name,
          visibility: 'BIDDING',
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

  const loadDealMessages = async () => {
    if (!params.id) return;
    const { data } = await supabase
      .from('quote_messages')
      .select('id, text, created_at, read, sender_id, sender_org_id, recipient_org_id, users!quote_messages_sender_id_fkey(id, name)')
      .eq('deal_id', params.id)
      .order('created_at', { ascending: true });
    if (data) setDealMessages(data);
  };

  const handleSendDistributorMessage = async () => {
    if (!messageDistributorText.trim() || !user?.id) return;
    setSendingDistributorMsg(true);
    try {
      const targetOrgId = messageDistributorTarget || engagedDistributors[0]?.id;
      if (!targetOrgId) { toast.error('No distributor to message'); return; }

      const { data: distUsers } = await supabase
        .from('users').select('id')
        .eq('organization_id', targetOrgId).eq('role', 'DISTRIBUTOR');

      // Persist message to quote_messages with deal_id
      const { error: msgErr } = await supabase.from('quote_messages').insert({
        deal_id: params.id,
        sender_id: user.id,
        sender_org_id: user.organizationId,
        recipient_org_id: targetOrgId,
        recipient_id: distUsers?.[0]?.id || null,
        text: messageDistributorText.trim(),
        read: false,
      });
      if (msgErr) throw msgErr;

      // Notify all distributor users
      if (distUsers?.length) {
        await sendBulkNotification(
          distUsers.map((du: any) => du.id),
          'QUOTE_MESSAGE',
          'Message from Reseller',
          messageDistributorText.trim(),
          `/distributor/deals/${params.id}#messages`,
        );
      }

      toast.success('Message sent to distributor!');
      setMessageDistributorText('');
      setShowMessageDistributorModal(false);
      loadDealMessages();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSendingDistributorMsg(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !user?.id || engagedDistributors.length === 0) return;
    setSendingReply(true);
    try {
      const targetOrgId = engagedDistributors[0]?.id;
      const { data: distUsers } = await supabase
        .from('users').select('id')
        .eq('organization_id', targetOrgId).eq('role', 'DISTRIBUTOR');
      await supabase.from('quote_messages').insert({
        deal_id: params.id,
        sender_id: user.id,
        sender_org_id: user.organizationId,
        recipient_org_id: targetOrgId,
        recipient_id: distUsers?.[0]?.id || null,
        text: replyText.trim(),
        read: false,
      });
      if (distUsers?.length) {
        await sendBulkNotification(
          distUsers.map((du: any) => du.id),
          'QUOTE_MESSAGE',
          'New message from Reseller',
          replyText.trim(),
          `/distributor/deals/${params.id}#messages`,
        );
      }
      setReplyText('');
      loadDealMessages();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSendingReply(false);
    }
  };

  const handleConvertToBidding = async () => {
    if (!user?.id) return;
    if (selectedDistributors.length === 0) {
      toast.error('Please select at least one distributor');
      return;
    }
    setConverting(true);
    try {
      const result = await convertDealToBidding(params.id as string, user.id, selectedDistributors);
      if (!result.success) throw new Error('Conversion failed');

      // Bug 4: Send notifications to all selected distributors
      for (const distributorId of selectedDistributors) {
        const { data: distUsers } = await supabase
          .from('users')
          .select('id')
          .eq('organization_id', distributorId)
          .eq('role', 'DISTRIBUTOR');
        if (distUsers && distUsers.length > 0) {
          const userIds = distUsers.map((du: any) => du.id);
          await sendBulkNotification(
            userIds,
            'ENGAGEMENT_REQUEST',
            'New Bidding Deal — You\'re Invited',
            `${user.name || 'A reseller'} has invited you to bid on: "${deal?.opportunityName}". Submit a quote to participate.`,
            `/distributor/deals/${params.id}`,
            {
              resellerName: user.name || 'Reseller',
              dealName: deal?.opportunityName || 'New Deal',
              engagementType: 'Bidding',
            }
          );
        }
      }

      toast.success('Deal converted to bidding successfully!');
      const { data } = await supabase.from('deals').select('*').eq('id', params.id).single();
      if (data) setDeal(mapDeal(data));
      setShowConvertModal(false);
      setSelectedDistributors([]);
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
        console.log('Deal closed as WON, fetching distributor for rating...');
        
        let orgId: string | null = null;
        let orgName = 'Distributor';

        // Try Method 1: Get distributor from deal products
        const { data: dealProductsList } = await supabase
          .from('deal_products')
          .select('product_id')
          .eq('deal_id', deal.id)
          .limit(1);

        if (dealProductsList && dealProductsList.length > 0) {
          const productId = dealProductsList[0].product_id;
          const { data: product } = await supabase
            .from('products')
            .select(`
              organization_id,
              organizations:organization_id (id, name)
            `)
            .eq('id', productId)
            .single();
          
          if (product?.organization_id) {
            orgId = product.organization_id;
            const orgData = product.organizations as any;
            orgName = orgData?.name || 'Distributor';
            console.log('✓ Found distributor from products:', orgId);
          }
        }

        // Try Method 2: Get from deal_engaged_distributors
        if (!orgId) {
          const { data: engagedDist } = await supabase
            .from('deal_engaged_distributors')
            .select(`
              distributor_id,
              organizations:distributor_id (id, name)
            `)
            .eq('deal_id', deal.id)
            .limit(1)
            .single();

          if (engagedDist?.distributor_id) {
            orgId = engagedDist.distributor_id;
            const orgData = engagedDist.organizations as any;
            orgName = orgData?.name || 'Distributor';
            console.log('✓ Found distributor from engaged_distributors:', orgId);
          }
        }

        if (orgId) {
          // Get admin user from distributor org
          const { data: distUser } = await supabase
            .from('users')
            .select('id, name')
            .eq('organization_id', orgId)
            .eq('role', 'ADMIN')
            .limit(1)
            .single();
          
          if (distUser) {
            console.log('Setting rating distributor:', distUser.name);
            setRatingDistributorId(distUser.id);
            setRatingDistributorName(orgName);
            
            // Update deal state to reflect closure
            setDeal({ ...deal, status: 'WON' });
            
            // Show rating modal immediately
            console.log('Showing rating modal...');
            setShowRatingModal(true);
          } else {
            console.warn('No admin user found, redirecting without rating');
            router.push('/reseller/deals');
          }
        } else {
          console.warn('No distributor found through any method, redirecting without rating');
          router.push('/reseller/deals');
        }
      } else {
        console.log('Deal closed as', closeStatus, '- redirecting without rating');
        // Update deal state
        setDeal({ ...deal, status: closeStatus });
        router.push('/reseller/deals');
      }
    } catch (error) {
      console.error('Error closing deal:', error);
      toast.error('Failed to update deal status');
    }
  };

  const checkExistingRating = async () => {
    if (!user?.id) return;
    
    setLoadingRating(true);
    try {
      const { data, error } = await supabase
        .from('public_ratings')
        .select('*')
        .eq('deal_id', params.id)
        .eq('rater_id', user.id)
        .single();

      if (data && !error) {
        setExistingRating(data);
        console.log('Found existing rating:', data);
      }
    } catch (error) {
      console.log('No existing rating found');
    } finally {
      setLoadingRating(false);
    }
  };

  const handleRatingSuccess = async () => {
    setShowRatingModal(false);
    toast.success('Thank you for your rating!');
    // Reload the rating to display it
    await checkExistingRating();
  };

  const handleOpenRatingModal = async () => {
    try {
      let orgId: string | null = null;
      let orgName = 'Distributor';

      // Try Method 1: Get distributor from deal products
      console.log('Method 1: Checking deal_products...');
      const { data: dealProductsList } = await supabase
        .from('deal_products')
        .select('product_id')
        .eq('deal_id', deal.id)
        .limit(1);

      if (dealProductsList && dealProductsList.length > 0) {
        const productId = dealProductsList[0].product_id;
        const { data: product } = await supabase
          .from('products')
          .select(`
            organization_id,
            organizations:organization_id (id, name)
          `)
          .eq('id', productId)
          .single();
        
        if (product?.organization_id) {
          orgId = product.organization_id;
          const orgData = product.organizations as any;
          orgName = orgData?.name || 'Distributor';
          console.log('✓ Found distributor from products:', orgId, orgName);
        }
      }

      // Try Method 2: Get from deal_engaged_distributors
      if (!orgId) {
        console.log('Method 2: Checking engaged_distributors...');
        const { data: engagedDist } = await supabase
          .from('deal_engaged_distributors')
          .select(`
            distributor_id,
            organizations:distributor_id (id, name)
          `)
          .eq('deal_id', deal.id)
          .limit(1)
          .single();

        if (engagedDist?.distributor_id) {
          orgId = engagedDist.distributor_id;
          const orgData = engagedDist.organizations as any;
          orgName = orgData?.name || 'Distributor';
          console.log('✓ Found distributor from engaged_distributors:', orgId, orgName);
        }
      }

      // Try Method 3: Get from won_quote_id if deal is WON
      if (!orgId && deal.status === 'WON' && deal.wonQuoteId) {
        console.log('Method 3: Checking won_quote...');
        const { data: quote } = await supabase
          .from('quotes')
          .select(`
            distributor_id,
            organizations:distributor_id (id, name)
          `)
          .eq('id', deal.wonQuoteId)
          .single();

        if (quote?.distributor_id) {
          orgId = quote.distributor_id;
          const orgData = quote.organizations as any;
          orgName = orgData?.name || 'Distributor';
          console.log('✓ Found distributor from won_quote:', orgId, orgName);
        }
      }

      // If still no distributor found, show helpful error
      if (!orgId) {
        console.error('Could not find distributor through any method');
        toast.error('Cannot find distributor to rate. Please contact support.');
        return;
      }

      console.log('Final distributor:', orgId, orgName);

      // Get an admin user from the distributor organization to rate
      const { data: adminUser } = await supabase
        .from('users')
        .select('id, name')
        .eq('organization_id', orgId)
        .eq('role', 'ADMIN')
        .limit(1)
        .single();

      console.log('Admin user:', adminUser);

      if (adminUser) {
        setRatingDistributorId(adminUser.id);
        setRatingDistributorName(orgName);
        setShowRatingModal(true);
      } else {
        // If no admin, try to get any user from that organization
        const { data: anyUser } = await supabase
          .from('users')
          .select('id, name')
          .eq('organization_id', orgId)
          .limit(1)
          .single();
        
        if (anyUser) {
          setRatingDistributorId(anyUser.id);
          setRatingDistributorName(orgName);
          setShowRatingModal(true);
        } else {
          toast.error('Could not find distributor contact to rate');
        }
      }
    } catch (error) {
      console.error('Error loading distributor:', error);
      toast.error('Failed to load distributor information');
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
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={deal.status === 'WON' ? 'success' : 'warning'}>{deal.status || 'Unknown'}</Badge>
              <span className="text-gray-600">Deal ID: {deal.id}</span>
              {deal.status === 'WON' && wonDistributorName && (
                <div className="flex items-center gap-1.5 bg-green-100 border border-green-300 rounded-full px-3 py-0.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-800">Won by: {wonDistributorName}</span>
                </div>
              )}
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
            {(deal.dealType === 'BIDDING' || deal.dealType === 'DEAL_REGISTRATION') && quotesCount > 0 && (
              <Link href={`/reseller/deals/${deal.id}/quotes`}>
                <Button variant="outline">
                  View Quotes ({quotesCount})
                </Button>
              </Link>
            )}
            {(deal.status === 'WON' || deal.status === 'LOST') ? (
              existingRating ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    You rated this deal ({existingRating.rating}/5 ⭐)
                  </span>
                </div>
              ) : loadingRating ? (
                <Button variant="outline" disabled>
                  <Star className="h-4 w-4 mr-2" />
                  Loading...
                </Button>
              ) : (
                <Button onClick={handleOpenRatingModal}>
                  <Star className="h-4 w-4 mr-2" />
                  Rate This Deal
                </Button>
              )
            ) : (
              <Button variant="outline" onClick={() => setShowCloseModal(true)}>
                Close Deal
              </Button>
            )}
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
              <Button variant="outline" onClick={() => setShowMessageDistributorModal(true)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Distributor
              </Button>
              <Button variant="outline" onClick={() => setShowMeetingModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Meeting/Activity
              </Button>
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

        {/* Rating Display */}
        {existingRating && (deal.status === 'WON' || deal.status === 'LOST') && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
                Your Rating for This Deal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Overall Rating</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 ${
                          star <= existingRating.rating
                            ? 'text-orange-500 fill-orange-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-lg font-bold text-gray-900">
                      {existingRating.rating}/5
                    </span>
                  </div>
                </div>

                {existingRating.review_title && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Review Title</p>
                    <p className="font-semibold text-gray-900">{existingRating.review_title}</p>
                  </div>
                )}

                {existingRating.review_text && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Review</p>
                    <p className="text-gray-900">{existingRating.review_text}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">
                    Submitted on {new Date(existingRating.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Rating Modal - Unified Component */}
        {showRatingModal && ratingDistributorId && (
          <RatingModal
            type="deal"
            targetId={deal.id}
            targetName={ratingDistributorName}
            dealId={deal.id}
            ratedUserId={ratingDistributorId}
            onClose={() => {
              setShowRatingModal(false);
              router.push('/reseller/deals');
            }}
            onSuccess={handleRatingSuccess}
          />
        )}

        {/* Convert to Bidding Modal */}
        {showConvertModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <h3 className="text-xl font-bold">Convert to Bidding</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Select distributors to invite for bidding. Only selected distributors will see this deal and can submit quotes.
                </p>

                {/* Distributor Multi-Select */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Distributors *</label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {distributors.length === 0 ? (
                      <p className="text-sm text-gray-500">No distributors available</p>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                          <input
                            type="checkbox"
                            checked={selectedDistributors.length === distributors.length}
                            onChange={(e) => setSelectedDistributors(e.target.checked ? distributors.map(d => d.id) : [])}
                            className="h-4 w-4 rounded"
                          />
                          <label className="text-sm font-semibold text-gray-700">Select All ({distributors.length})</label>
                        </div>
                        {distributors.map((dist) => (
                          <div key={dist.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              checked={selectedDistributors.includes(dist.id)}
                              onChange={(e) => setSelectedDistributors(
                                e.target.checked
                                  ? [...selectedDistributors, dist.id]
                                  : selectedDistributors.filter(id => id !== dist.id)
                              )}
                              className="h-4 w-4 rounded"
                            />
                            <label className="text-sm text-gray-700">{dist.name}{dist.city ? ` · ${dist.city}` : ''}</label>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{selectedDistributors.length} distributor{selectedDistributors.length !== 1 ? 's' : ''} selected</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• Selected distributors will be notified immediately</li>
                    <li>• Your lock badge and activity score are preserved</li>
                    <li>• Deal moves to the Open Bidding section</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConvertToBidding}
                    disabled={converting || selectedDistributors.length === 0}
                    className="flex-1"
                  >
                    {converting ? 'Converting...' : `Convert & Invite ${selectedDistributors.length > 0 ? `(${selectedDistributors.length})` : ''}`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setShowConvertModal(false); setSelectedDistributors([]); }}
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

        {/* Message Distributor Modal */}
        {showMessageDistributorModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    Message Distributor
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setShowMessageDistributorModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {engagedDistributors.length > 1 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Send To</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                      value={messageDistributorTarget}
                      onChange={(e) => setMessageDistributorTarget(e.target.value)}
                    >
                      <option value="">All engaged distributors</option>
                      {engagedDistributors.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <Textarea
                  value={messageDistributorText}
                  onChange={(e) => setMessageDistributorText(e.target.value)}
                  placeholder="Type your message to the distributor..."
                  rows={4}
                  className="mb-4"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleSendDistributorMessage}
                    disabled={sendingDistributorMsg || !messageDistributorText.trim()}
                    className="flex-1"
                  >
                    {sendingDistributorMsg ? 'Sending...' : 'Send Message'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowMessageDistributorModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Deal Messages Thread */}
        {(dealMessages.length > 0 || engagedDistributors.length > 0) && (
          <div id="messages" className="mt-6">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  Deal Messages
                  {dealMessages.filter(m => !m.read && m.sender_id !== user?.id).length > 0 && (
                    <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                      {dealMessages.filter(m => !m.read && m.sender_id !== user?.id).length} new
                    </span>
                  )}
                </h3>

                {/* Thread */}
                <div className="space-y-3 max-h-80 overflow-y-auto mb-4 pr-1">
                  {dealMessages.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">No messages yet. Start the conversation.</p>
                  )}
                  {dealMessages.map((msg: any) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}>
                          {!isMe && (
                            <p className="text-xs font-semibold mb-0.5 opacity-70">
                              {msg.users?.name || 'Distributor'}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' · '}{new Date(msg.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick reply inline */}
                {engagedDistributors.length > 0 && (
                  <div className="flex gap-2 border-t pt-3">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type a message..."
                      rows={2}
                      className="flex-1 resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyText.trim()}
                      className="self-end"
                    >
                      {sendingReply ? '...' : 'Send'}
                    </Button>
                  </div>
                )}
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
