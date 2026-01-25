'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About B2B Marketplace</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-600">
                To connect verified distributors with qualified resellers, creating a trusted ecosystem 
                where businesses can find the best technology solutions at competitive prices.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="text-gray-600">
                To become the world's leading B2B technology marketplace, enabling seamless 
                trade between distributors and resellers across the globe.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Why Choose Us?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Verified Partners</h3>
                <p className="text-gray-600">Every distributor and reseller is thoroughly vetted</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Best Prices</h3>
                <p className="text-gray-600">Compare quotes from multiple distributors</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Deal Protection</h3>
                <p className="text-gray-600">Your customer opportunities are secure</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
