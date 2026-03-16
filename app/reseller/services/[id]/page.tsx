'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, DollarSign, Edit, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service] = useState({
    id: params.id,
    name: 'IT Consulting Services',
    category: 'Professional Services',
    description: 'End-to-end IT consulting for enterprise clients. We provide comprehensive IT solutions tailored to your business needs.',
    longDescription: 'Our IT consulting services cover everything from strategic planning to implementation and support. Our team of certified professionals has extensive experience in helping businesses optimize their IT infrastructure.',
    pricing: 'Starting at SAR 5,000/project',
    status: 'Active',
    rating: 4.8,
    reviews: 24,
    features: [
      'Strategic IT Planning',
      'Infrastructure Assessment',
      'Cloud Migration Support',
      'Security Audits',
      '24/7 Support',
      'Custom Solutions'
    ],
    clients: [
      'Tech Corp',
      'Global Industries',
      'Finance Plus',
      'Healthcare Solutions'
    ]
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                    <p className="text-gray-600">{service.category}</p>
                  </div>
                  <Badge variant="success">{service.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{service.longDescription}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recent Clients</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.clients.map((client, index) => (
                        <Badge key={index} variant="default">{client}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <span className="text-xl font-bold text-gray-900">{service.pricing}</span>
                </div>
                <Button className="w-full" onClick={() => toast.info('Quote request feature coming soon!')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Quote
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating & Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold">{service.rating}</span>
                  <span className="text-gray-600">({service.reviews} reviews)</span>
                </div>
                <Button variant="outline" className="w-full" onClick={() => toast.info('Reviews feature coming soon!')}>
                  View All Reviews
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => toast.info('Edit service feature coming soon!')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Service
                </Button>
                <Button variant="outline" className="w-full" onClick={() => toast.info('Service analytics coming soon!')}>
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full" onClick={() => toast.info('Service duplication coming soon!')}>
                  Duplicate Service
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={() => toast.info('Delete service feature coming soon!')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Service
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
