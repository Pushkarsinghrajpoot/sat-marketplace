'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { getRatingsForUser, getRatingAggregate, markRatingHelpful } from '@/lib/rating-helpers';
import { useSimpleAuth } from '@/lib/simple-auth';
import { toast } from 'sonner';

interface RatingDisplayProps {
  userId?: string;
  organizationId?: string;
  showStats?: boolean;
}

export function RatingDisplay({ userId, organizationId, showStats = true }: RatingDisplayProps) {
  const { user } = useSimpleAuth();
  const [ratings, setRatings] = useState<any[]>([]);
  const [aggregate, setAggregate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, [userId, organizationId]);

  const loadRatings = async () => {
    try {
      let ratingsData, aggregateData;
      
      if (organizationId) {
        // Get ratings for organization
        const { getRatingsForOrganization } = await import('@/lib/rating-helpers');
        [ratingsData, aggregateData] = await Promise.all([
          getRatingsForOrganization(organizationId, { limit: 10 }),
          getRatingAggregate(undefined, organizationId),
        ]);
      } else if (userId) {
        // Get ratings for user
        [ratingsData, aggregateData] = await Promise.all([
          getRatingsForUser(userId, { limit: 10 }),
          getRatingAggregate(userId),
        ]);
      } else {
        return;
      }
      
      setRatings(ratingsData);
      setAggregate(aggregateData);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (ratingId: string) => {
    if (!user?.id) {
      toast.error('Please log in to mark as helpful');
      return;
    }

    try {
      const result = await markRatingHelpful(ratingId, user.id);
      if (result.success) {
        toast.success(result.action === 'added' ? 'Marked as helpful' : 'Removed helpful mark');
        loadRatings();
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
      toast.error('Failed to update');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading ratings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showStats && aggregate && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">
                  {aggregate.average_rating?.toFixed(1) || '0.0'}
                </p>
                <div className="flex justify-center mt-2">
                  {renderStars(Math.round(aggregate.average_rating || 0))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {aggregate.total_ratings} {aggregate.total_ratings === 1 ? 'rating' : 'ratings'}
                </p>
              </div>

              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = aggregate.rating_distribution?.[star.toString()] || 0;
                  const percentage = aggregate.total_ratings > 0 
                    ? Math.round((count / aggregate.total_ratings) * 100) 
                    : 0;

                  return (
                    <div key={star} className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium w-8">{star} ★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {aggregate.last_30_days_count > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>{aggregate.last_30_days_count}</strong> ratings in the last 30 days
                  {' '}({aggregate.last_30_days_average?.toFixed(1)} avg)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating: any) => (
                <div
                  key={rating.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(rating.rating)}
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {rating.review_title || 'Review'}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {rating.review_text && (
                    <p className="text-gray-700 mb-3">{rating.review_text}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>by {rating.rater?.name || 'Anonymous'}</span>
                    {rating.rater_org?.name && (
                      <span>• {rating.rater_org.name}</span>
                    )}
                    {rating.deals?.opportunity_name && (
                      <span>• Deal: {rating.deals.opportunity_name}</span>
                    )}
                  </div>

                  {rating.response_text && (
                    <div className="mt-3 bg-gray-50 border-l-4 border-blue-500 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-sm">Response</span>
                      </div>
                      <p className="text-sm text-gray-700">{rating.response_text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(rating.response_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkHelpful(rating.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({rating.helpful_count || 0})
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
