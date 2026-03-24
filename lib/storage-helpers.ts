import { supabaseServer } from './supabase-server';

/**
 * Upload image to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'products')
 * @param folder - Optional folder path within the bucket
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToStorage(
  file: File,
  bucket: string = 'products',
  folder?: string
): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    
    // Construct file path
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseServer.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImageToStorage:', error);
    throw error;
  }
}

/**
 * Upload multiple images to Supabase Storage
 * @param files - Array of image files to upload
 * @param bucket - The storage bucket name (default: 'products')
 * @param folder - Optional folder path within the bucket
 * @returns Array of public URLs of uploaded images
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: string = 'products',
  folder?: string
): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => 
      uploadImageToStorage(file, bucket, folder)
    );
    
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

/**
 * Delete image from Supabase Storage
 * @param filePath - The file path in the bucket
 * @param bucket - The storage bucket name (default: 'products')
 */
export async function deleteImageFromStorage(
  filePath: string,
  bucket: string = 'products'
): Promise<void> {
  try {
    const { error } = await supabaseServer.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting from Supabase Storage:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteImageFromStorage:', error);
    throw error;
  }
}
