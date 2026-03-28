'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Star } from 'lucide-react';
import StarRating from './StarRating';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface RatingModalProps {
  type: 'user' | 'organization' | 'product' | 'service';
  targetId: string;
  targetName: string;
  dealId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CategoryRatings {
  communication?: number;
  pricing?: number;
  delivery?: number;
  support?: number;
  quality?: number;
  responsiveness?: number;
}

export default function RatingModal({
  type,
  targetId,
  targetName,
  dealId,
  onClose,
  onSuccess,
}: RatingModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings>({});
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = type === 'product' || type === 'service'
    ? [
        { key: 'quality', label: 'Quality' },
        { key: 'value', label: 'Value for Money' },
        { key: 'support', label: 'Support' },
      ]
    : [
        { key: 'communication', label: 'Communication' },
        { key: 'pricing', label: 'Pricing' },
        { key: 'delivery', label: 'Delivery/Timeliness' },
        { key: 'support', label: 'Support' },
      ];

  const handleCategoryRating = (key: string, rating: number) => {
    setCategoryRatings(prev => ({ ...prev, [key]: rating }));
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (type === 'product') {
        // Submit product review
        const { error } = await supabase
          .from('product_reviews')
          .insert({
            product_id: targetId,
            user_id: user.id,
            organization_id: userData?.organization_id,
            rating: overallRating,
            title: reviewTitle,
            review_text: reviewText,
            verified_purchase: true,
          });

        if (error) throw error;
      } else {
        // Submit public rating for user/organization
        const ratingData: any = {
          rater_id: user.id,
          rater_organization_id: userData?.organization_id,
          rating: overallRating,
          review_title: reviewTitle,
          review_text: reviewText,
          rating_categories: categoryRatings,
          deal_id: dealId,
        };

        if (type === 'user') {
          ratingData.rated_user_id = targetId;
        } else if (type === 'organization') {
          ratingData.rated_organization_id = targetId;
        }

        const { error } = await supabase
          .from('public_ratings')
          .insert(ratingData);

        if (error) throw error;
      }

      toast.success('Rating submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Rate {targetName}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <StarRating
              rating={overallRating}
              onRatingChange={setOverallRating}
              size="lg"
            />
          </div>

          {/* Category Ratings */}
          <div>
            <label className="block text-sm font-medium mb-3">Category Ratings</label>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{category.label}</span>
                  <StarRating
                    rating={categoryRatings[category.key as keyof CategoryRatings] || 0}
                    onRatingChange={(rating) => handleCategoryRating(category.key, rating)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Review Title</label>
            <Input
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your detailed experience..."
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">{reviewText.length}/1000 characters</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || overallRating === 0}>
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
