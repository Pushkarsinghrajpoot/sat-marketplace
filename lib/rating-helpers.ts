import { supabase } from './supabase';
import { sendNotification } from './notification-client';

export async function createRating(data: {
  dealId: string;
  raterId: string;
  raterOrganizationId: string;
  ratedUserId: string;
  ratedOrganizationId?: string | null;
  rating: number;
  reviewTitle?: string;
  reviewText?: string;
  ratingCategories?: any;
}) {
  try {
    console.log('createRating called with data:', data);
    
    const insertData: any = {
      deal_id: data.dealId,
      rater_id: data.raterId,
      rater_organization_id: data.raterOrganizationId,
      rated_user_id: data.ratedUserId,
      rating: data.rating,
      review_title: data.reviewTitle,
      review_text: data.reviewText,
      rating_categories: data.ratingCategories || {},
      visibility: 'PUBLIC',
      is_verified: true,
    };
    
    // Only add rated_organization_id if it's a valid value
    if (data.ratedOrganizationId) {
      insertData.rated_organization_id = data.ratedOrganizationId;
    }
    
    console.log('Inserting to public_ratings:', insertData);
    
    const { data: rating, error } = await supabase
      .from('public_ratings')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // Notify the rated user
    await sendNotification({
      userId: data.ratedUserId,
      notificationType: 'NEW_RATING',
      title: 'New Rating Received',
      message: `You received a ${data.rating}-star rating`,
      link: `/profile/${data.ratedUserId}`,
    });

    return { success: true, rating };
  } catch (error) {
    console.error('Error creating rating:', error);
    return { success: false, error };
  }
}

export async function getRatingsForUser(userId: string, options?: {
  limit?: number;
  includePrivate?: boolean;
}) {
  try {
    let query = supabase
      .from('public_ratings')
      .select(`
        *,
        rater:rater_id (
          id,
          name,
          email
        ),
        rater_org:rater_organization_id (
          id,
          name
        ),
        deals (
          id,
          opportunity_name
        )
      `)
      .eq('rated_user_id', userId)
      .order('created_at', { ascending: false });

    if (!options?.includePrivate) {
      query = query.eq('visibility', 'PUBLIC');
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}

export async function getRatingsForOrganization(organizationId: string, options?: {
  limit?: number;
  includePrivate?: boolean;
}) {
  try {
    let query = supabase
      .from('public_ratings')
      .select(`
        *,
        rater:rater_id (
          id,
          name
        ),
        rater_org:rater_organization_id (
          id,
          name
        ),
        rated_user:rated_user_id (
          id,
          name
        )
      `)
      .eq('rated_organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (!options?.includePrivate) {
      query = query.eq('visibility', 'PUBLIC');
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}

export async function getRatingAggregate(userId?: string, organizationId?: string) {
  try {
    let query = supabase
      .from('rating_aggregates')
      .select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (organizationId) {
      query = query.eq('organization_id', organizationId);
    } else {
      return null;
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || {
      total_ratings: 0,
      average_rating: 0,
      rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      last_30_days_count: 0,
      last_30_days_average: 0,
    };
  } catch (error) {
    console.error('Error fetching rating aggregate:', error);
    return null;
  }
}

export async function markRatingHelpful(ratingId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('rating_helpful_votes')
      .insert({
        rating_id: ratingId,
        user_id: userId,
      });

    if (error) {
      // Check if already voted
      if (error.code === '23505') {
        // Remove vote instead
        const { error: deleteError } = await supabase
          .from('rating_helpful_votes')
          .delete()
          .eq('rating_id', ratingId)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;
        return { success: true, action: 'removed' };
      }
      throw error;
    }

    return { success: true, action: 'added' };
  } catch (error) {
    console.error('Error marking rating helpful:', error);
    return { success: false, error };
  }
}

export async function respondToRating(ratingId: string, responseText: string, userId: string) {
  try {
    const { error } = await supabase
      .from('public_ratings')
      .update({
        response_text: responseText,
        response_at: new Date().toISOString(),
      })
      .eq('id', ratingId)
      .eq('rated_user_id', userId); // Only rated user can respond

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error responding to rating:', error);
    return { success: false, error };
  }
}

export async function updateRatingVisibility(
  ratingId: string,
  visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN',
  userId: string
) {
  try {
    const { error } = await supabase
      .from('public_ratings')
      .update({ visibility })
      .eq('id', ratingId)
      .eq('rated_user_id', userId); // Only rated user can change visibility

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating rating visibility:', error);
    return { success: false, error };
  }
}

export async function getRatingStats(userId?: string, organizationId?: string) {
  try {
    const aggregate = await getRatingAggregate(userId, organizationId);
    
    if (!aggregate) return null;

    // Calculate percentages
    const distribution = aggregate.rating_distribution as any;
    const total = aggregate.total_ratings;
    
    const percentages = {
      5: total > 0 ? Math.round((distribution['5'] / total) * 100) : 0,
      4: total > 0 ? Math.round((distribution['4'] / total) * 100) : 0,
      3: total > 0 ? Math.round((distribution['3'] / total) * 100) : 0,
      2: total > 0 ? Math.round((distribution['2'] / total) * 100) : 0,
      1: total > 0 ? Math.round((distribution['1'] / total) * 100) : 0,
    };

    return {
      ...aggregate,
      percentages,
      trend: aggregate.last_30_days_average - aggregate.average_rating,
    };
  } catch (error) {
    console.error('Error calculating rating stats:', error);
    return null;
  }
}
