'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using B2B Marketplace, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily download one copy of the materials on B2B Marketplace 
                for personal, non-commercial transitory viewing only. This is the grant of a license, 
                not a transfer of title.
              </p>
              <p className="text-gray-600">
                Under this license you may not:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose</li>
                <li>attempt to reverse engineer any software</li>
                <li>remove any copyright or other proprietary notations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">3. Account Responsibilities</h2>
              <p className="text-gray-600 mb-4">
                You are responsible for maintaining the confidentiality of your account and password. 
                You agree to accept responsibility for all activities that occur under your account.
              </p>
              <p className="text-gray-600">
                You must provide accurate, complete, and current information for all account registration.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">4. Prohibited Activities</h2>
              <p className="text-gray-600 mb-4">
                You may not use our service for any illegal or unauthorized purpose. You may not use 
                our service to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malicious code or viruses</li>
                <li>Spam or harass other users</li>
                <li>Submit false or misleading information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-600">
                In no event shall B2B Marketplace or its suppliers be liable for any damages 
                (including, without limitation, damages for loss of data or profit, or due to 
                business interruption) arising out of the use or inability to use the materials.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">6. Privacy Policy</h2>
              <p className="text-gray-600">
                Your privacy is important to us. Our Privacy Policy explains how we collect, 
                use, and protect your information when you use our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. If we make material 
                changes, we will notify you by email or by posting a notice on our site prior 
                to the change becoming effective.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-600 mt-2">
                Email: legal@marketplace.satmz.com<br />
                Phone: +1-800-555-0100
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
