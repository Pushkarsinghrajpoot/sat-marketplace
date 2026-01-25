'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function PressPage() {
  const pressReleases = [
    {
      title: "B2B Marketplace Raises $10M Series A",
      excerpt: "Leading B2B technology marketplace secures funding to expand platform capabilities.",
      date: "2024-01-20",
      category: "Funding"
    },
    {
      title: "Partnership with Major Tech Distributors",
      excerpt: "New partnerships bring 500+ additional distributors to the platform.",
      date: "2024-01-15",
      category: "Partnerships"
    },
    {
      title: "Platform Reaches 10,000 Active Users",
      excerpt: "Milestone achievement shows strong growth in B2B technology marketplace.",
      date: "2024-01-10",
      category: "Growth"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Press</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Media Kit</h2>
            <p className="text-gray-600 mb-4">
              Download our media kit for logos, brand guidelines, and company information.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-2">📊 Company Info</h3>
                <p className="text-gray-600">Company overview and facts</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎨 Brand Assets</h3>
                <p className="text-gray-600">Logos and brand guidelines</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📸 Images</h3>
                <p className="text-gray-600">Team and office photos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-6">Press Releases</h2>
        <div className="space-y-4">
          {pressReleases.map((release, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <h3 className="text-xl font-semibold">{release.title}</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {release.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{release.excerpt}</p>
                <p className="text-sm text-gray-500">{new Date(release.date).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
