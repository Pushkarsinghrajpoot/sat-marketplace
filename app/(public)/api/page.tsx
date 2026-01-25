'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, FileText, Download } from 'lucide-react';

export default function APIPage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/products",
      description: "List all available products",
      example: "curl https://api.marketplace.satmz.com/products"
    },
    {
      method: "GET",
      path: "/api/products/{id}",
      description: "Get product details by ID",
      example: "curl https://api.marketplace.satmz.com/products/123"
    },
    {
      method: "GET",
      path: "/api/categories",
      description: "List all product categories",
      example: "curl https://api.marketplace.satmz.com/categories"
    },
    {
      method: "GET",
      path: "/api/distributors",
      description: "List all verified distributors",
      example: "curl https://api.marketplace.satmz.com/distributors"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">API Documentation</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="text-gray-600 mb-4">
              Our RESTful API allows you to integrate B2B Marketplace data into your applications. 
              Get started by obtaining an API key from your dashboard.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-2">🔑 API Key Required</h3>
                <p className="text-gray-600">Get your key from dashboard settings</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📊 Rate Limits</h3>
                <p className="text-gray-600">1000 requests per hour</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔒 Secure</h3>
                <p className="text-gray-600">HTTPS encryption required</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-6">Available Endpoints</h2>
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                      {endpoint.method}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-mono text-lg mb-2">{endpoint.path}</h3>
                    <p className="text-gray-600 mb-3">{endpoint.description}</p>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <code className="text-sm">{endpoint.example}</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">SDK & Libraries</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" /> JavaScript
                </h3>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download SDK
                </Button>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Python
                </h3>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download SDK
                </Button>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" /> Postman
                </h3>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Collection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
