'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Upload, X } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { toast } from 'sonner';
import { createProduct, getCategories } from '@/lib/data-helpers';
import { formatCurrency } from '@/lib/utils';

export default function AddProductPage() {
  const router = useRouter();
  const { user, organization } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tempUploadPreviews, setTempUploadPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    brand: '',
    description: '',
    shortDescription: '',
    price: 0,
    volumePricing: [] as Array<{ minQuantity: number; maxQuantity?: number; price: number; discount: number }>,
    inventory: 0,
    lowStockThreshold: 50,
    availability: 'IN_STOCK',
    leadTime: 'In Stock',
    specifications: [] as Array<{ group: string; label: string; value: string; unit: string }>,
    tags: '',
    featured: false,
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    }
    fetchCategories();
  }, []);

  const addVolumePricing = () => {
    setFormData(prev => ({
      ...prev,
      volumePricing: [...prev.volumePricing, { minQuantity: 0, price: 0, discount: 0 }]
    }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { group: 'Hardware', label: '', value: '', unit: '' }]
    }));
  };

  const handleAddImageUrl = () => {
    if (!currentImageUrl) {
      toast.error('Please enter an image URL');
      return;
    }

    // Validate URL format
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

    // Create temporary previews immediately
    const previews: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setTempUploadPreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setUploadingImages(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/products/upload-images', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      // Replace temp previews with actual URLs
      setTempUploadPreviews([]);
      setUploadedImages(prev => [...prev, ...data.urls]);
      toast.success(`${data.count} image(s) uploaded successfully`);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Failed to upload images');
      setTempUploadPreviews([]);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number, type: 'url' | 'upload') => {
    if (type === 'url') {
      setImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!user?.id) {
      toast.error('Please login to create products');
      return;
    }

    if (!formData.name || !formData.sku || !formData.category || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        organization_id: user.organizationId,
        name: formData.name,
        sku: formData.sku,
        category_id: formData.category || null,
        brand: formData.brand,
        description: formData.description,
        short_description: formData.shortDescription,
        price: Number(formData.price),
        currency: 'SAR',
        inventory: Number(formData.inventory),
        low_stock_threshold: Number(formData.lowStockThreshold),
        availability: formData.availability,
        lead_time: formData.leadTime,
        status: isDraft ? 'DRAFT' : 'ACTIVE',
        views: 0,
        featured: formData.featured,
      };

      const product = await createProduct(productData);

      // Save images to product_images table (URLs first, then uploads)
      if (product && (imageUrls.length > 0 || uploadedImages.length > 0)) {
        const allImageUrls = [...imageUrls, ...uploadedImages];
        const { supabase } = await import('@/lib/supabase');
        
        for (let i = 0; i < allImageUrls.length; i++) {
          await supabase
            .from('product_images')
            .insert({
              product_id: product.id,
              url: allImageUrls[i],
              display_order: i
            });
        }
      }
      
      const imageCount = imageUrls.length + uploadedImages.length;
      const message = isDraft 
        ? `Product saved as draft${imageCount > 0 ? ` with ${imageCount} image(s)` : ''}!`
        : `Product published successfully${imageCount > 0 ? ` with ${imageCount} image(s)` : ''}!`;
      
      toast.success(message);
      router.push('/distributor/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
            <p className="text-gray-600">Create a new product listing</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
            <Button variant="outline" onClick={() => handleSubmit(true)} disabled={loading}>
              {loading ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button onClick={() => handleSubmit(false)} disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Product'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Cisco Catalyst 9300 48-Port Switch"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SKU *</label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      placeholder="CAT9300-48P"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand *</label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="Cisco"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Short Description</label>
                  <Input
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                    placeholder="Brief product description for listings"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={6}
                    placeholder="Detailed product description..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Base Price (SAR) *</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    placeholder="4999"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium">Volume Pricing (Optional)</label>
                    <Button variant="outline" size="sm" onClick={addVolumePricing}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Tier
                    </Button>
                  </div>
                  {formData.volumePricing.map((vp, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                      <Input
                        type="number"
                        placeholder="Min Qty"
                        value={vp.minQuantity}
                        onChange={(e) => {
                          const newVP = [...formData.volumePricing];
                          newVP[idx].minQuantity = Number(e.target.value);
                          setFormData({...formData, volumePricing: newVP});
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Max Qty"
                        value={vp.maxQuantity || ''}
                        onChange={(e) => {
                          const newVP = [...formData.volumePricing];
                          newVP[idx].maxQuantity = e.target.value ? Number(e.target.value) : undefined;
                          setFormData({...formData, volumePricing: newVP});
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        value={vp.price}
                        onChange={(e) => {
                          const newVP = [...formData.volumePricing];
                          newVP[idx].price = Number(e.target.value);
                          setFormData({...formData, volumePricing: newVP});
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Discount %"
                        value={vp.discount}
                        onChange={(e) => {
                          const newVP = [...formData.volumePricing];
                          newVP[idx].discount = Number(e.target.value);
                          setFormData({...formData, volumePricing: newVP});
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Available Quantity *</label>
                    <Input
                      type="number"
                      value={formData.inventory}
                      onChange={(e) => setFormData({...formData, inventory: Number(e.target.value)})}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Low Stock Alert</label>
                    <Input
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({...formData, lowStockThreshold: Number(e.target.value)})}
                      placeholder="50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Availability Status</label>
                  <Select
                    value={formData.availability}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LIMITED_STOCK">Limited Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="PRE_ORDER">Pre-order</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lead Time</label>
                  <Input
                    value={formData.leadTime}
                    onChange={(e) => setFormData({...formData, leadTime: e.target.value})}
                    placeholder="Ships in 3-5 days"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {formData.specifications.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2">
                      <Input
                        placeholder="Group"
                        value={spec.group}
                        onChange={(e) => {
                          const newSpecs = [...formData.specifications];
                          newSpecs[idx].group = e.target.value;
                          setFormData({...formData, specifications: newSpecs});
                        }}
                      />
                      <Input
                        placeholder="Label"
                        value={spec.label}
                        onChange={(e) => {
                          const newSpecs = [...formData.specifications];
                          newSpecs[idx].label = e.target.value;
                          setFormData({...formData, specifications: newSpecs});
                        }}
                      />
                      <Input
                        placeholder="Value"
                        value={spec.value}
                        onChange={(e) => {
                          const newSpecs = [...formData.specifications];
                          newSpecs[idx].value = e.target.value;
                          setFormData({...formData, specifications: newSpecs});
                        }}
                      />
                      <Input
                        placeholder="Unit"
                        value={spec.unit}
                        onChange={(e) => {
                          const newSpecs = [...formData.specifications];
                          newSpecs[idx].unit = e.target.value;
                          setFormData({...formData, specifications: newSpecs});
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSpecs = formData.specifications.filter((_, i) => i !== idx);
                          setFormData({...formData, specifications: newSpecs});
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={addSpecification}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Specification
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images & Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Image URL Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Add Image URL</label>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        value={currentImageUrl}
                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
                      />
                      <Button type="button" onClick={handleAddImageUrl} variant="outline" disabled={!currentImageUrl}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add URL
                      </Button>
                    </div>
                    {/* Show added URLs */}
                    {imageUrls.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-gray-500">Added URLs:</p>
                        {imageUrls.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex-shrink-0 w-12 h-12 bg-white rounded overflow-hidden border">
                              <img
                                src={url}
                                alt={`URL ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10"%3E✕%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 truncate">{url}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(idx, 'url')}
                              className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Or Upload Images</label>
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer transition-colors">
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-1">{uploadingImages ? 'Uploading...' : 'Click to upload'}</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                    </label>
                  </div>

                  {/* Display all images */}
                  {(imageUrls.length > 0 || uploadedImages.length > 0) && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium">Product Images</label>
                      <div className="grid grid-cols-4 gap-4">
                        {/* URL Images */}
                        {imageUrls.map((image, idx) => (
                          <div key={`url-${idx}`} className="relative group">
                            <img
                              src={image}
                              alt={`URL ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx, 'url')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">URL</span>
                          </div>
                        ))}
                        {/* Uploaded Images */}
                        {uploadedImages.map((image, idx) => (
                          <div key={`upload-${idx}`} className="relative group">
                            <img
                              src={image}
                              alt={`Upload ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx, 'upload')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Uploaded</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Publishing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search Tags</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="networking, switch, cisco"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="rounded"
                  />
                  <label className="text-sm">Feature on homepage</label>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Product Preview</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      {(() => {
                        const allImages = [...imageUrls, ...uploadedImages, ...tempUploadPreviews];
                        return allImages.length > 0 ? (
                          <img
                            src={allImages[0]}
                            alt="Product preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        );
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
