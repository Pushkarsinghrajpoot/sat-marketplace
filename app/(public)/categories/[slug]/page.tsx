'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/lib/types';

export default function CategoryPage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [params.slug]);

  const fetchCategoryAndProducts = async () => {
    try {
      // Fetch category by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'ACTIVE')
        .single();

      if (categoryError) {
        console.error('Error fetching category:', categoryError);
        return;
      }

      if (categoryData) {
        const cat: Category = {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          icon: 'Network',
          productCount: categoryData.product_count || 0
        };
        setCategory(cat);

        // Fetch products for this category
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('category_id', categoryData.id)
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Error fetching products:', productsError);
          return;
        }

        const formattedProducts = (productsData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          image: p.product_images?.[0]?.url || '',
          category: p.category_id,
          availability: p.stock_status || 'IN_STOCK',
          rating: p.average_rating || 0,
          reviews: 0,
          createdAt: p.created_at
        })) as any;

        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error in fetchCategoryAndProducts:', error);
    }
  };

  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    if (availability.length > 0) {
      filtered = filtered.filter(p => availability.includes(p.availability));
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, sortBy, priceRange, selectedBrands, availability, products]);

  const brands = Array.from(new Set(products.map(p => p.brand)));

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-4">
        <span>Home</span> &gt; <span>Categories</span> &gt; <span className="text-gray-900 font-medium">{category?.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category?.name}</h1>
        <p className="text-gray-600">{filteredProducts.length} products available</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedBrands([]);
                  setAvailability([]);
                  setPriceRange({ min: 0, max: 100000 });
                }}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Availability</h4>
                  <div className="space-y-2">
                    {['IN_STOCK', 'LIMITED_STOCK'].map(status => (
                      <label key={status} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={availability.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAvailability([...availability, status]);
                            } else {
                              setAvailability(availability.filter(s => s !== status));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{status === 'IN_STOCK' ? 'In Stock' : 'Limited Stock'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Brand</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="relevance">Sort by: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </Select>
          </div>

          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No products found matching your criteria</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSearchQuery('');
                  setSelectedBrands([]);
                  setAvailability([]);
                  setPriceRange({ min: 0, max: 100000 });
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
