'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, TrendingUp } from 'lucide-react';

export default function PartnerProgramPage() {
  const benefits = [
    {
      icon: Star,
      title: "Premium Visibility",
      description: "Get featured placement and enhanced visibility across the platform"
    },
    {
      icon: TrendingUp,
      title: "Growth Opportunities",
      description: "Access to exclusive leads and priority support for rapid growth"
    },
    {
      icon: CheckCircle,
      title: "Verified Partner Status",
      description: "Earn trust with verified partner badge and priority verification"
    }
  ];

  const tiers = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "Basic product listings",
        "Standard visibility",
        "Email support",
        "Monthly analytics"
      ]
    },
    {
      name: "Professional",
      price: "SAR 299/month",
      features: [
        "Enhanced product listings",
        "Priority visibility",
        "Dedicated support",
        "Real-time analytics",
        "Lead generation tools"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Premium placement",
        "Custom branding",
        "White-glove support",
        "Advanced analytics",
        "API access",
        "Custom integrations"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Partner Program</h1>
        
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Why Join Our Partner Program?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-6 text-center">Partner Tiers</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier, index) => (
            <Card key={index} className={tier.name === "Professional" ? "border-blue-500 shadow-lg" : ""}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <p className="text-2xl font-bold mb-4">{tier.price}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={tier.name === "Professional" ? "primary" : "outline"}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of successful partners who are already growing their business on our platform.
            </p>
            <Button size="lg">
              Apply for Partner Program
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
