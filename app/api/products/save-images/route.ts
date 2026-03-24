import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { product_id, image_urls } = await request.json();

    if (!product_id || !image_urls || !Array.isArray(image_urls)) {
      return NextResponse.json(
        { error: 'Invalid request - product_id and image_urls array required' },
        { status: 400 }
      );
    }

    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const savedImages = [];
    const errors = [];

    for (let i = 0; i < image_urls.length; i++) {
      const { data, error } = await supabase
        .from('product_images')
        .insert({
          product_id: product_id,
          url: image_urls[i],
          display_order: i
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving product image:', error);
        errors.push({ index: i, url: image_urls[i], error: error.message });
      } else {
        savedImages.push(data);
      }
    }

    if (errors.length > 0 && savedImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to save all images', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      saved_count: savedImages.length,
      error_count: errors.length,
      images: savedImages,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Error in save-images API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
