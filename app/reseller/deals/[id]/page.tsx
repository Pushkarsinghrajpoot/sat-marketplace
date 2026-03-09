'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Award, X, Star, DollarSign, Calendar, Building, Users, Plus, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { updateDeal, convertDealToBidding, getQuotes } from '@/lib/data-helpers';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import MeetingActivityList from '@/components/meetings/MeetingActivityList';
import { useSimpleAuth } from '@/lib/simple-auth';
import { mapDeal } from '@/lib/data-mappers';
import Link from 'next/link';

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
  const [converting, setConverting] = useState(false);
  const [quotesCount, setQuotesCount] = useState(0);
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
      } catch (error) {
        console.error('Error fetching deal:', error);
        toast.error('Failed to load deal');
      } finally {
        setLoading(false);
      }
    }
    fetchDeal();
  }, [params.id]);

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

  const handleSubmitRating = () => {
    toast.info('Rating feature will be implemented with a ratings table');
    setShowRatingModal(false);
    router.push('/reseller/deals');
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
            {deal.dealType === 'DEAL_REGISTRATION' && deal.isLocked && !deal.convertedToBidding && (
              <Button variant="outline" onClick={() => setShowConvertModal(true)}>
                Convert to Bidding
              </Button>
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

        <Card className="mb-6">
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
              <div>
                <p className="text-sm text-gray-600">Customer Email</p>
                <p className="font-semibold">{deal.customerEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-gray-900">{deal.notes || 'No notes'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                      <label className="block text-sm font-medium mb-2">Won Amount (USD) *</label>
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

        {/* Meeting Modal */}
        {showMeetingModal && user && (
          <CreateMeetingModal
            dealId={deal.id}
            resellerId={user.id}
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
