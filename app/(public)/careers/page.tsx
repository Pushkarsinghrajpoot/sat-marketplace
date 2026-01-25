'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function CareersPage() {
  const positions = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time"
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "Sales Representative",
      department: "Sales",
      location: "New York, NY",
      type: "Full-time"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Join Our Team</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Why Work With Us?</h2>
            <p className="text-gray-600 mb-4">
              We're building the future of B2B technology trade. Join a team that's passionate 
              about connecting businesses and creating value for our partners.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-2">🚀 Fast Growing</h3>
                <p className="text-gray-600">Join us at an exciting stage of growth</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">💰 Competitive Pay</h3>
                <p className="text-gray-600">Great salary and equity packages</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🏖️ Great Benefits</h3>
                <p className="text-gray-600">Health, dental, vision, and more</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-6">Open Positions</h2>
        <div className="space-y-4">
          {positions.map((position, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{position.title}</h3>
                    <p className="text-gray-600">{position.department} • {position.location}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {position.type}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
