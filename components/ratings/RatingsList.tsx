'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import StarRating from './StarRating';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Rating {
  id: string;
  rating: number;
  review_title: string;
  review_text: string;
  rating_categories: any;
  created_at: string;
  helpful_count: number;
  rater: {
    name: string;
    organization?: {
      name: string;
    };
  };
  response_text?: string;
  response_at?: string;
}

interface RatingsListProps {
  type: 'user' | 'organization' | 'product';
  targetId: string;
  canRespond?: boolean;
}

export default function RatingsList({ type, targetId, canRespond = false }: RatingsListProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    loadRatings();
  }, [targetId, type]);

  const loadRatings = async () => {
    try {
      let query = supabase
        .from(type === 'product' ? 'product_reviews' : 'public_ratings')
        .select(`
          *,
          rater:rater_id(name, organization:organization_id(name))
        `)
        .order('created_at', { ascending: false });

      if (type === 'user') {
        query = query.eq('rated_user_id', targetId);
      } else if (type === 'organization') {
        query = query.eq('rated_organization_id', targetId);
      } else if (type === 'product') {
        query = query.eq('product_id', targetId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error('Error loading ratings:', error);
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (ratingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to vote');
        return;
      }

      const { error } = await supabase
        .from('rating_helpful_votes')
        .insert({
          rating_id: ratingId,
          user_id: user.id,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('You already marked this as helpful');
        } else {
          throw error;
        }
      } else {
        toast.success('Thanks for your feedback!');
        loadRatings();
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote');
    }
  };

  const handleSubmitResponse = async (ratingId: string) => {
    if (!responseText.trim()) return;

    try {
      const { error } = await supabase
        .from('public_ratings')
        .update({
          response_text: responseText,
          response_at: new Date().toISOString(),
        })
        .eq('id', ratingId);

      if (error) throw error;

      toast.success('Response submitted');
      setRespondingTo(null);
      setResponseText('');
      loadRatings();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading ratings...
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No ratings yet. Be the first to leave a review!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <Card key={rating.id}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {rating.rater?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{rating.rater?.name}</p>
                    {rating.rater?.organization && (
                      <p className="text-sm text-gray-500">{rating.rater.organization.name}</p>
                    )}
                  </div>
                </div>
                <StarRating rating={rating.rating} readonly size="sm" />
              </div>
              <span className="text-sm text-gray-500">
                {new Date(rating.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Review Title */}
            {rating.review_title && (
              <h4 className="font-semibold mb-2">{rating.review_title}</h4>
            )}

            {/* Review Text */}
            {rating.review_text && (
              <p className="text-gray-700 mb-4">{rating.review_text}</p>
            )}

            {/* Category Ratings */}
            {rating.rating_categories && Object.keys(rating.rating_categories).length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Category Ratings:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(rating.rating_categories).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{key}</span>
                      <StarRating rating={value as number} readonly size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response */}
            {rating.response_text && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500">
                <p className="text-sm font-medium text-blue-900 mb-1">Response from seller:</p>
                <p className="text-sm text-gray-700">{rating.response_text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(rating.response_at!).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpful(rating.id)}
                className="text-gray-600 hover:text-blue-600"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Helpful ({rating.helpful_count})
              </Button>

              {canRespond && !rating.response_text && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRespondingTo(rating.id)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Respond
                </Button>
              )}
            </div>

            {/* Response Form */}
            {respondingTo === rating.id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response..."
                  className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  maxLength={500}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRespondingTo(null);
                      setResponseText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSubmitResponse(rating.id)}>
                    Submit Response
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
