'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Tag, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Register Deal",
      description: "Protect your customer opportunity by registering your deal in our secure platform. Get instant verification and deal protection.",
      icon: CheckCircle,
      features: [
        "Instant deal registration",
        "Customer opportunity protection",
        "Verification process",
        "Deal tracking dashboard"
      ]
    },
    {
      number: 2,
      title: "Get Quotes",
      description: "Receive competitive quotes from verified distributors. Compare pricing, terms, and delivery options side by side.",
      icon: Tag,
      features: [
        "Multiple quote requests",
        "Side-by-side comparison",
        "Negotiation tools",
        "Quote management"
      ]
    },
    {
      number: 3,
      title: "Close & Earn",
      description: "Win deals with the best pricing and terms. Complete transactions securely and build your business reputation.",
      icon: Star,
      features: [
        "Secure transactions",
        "Best pricing guarantee",
        "Reputation building",
        "Analytics & insights"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined process makes B2B technology trading simple, secure, and profitable for everyone involved.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="relative">
                <CardContent className="p-8">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  <ul className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Why Choose Our Platform?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Verified Partners</h3>
                <p className="text-sm text-gray-600">All distributors are thoroughly vetted</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Best Prices</h3>
                <p className="text-sm text-gray-600">Compare quotes from multiple sources</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Deal Protection</h3>
                <p className="text-sm text-gray-600">Your opportunities are secure</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Ratings & Reviews</h3>
                <p className="text-sm text-gray-600">Real feedback from real users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of businesses already using our platform to grow their revenue.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg">
                Register Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" size="lg">
                Browse Solutions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
