'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { updateProduct, getCategories } from '@/lib/data-helpers';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/lib/simple-auth';
import { formatCurrency } from '@/lib/utils';

export default function ResellerEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSimpleAuth();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tempUploadPreviews, setTempUploadPreviews] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            name: data.name || '',
            sku: data.sku || '',
            category: data.category_id || '',
            brand: data.brand || '',
            description: data.description || '',
            shortDescription: data.short_description || '',
            price: data.price || 0,
            inventory: data.inventory || 0,
            lowStockThreshold: data.low_stock_threshold || 50,
            availability: data.availability || 'IN_STOCK',
            leadTime: data.lead_time || 'In Stock',
            status: data.status || 'ACTIVE',
            featured: data.is_featured || false,
            tags: '',
          });

          if (data.product_images && data.product_images.length > 0) {
            const existingUrls = data.product_images
              .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
              .map((img: any) => img.url);
            setImageUrls(existingUrls);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const handleAddImageUrl = () => {
    if (!currentImageUrl) { toast.error('Please enter an image URL'); return; }
    try {
      new URL(currentImageUrl);
      setImageUrls(prev => [...prev, currentImageUrl]);
      setCurrentImageUrl('');
      toast.success('Image URL added');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const previews: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) setTempUploadPreviews(prev => [...prev, ...previews]);
      };
      reader.readAsDataURL(file);
    });

    setUploadingImages(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(file => fd.append('images', file));
      const response = await fetch('/api/products/upload-images', { method: 'POST', body: fd });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload images');
      setTempUploadPreviews([]);
      setUploadedImages(prev => [...prev, ...data.urls]);
      toast.success(`${data.count} image(s) uploaded`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
      setTempUploadPreviews([]);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number, type: 'url' | 'upload') => {
    if (type === 'url') setImageUrls(prev => prev.filter((_, i) => i !== index));
    else setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!formData.name || !formData.sku || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        name: formData.name,
        sku: formData.sku,
        category_id: formData.category || null,
        brand: formData.brand,
        description: formData.description,
        short_description: formData.shortDescription,
        price: Number(formData.price),
        inventory: Number(formData.inventory),
        low_stock_threshold: Number(formData.lowStockThreshold),
        availability: formData.availability,
        lead_time: formData.leadTime,
        status: isDraft ? 'DRAFT' : formData.status,
        is_featured: formData.featured,
      };

      await updateProduct(params.id as string, updates);

      const allImageUrls = [...imageUrls, ...uploadedImages];
      if (allImageUrls.length > 0) {
        await supabase.from('product_images').delete().eq('product_id', params.id);
        const response = await fetch('/api/products/save-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: params.id, image_urls: allImageUrls })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to save images');
      }

      toast.success('Product updated successfully!');
      router.push('/reseller/my-products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-red-500">Product not found.</p>
        <Button onClick={() => router.push('/reseller/my-products')} className="mt-4">Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
            <p className="text-gray-600">Update your product listing</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
            <Button variant="outline" onClick={() => handleSubmit(true)} disabled={saving}>
              {saving ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button onClick={() => handleSubmit(false)} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Info */}
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <Input value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Product name" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SKU *</label>
                    <Input value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="SKU-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand *</label>
                    <Input value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Brand name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Short Description</label>
                  <Input value={formData.shortDescription}
                    onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief product description" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Description *</label>
                  <Textarea value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={6} placeholder="Detailed product description..." />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium mb-2">Base Price (SAR) *</label>
                  <Input type="number" value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0" />
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Available Quantity</label>
                    <Input type="number" value={formData.inventory}
                      onChange={e => setFormData({ ...formData, inventory: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Low Stock Alert</label>
                    <Input type="number" value={formData.lowStockThreshold}
                      onChange={e => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Availability Status</label>
                  <Select value={formData.availability}
                    onChange={e => setFormData({ ...formData, availability: e.target.value })}>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LIMITED_STOCK">Limited Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="PRE_ORDER">Pre-order</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lead Time</label>
                  <Input value={formData.leadTime}
                    onChange={e => setFormData({ ...formData, leadTime: e.target.value })}
                    placeholder="Ships in 3-5 days" />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader><CardTitle>Images & Media</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Add Image URL</label>
                    <div className="flex gap-2">
                      <Input type="url" value={currentImageUrl}
                        onChange={e => setCurrentImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                        onKeyPress={e => e.key === 'Enter' && handleAddImageUrl()} />
                      <Button type="button" onClick={handleAddImageUrl} variant="outline" disabled={!currentImageUrl}>
                        <Plus className="h-4 w-4 mr-2" />Add URL
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Or Upload Images</label>
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer transition-colors">
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-1">{uploadingImages ? 'Uploading...' : 'Click to upload'}</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload}
                        className="hidden" disabled={uploadingImages} />
                    </label>
                  </div>

                  {(imageUrls.length > 0 || uploadedImages.length > 0) && (
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Product Images ({imageUrls.length + uploadedImages.length})
                      </label>
                      <div className="grid grid-cols-4 gap-4">
                        {imageUrls.map((img, idx) => (
                          <div key={`url-${idx}`} className="relative group">
                            <img src={img} alt={`Image ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                            <button type="button" onClick={() => removeImage(idx, 'url')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-4 w-4" />
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Primary</span>
                            )}
                          </div>
                        ))}
                        {uploadedImages.map((img, idx) => (
                          <div key={`upload-${idx}`} className="relative group">
                            <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                            <button type="button" onClick={() => removeImage(idx, 'upload')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">New</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader><CardTitle>Publishing Options</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="ACTIVE">Active (visible to buyers)</option>
                    <option value="DRAFT">Draft (hidden)</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured-edit" checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded" />
                  <label htmlFor="featured-edit" className="text-sm">Feature on homepage</label>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Preview</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      {(() => {
                        const all = [...imageUrls, ...uploadedImages, ...tempUploadPreviews];
                        return all.length > 0
                          ? <img src={all[0]} alt="Preview" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>;
                      })()}
                    </div>
                    <p className="font-semibold text-sm line-clamp-2">{formData.name || 'Product Name'}</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">{formatCurrency(formData.price || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
