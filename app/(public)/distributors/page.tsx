'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Star, CheckCircle, MapPin, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Organization } from '@/lib/types';

export default function DistributorsPage() {
  const [distributors, setDistributors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadDistributors();
  }, []);

  const loadDistributors = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('type', 'DISTRIBUTOR');

      if (error) throw error;
      
      setDistributors(data || []);
      
      // Load product counts for each distributor
      if (data) {
        const counts: Record<string, number> = {};
        await Promise.all(
          data.map(async (dist) => {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', dist.id);
            counts[dist.id] = count || 0;
          })
        );
        setProductCounts(counts);
      }
    } catch (error) {
      console.error('Error loading distributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDistributors = distributors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === 'all' || d.address_country === locationFilter;
    return matchesSearch && matchesLocation;
  });

  const countries = Array.from(new Set(distributors.map(d => d.address_country).filter(Boolean)));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Trusted Distributors</h1>
        <p className="text-lg text-gray-600">Connect with verified distributors across the globe</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search distributors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="all">All Locations</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDistributors.map((distributor) => {
            const productCount = productCounts[distributor.id] || 0;
          
          return (
            <Link key={distributor.id} href={`/distributors/${distributor.id}`}>
              <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">{distributor.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{distributor.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({distributor.rating})</span>
                        {distributor.verified && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{distributor.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="h-4 w-4" />
                      <span>{productCount} products</span>
                    </div>
                    {distributor.address_city && distributor.address_country && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{distributor.address_city}, {distributor.address_country}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {distributor.industry && (
                      <Badge variant="default">{distributor.industry}</Badge>
                    )}
                    {distributor.verified && (
                      <Badge variant="success">Verified</Badge>
                    )}
                  </div>

                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
          })}
        </div>
      )}

      {filteredDistributors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No distributors found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
