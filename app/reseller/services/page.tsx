'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Star, DollarSign, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const services = [
    {
      id: '1',
      name: 'IT Consulting Services',
      category: 'Professional Services',
      description: 'End-to-end IT consulting for enterprise clients',
      pricing: 'Starting at $5,000/project',
      status: 'Active',
      rating: 4.8,
      reviews: 24,
    },
    {
      id: '2',
      name: 'Cloud Migration Support',
      category: 'Cloud Services',
      description: 'Seamless cloud migration with zero downtime',
      pricing: 'Starting at $10,000/project',
      status: 'Active',
      rating: 4.9,
      reviews: 18,
    },
    {
      id: '3',
      name: 'Network Implementation',
      category: 'Infrastructure',
      description: 'Complete network setup and configuration',
      pricing: 'Custom pricing',
      status: 'Active',
      rating: 4.7,
      reviews: 31,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <Button onClick={() => toast.info('Add service feature coming soon!')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <Badge variant="success">{service.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{service.category}</p>
                  <p className="text-sm text-gray-700">{service.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({service.rating}) {service.reviews} reviews</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{service.pricing}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.info('Service details coming soon!')}>View Details</Button>
                  <Button size="sm" onClick={() => toast.info('Quote request coming soon!')}>Request Quote</Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.info('Edit service coming soon!')}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.info('Delete service coming soon!')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
              <p className="text-gray-600 mb-6">Start adding your service offerings to attract more clients</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
