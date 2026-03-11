import { supabase } from './supabase';
import type { EnhancedProduct, ProductService, ProductTechSpec, ProductInquiry, DemoRequest } from './types';

// Get all products with enhanced details
export async function getEnhancedProducts(filters?: {
  organizationId?: string;
  categoryId?: string;
  status?: string;
  featured?: boolean;
  trending?: boolean;
  searchQuery?: string;
}) {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_services (*),
        product_tech_specs (*),
        product_reviews (*),
        product_images (*),
        product_documents (*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.trending) {
      query = query.eq('is_trending', true);
    }

    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,brand.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching enhanced products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEnhancedProducts:', error);
    return [];
  }
}

// Get single product with all details
export async function getProductById(productId: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_services (*),
        product_tech_specs (*),
        product_reviews (*),
        product_images (*),
        product_documents (*)
      `)
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getProductById:', error);
    return null;
  }
}

// Create product inquiry
export async function createProductInquiry(inquiry: {
  productId: string;
  userId: string;
  inquiryType: string;
  subject: string;
  question: string;
}) {
  try {
    // Convert camelCase to snake_case for database
    const { data, error } = await supabase
      .from('product_inquiries')
      .insert([{
        product_id: inquiry.productId,
        user_id: inquiry.userId,
        inquiry_type: inquiry.inquiryType,
        subject: inquiry.subject,
        question: inquiry.question
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating inquiry:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createProductInquiry:', error);
    throw error;
  }
}

// Create demo request
export async function createDemoRequest(demoRequest: {
  productId: string;
  userId: string;
  organizationId: string;
  preferredDate?: string;
  preferredTime?: string;
  locationType: string;
  locationDetails?: string;
  attendeeCount: number;
  specialRequirements?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('demo_requests')
      .insert([demoRequest])
      .select()
      .single();

    if (error) {
      console.error('Error creating demo request:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createDemoRequest:', error);
    throw error;
  }
}

// Get product inquiries for a product
export async function getProductInquiries(productId: string) {
  try {
    const { data, error } = await supabase
      .from('product_inquiries')
      .select('*, users (*)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inquiries:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProductInquiries:', error);
    return [];
  }
}

// Update product inquiry with response
export async function respondToInquiry(inquiryId: string, response: string, respondedBy: string) {
  try {
    const { data, error } = await supabase
      .from('product_inquiries')
      .update({
        response,
        responded_by: respondedBy,
        responded_at: new Date().toISOString(),
        status: 'ANSWERED'
      })
      .eq('id', inquiryId)
      .select()
      .single();

    if (error) {
      console.error('Error responding to inquiry:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in respondToInquiry:', error);
    throw error;
  }
}

// Increment product view count
export async function incrementProductViews(productId: string) {
  try {
    const { error } = await supabase.rpc('increment', {
      table_name: 'products',
      row_id: productId,
      column_name: 'view_count'
    });

    if (error) {
      console.error('Error incrementing views:', error);
    }
  } catch (error) {
    console.error('Error in incrementProductViews:', error);
  }
}

// Add product review
export async function addProductReview(review: {
  productId: string;
  userId: string;
  organizationId: string;
  rating: number;
  title?: string;
  reviewText?: string;
  verifiedPurchase?: boolean;
}) {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert([review])
      .select()
      .single();

    if (error) {
      console.error('Error adding review:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addProductReview:', error);
    throw error;
  }
}

// Get trending products
export async function getTrendingProducts(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_trending', true)
      .eq('status', 'ACTIVE')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTrendingProducts:', error);
    return [];
  }
}

// Get featured products
export async function getFeaturedProducts(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    return [];
  }
}
