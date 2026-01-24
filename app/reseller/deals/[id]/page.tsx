'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Award, X, Star, DollarSign, Calendar, Building } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

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

  const deal = {
    id: params.id,
    name: 'Enterprise Network Upgrade',
    customer: 'XYZ Corporation',
    value: 125000,
    closeDate: '2024-03-15',
    status: 'QUOTED',
    distributors: ['TechDist Global', 'NetSupply Corp', 'CloudFirst Distribution'],
    quotes: 3,
    bestQuote: 118500,
    createdAt: '2024-01-18',
  };

  const handleCloseDeal = () => {
    if (closeStatus === 'WON' && !wonAmount) {
      toast.error('Please enter the won amount');
      return;
    }

    // Save deal closure
    const deals = JSON.parse(localStorage.getItem('deals') || '[]');
    const dealIndex = deals.findIndex((d: any) => d.id === params.id);
    if (dealIndex >= 0) {
      deals[dealIndex].status = closeStatus;
      deals[dealIndex].closedAt = new Date().toISOString();
      deals[dealIndex].wonAmount = closeStatus === 'WON' ? Number(wonAmount) : undefined;
      deals[dealIndex].closeReason = closeReason;
      localStorage.setItem('deals', JSON.stringify(deals));
    }

    toast.success(`Deal marked as ${closeStatus}!`);
    setShowCloseModal(false);
    
    if (closeStatus === 'WON') {
      setTimeout(() => setShowRatingModal(true), 500);
    } else {
      router.push('/reseller/deals');
    }
  };

  const handleSubmitRating = () => {
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    const ratingData = {
      id: `rating-${Date.now()}`,
      dealId: params.id,
      fromOrg: 'org4', // ABC Resellers
      toOrg: 'org1', // TechDist Global (example)
      rating,
      comment: ratingComment,
      createdAt: new Date().toISOString(),
    };

    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    ratings.push(ratingData);
    localStorage.setItem('ratings', JSON.stringify(ratings));

    toast.success('Rating submitted successfully!');
    setShowRatingModal(false);
    router.push('/reseller/deals');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{deal.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant={deal.status === 'WON' ? 'success' : 'warning'}>{deal.status}</Badge>
              <span className="text-gray-600">Deal ID: {deal.id}</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowCloseModal(true)}>
            Close Deal
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Building className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Customer</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{deal.customer}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Deal Value</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(deal.value)}</p>
              {deal.bestQuote && (
                <p className="text-sm text-green-600 mt-1">Best quote: {formatCurrency(deal.bestQuote)}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Expected Close</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{deal.closeDate}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Engaged Distributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deal.distributors.map((dist, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{dist}</p>
                    <p className="text-sm text-gray-600">Quote submitted</p>
                  </div>
                  <Button variant="outline" size="sm">View Quote</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
