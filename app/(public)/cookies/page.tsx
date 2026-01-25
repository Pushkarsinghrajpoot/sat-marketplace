'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    functional: true
  });

  const cookieTypes = [
    {
      key: 'necessary',
      title: 'Essential Cookies',
      description: 'Required for the website to function properly. Cannot be disabled.',
      locked: true
    },
    {
      key: 'analytics',
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      locked: false
    },
    {
      key: 'marketing',
      title: 'Marketing Cookies',
      description: 'Used to personalize ads and measure advertising effectiveness.',
      locked: false
    },
    {
      key: 'functional',
      title: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization.',
      locked: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Settings</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              improving website performance.
            </p>
            <p className="text-gray-600">
              We use different types of cookies for various purposes, all aimed at enhancing your 
              experience on our platform.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Manage Your Preferences</h2>
            <div className="space-y-4">
              {cookieTypes.map((cookie) => (
                <div key={cookie.key} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{cookie.title}</h3>
                    <p className="text-gray-600 text-sm">{cookie.description}</p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences[cookie.key as keyof typeof preferences]}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        [cookie.key]: e.target.checked
                      })}
                      disabled={cookie.locked}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    {cookie.locked && (
                      <span className="text-xs text-gray-500 block mt-1">Required</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Cookie Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Essential Cookies</h3>
                <p className="text-gray-600 text-sm mb-2">
                  These cookies are necessary for the website to function and cannot be switched off.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Session cookies for login authentication</li>
                  <li>• Security tokens for fraud prevention</li>
                  <li>• Shopping cart functionality</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Analytics Cookies</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Help us understand how our website is being used.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Google Analytics for traffic analysis</li>
                  <li>• Heatmap tracking for user behavior</li>
                  <li>• Performance monitoring</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Marketing Cookies</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Used to deliver relevant advertisements and track marketing effectiveness.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Facebook Pixel for ad targeting</li>
                  <li>• LinkedIn Insight Tag</li>
                  <li>• Google Ads conversion tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setPreferences({
            necessary: true,
            analytics: false,
            marketing: false,
            functional: false
          })}>
            Accept Only Essential
          </Button>
          <Button onClick={() => setPreferences({
            necessary: true,
            analytics: true,
            marketing: true,
            functional: true
          })}>
            Accept All
          </Button>
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">More Information</h2>
            <p className="text-gray-600 mb-4">
              For more information about our privacy practices and how we use cookies, 
              please read our Privacy Policy.
            </p>
            <p className="text-gray-600">
              If you have questions about our cookie policy, please contact us at:
              privacy@marketplace.satmz.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
