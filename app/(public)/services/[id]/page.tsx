'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Users, Award, CheckCircle, MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Service, Organization } from '@/lib/types';
import Link from 'next/link';

export default function ServiceDetailPage() {
  const params = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const svc = services.find((s: Service) => s.id === params.id);
    setService(svc || null);

    if (svc) {
      const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
      const org = orgs.find((o: Organization) => o.id === svc.organizationId);
      setOrganization(org || null);
    }
  }, [params.id]);

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Service not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <span>Home</span> &gt; <span>Services</span> &gt; <span className="text-gray-900 font-medium">{service.name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <Badge variant="info" className="mb-2">Service</Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">({service.rating}) {service.reviewCount} reviews</span>
                </div>
              </div>
            </div>
          </div>

          {organization && (
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">{organization.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Provided by</p>
                  <Link href={`/distributors/${organization.id}`} className="font-semibold text-blue-600 hover:underline">
                    {organization.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({organization.rating})</span>
                    {organization.verified && (
                      <Badge variant="success" className="text-xs">Verified</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
              {['overview', 'deliverables', 'team', 'case-studies', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 border-b-2 font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Service Overview</h2>
              <p className="text-gray-700 mb-6">{service.description}</p>
              
              <h3 className="text-xl font-bold mb-4">What's Included</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {service.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Service Level Agreement (SLA)</h4>
                  <p className="text-sm text-gray-700">{service.sla}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'deliverables' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Service Deliverables</h2>
              <div className="space-y-4">
                {service.deliverables.map((deliverable, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-blue-600">{idx + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{deliverable}</h3>
                          <p className="text-sm text-gray-600">Comprehensive delivery of {deliverable.toLowerCase()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Team</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {service.team.map((member, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                          <div className="flex flex-wrap gap-2">
                            {member.certifications.map((cert, i) => (
                              <Badge key={i} variant="info" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'case-studies' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Success Stories</h2>
              <div className="space-y-6">
                {service.caseStudies.map((study, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-6">
                      <Badge variant="info" className="mb-3">{study.industry}</Badge>
                      <h3 className="text-xl font-bold mb-3">{study.title}</h3>
                      <p className="text-gray-700 mb-4">{study.description}</p>
                      <div className="grid md:grid-cols-3 gap-4">
                        {study.metrics.map((metric, i) => (
                          <div key={i} className="bg-green-50 rounded-lg p-3 text-center">
                            <p className="font-bold text-green-700">{metric}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">Excellent Service!</p>
                          <div className="flex text-yellow-400 text-sm my-1">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">2 weeks ago</span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Outstanding quality and professionalism. The team exceeded our expectations.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Pricing Plans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-semibold">Basic</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(service.pricing.basic)}</span>
                </div>
                <p className="text-sm text-gray-500">/month</p>
              </div>
              
              <div className="border-b pb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-semibold">Professional</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(service.pricing.professional)}</span>
                </div>
                <p className="text-sm text-gray-500">/month</p>
              </div>
              
              <div className="pb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-semibold">Enterprise</span>
                  <span className="text-lg font-bold text-gray-900">{service.pricing.enterprise}</span>
                </div>
                <p className="text-sm text-gray-500">Custom pricing</p>
              </div>

              <Button size="lg" className="w-full">Get Custom Quote</Button>
              <Button size="lg" variant="secondary" className="w-full">
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat with Expert
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
