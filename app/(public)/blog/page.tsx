'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function BlogPage() {
  const posts = [
    {
      title: "5 Tips for Successful B2B Deal Registration",
      excerpt: "Learn how to maximize your deal registration success rate with these proven strategies.",
      date: "2024-01-15",
      author: "Sarah Johnson"
    },
    {
      title: "The Future of Technology Distribution",
      excerpt: "How digital transformation is reshaping the B2B distribution landscape.",
      date: "2024-01-10",
      author: "Mike Chen"
    },
    {
      title: "Building Trust in B2B Marketplaces",
      excerpt: "Why verification and transparency matter in online B2B transactions.",
      date: "2024-01-05",
      author: "Emily Davis"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>
        
        <div className="space-y-6">
          {posts.map((post, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-3">{post.title}</h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
