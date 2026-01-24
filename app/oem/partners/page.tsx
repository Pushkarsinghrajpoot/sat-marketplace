'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Award, MapPin, Star, Download } from 'lucide-react';

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const partners = [
    { id: '1', name: 'ABC Resellers Inc.', tier: 'Gold', certifications: ['Advanced Sales', 'Technical Expert'], location: 'Boston, MA', rating: 4.5, deals: 45 },
    { id: '2', name: 'Premier Solutions Group', tier: 'Platinum', certifications: ['Master Reseller', 'Cloud Specialist'], location: 'New York, NY', rating: 4.9, deals: 178 },
    { id: '3', name: 'TechVentures LLC', tier: 'Silver', certifications: ['Certified Reseller'], location: 'San Francisco, CA', rating: 4.3, deals: 28 },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner Directory</h1>
          <p className="text-gray-600">View and manage your authorized partners</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export List
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
              <option value="all">All Tiers</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <Card key={partner.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                    {partner.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({partner.rating})</span>
                    </div>
                  </div>
                </div>
                <Badge variant={
                  partner.tier === 'Platinum' ? 'info' :
                  partner.tier === 'Gold' ? 'warning' :
                  'default'
                }>
                  {partner.tier}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{partner.location}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Certifications:</p>
                  <div className="flex flex-wrap gap-2">
                    {partner.certifications.map((cert, idx) => (
                      <Badge key={idx} variant="success" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{partner.deals}</span> active deals
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
