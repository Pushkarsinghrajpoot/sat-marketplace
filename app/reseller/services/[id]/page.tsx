'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Star, DollarSign, MessageSquare, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching service data
    const mockService = {
      id: params.id,
      name: 'IT Consulting Services',
      category: 'Professional Services',
      description: 'End-to-end IT consulting for enterprise clients. We provide comprehensive IT solutions including infrastructure assessment, system design, implementation, and ongoing support.',
      pricing: 'Starting at $5,000/project',
      pricingType: 'PROJECT',
      status: 'ACTIVE',
      rating: 4.8,
      reviews: 24,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      features: [
        'Infrastructure Assessment',
        'System Architecture Design',
        'Implementation Planning',
        'Project Management',
        'Ongoing Support',
        'Performance Monitoring'
      ],
      tags: ['Consulting', 'Infrastructure', 'Enterprise', 'IT Strategy']
    };

    setTimeout(() => {
      setService(mockService);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleEdit = () => {
    router.push(`/reseller/services/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      // In real implementation, would delete from database
      toast.success('Service deleted successfully');
      router.push('/reseller/services');
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const handleRequestQuote = () => {
    toast.info('Quote request feature coming soon!');
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
          <p className="text-gray-600 mb-4">The service you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/reseller/services')}>
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            <p className="text-gray-600">{service.category}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={service.status === 'ACTIVE' ? 'success' : 'warning'}>
              {service.status}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features & Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="default">{tag}</Badge>
                  ))}
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-lg font-semibold text-gray-900">{service.pricing}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {service.pricingType === 'PROJECT' && 'Project-based pricing'}
                    {service.pricingType === 'HOURLY' && 'Hourly rate'}
                    {service.pricingType === 'MONTHLY' && 'Monthly retainer'}
                    {service.pricingType === 'CUSTOM' && 'Custom pricing'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating & Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="font-semibold">{service.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600">{service.reviews} reviews</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleRequestQuote}>
                  Request Quote
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {new Date(service.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Updated: {new Date(service.updatedAt).toLocaleDateString()}</span>
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
