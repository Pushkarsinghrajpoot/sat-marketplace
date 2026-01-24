'use client';

import Link from 'next/link';
import { Search, Network, Cloud, Shield, Database, Key, Server, Briefcase, GraduationCap, ArrowRight, CheckCircle, Tag, Lock, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/product-card';
import { useEffect, useState } from 'react';
import type { Product, Category, Organization } from '@/lib/types';

const categoryIcons: { [key: string]: any } = {
  Network, Cloud, Shield, Database, Key, Server, Briefcase, GraduationCap
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [distributors, setDistributors] = useState<Organization[]>([]);

  useEffect(() => {
    const cats = JSON.parse(localStorage.getItem('categories') || '[]');
    const prods = JSON.parse(localStorage.getItem('products') || '[]');
    const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
    
    setCategories(cats.slice(0, 8));
    setFeaturedProducts(prods.filter((p: Product) => p.featured).slice(0, 6));
    setDistributors(orgs.filter((o: Organization) => o.type === 'DISTRIBUTOR').slice(0, 4));
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Connect. Trade. Grow Your Business
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                The trusted B2B marketplace connecting distributors and resellers
              </p>
              <div className="bg-white rounded-xl p-2 shadow-2xl">
                <div className="flex gap-2">
                  <Input
                    type="search"
                    placeholder="Search products, services, or distributors..."
                    className="flex-1 border-0 focus-visible:ring-0"
                  />
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-sm text-blue-100">
                Popular: Network Equipment, Cloud Services, Security Solutions
              </p>
              <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-blue-500">
                <div className="text-center">
                  <div className="text-3xl font-bold">5,000+</div>
                  <div className="text-sm text-blue-200">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm text-blue-200">Distributors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">1,200+</div>
                  <div className="text-sm text-blue-200">Resellers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">$50M+</div>
                  <div className="text-sm text-blue-200">GMV</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full h-96">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
                </div>
                <div className="relative flex items-center justify-center h-full">
                  <TrendingUp className="h-48 w-48 text-blue-200/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600">Discover the perfect solution for your business needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = categoryIcons[category.icon] || Network;
              return (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                        <Icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.productCount.toLocaleString()} products</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <div className="mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Register Deal</h3>
                <p className="text-gray-600 text-sm">Protect your customer opportunity</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <div className="mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <Tag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Get Quotes</h3>
                <p className="text-gray-600 text-sm">Compare offers from distributors</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <div className="mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Close & Earn</h3>
                <p className="text-gray-600 text-sm">Win deals with best pricing</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link href="/auth/register">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Start Your First Deal <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Products</h2>
              <p className="text-gray-600">Discover what's popular in the marketplace</p>
            </div>
            <Link href="/categories">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Marketplace</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Verified Distributors</h3>
                <p className="text-sm text-gray-600">Every distributor is verified</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-sm text-gray-600">Compare quotes side-by-side</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Deal Protection</h3>
                <p className="text-sm text-gray-600">Your deals are protected</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Rated & Reviewed</h3>
                <p className="text-sm text-gray-600">Real ratings from real businesses</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Are you a Distributor?</h3>
                <p className="mb-6 text-blue-100">Reach thousands of qualified resellers</p>
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                    List Products <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Are you a Reseller?</h3>
                <p className="mb-6 text-orange-100">Find the best deals for your customers</p>
                <Link href="/categories">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                    Browse Solutions <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
