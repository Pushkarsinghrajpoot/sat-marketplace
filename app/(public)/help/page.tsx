'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mail, Phone, MessageCircle } from 'lucide-react';

export default function HelpPage() {
  const categories = [
    {
      title: "Getting Started",
      articles: [
        "How to Register Your Business",
        "Complete Your Profile",
        "Navigate the Dashboard"
      ]
    },
    {
      title: "For Distributors",
      articles: [
        "Add Your First Product",
        "Create Campaigns",
        "Review Engagement Requests"
      ]
    },
    {
      title: "For Resellers",
      articles: [
        "Register a Deal",
        "Upload BOQ",
        "Compare Quotes"
      ]
    },
    {
      title: "Account & Billing",
      articles: [
        "Update Payment Methods",
        "View Transaction History",
        "Manage Subscriptions"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Help Center</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for help articles..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{category.title}</h2>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <a href="#" className="text-blue-600 hover:underline">
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Still Need Help?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-gray-600 text-sm mb-2">Get help via email</p>
                <a href="mailto:support@marketplace.satmz.com" className="text-blue-600 hover:underline text-sm">
                  support@marketplace.satmz.com
                </a>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-gray-600 text-sm mb-2">Mon-Fri 9AM-6PM EST</p>
                <a href="tel:+1-800-555-0100" className="text-blue-600 hover:underline text-sm">
                  +1-800-555-0100
                </a>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-gray-600 text-sm mb-2">Chat with our team</p>
                <Button size="sm" className="mt-2">
                  Start Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
