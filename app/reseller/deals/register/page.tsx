'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Search, Send } from 'lucide-react';
import { toast } from 'sonner';

const steps = ['Customer Info', 'Deal Details', 'Declaration', 'Distributors'];

export default function RegisterDealPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    customerName: '',
    customerContact: '',
    customerEmail: '',
    opportunityName: '',
    estimatedValue: '',
    closeDate: '',
    productsNeeded: '',
    notes: '',
    confirmedRelationship: false,
    agreedToTerms: false,
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast.success('Deal registered successfully!');
    router.push('/reseller/deals');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Deal</h1>
          <p className="text-gray-600">Protect your customer opportunity and get competitive quotes</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index < currentStep ? 'bg-green-600 text-white' :
                    index === currentStep ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index < currentStep ? <CheckCircle className="h-6 w-6" /> : index + 1}
                  </div>
                  <span className="text-xs mt-2 font-medium text-center">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 ${index < currentStep ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Step 1: Customer Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Customer Information</CardTitle>
                  <p className="text-sm text-gray-600">Enter your end customer's details</p>
                </CardHeader>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      placeholder="XYZ Corporation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Person *</label>
                    <Input
                      value={formData.customerContact}
                      onChange={(e) => setFormData({...formData, customerContact: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Customer Email *</label>
                    <Input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                      placeholder="john@xyzcorp.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll send a verification code to confirm the relationship
                    </p>
                  </div>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-blue-900 mb-1">Deal Protection</p>
                        <p className="text-xs text-blue-800">
                          Once registered, this deal is protected and other resellers cannot claim the same customer opportunity.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Deal Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Deal Details</CardTitle>
                  <p className="text-sm text-gray-600">Provide information about this opportunity</p>
                </CardHeader>

                <div>
                  <label className="block text-sm font-medium mb-2">Opportunity Name *</label>
                  <Input
                    value={formData.opportunityName}
                    onChange={(e) => setFormData({...formData, opportunityName: e.target.value})}
                    placeholder="Enterprise Network Upgrade Project"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Estimated Value (USD) *</label>
                    <Input
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                      placeholder="125000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Close Date *</label>
                    <Input
                      type="date"
                      value={formData.closeDate}
                      onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Products/Services Needed *</label>
                  <Textarea
                    value={formData.productsNeeded}
                    onChange={(e) => setFormData({...formData, productsNeeded: e.target.value})}
                    rows={4}
                    placeholder="List the products or services needed for this opportunity..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    placeholder="Any special requirements, timelines, or constraints..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Declaration */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Reseller Declaration</CardTitle>
                  <p className="text-sm text-gray-600">Confirm your relationship with the customer</p>
                </CardHeader>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-yellow-900 font-semibold mb-2">Important Notice</p>
                    <p className="text-sm text-yellow-800">
                      By registering this deal, you confirm that you have an active relationship with the customer
                      and are authorized to seek quotes on their behalf. False registrations may result in account suspension.
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.confirmedRelationship}
                      onChange={(e) => setFormData({...formData, confirmedRelationship: e.target.checked})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-sm mb-1">I confirm my relationship with the customer</p>
                      <p className="text-xs text-gray-600">
                        I have an active business relationship with {formData.customerName} and am authorized
                        to request quotes for this opportunity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-sm mb-1">I agree to the terms and conditions</p>
                      <p className="text-xs text-gray-600">
                        I understand that this registration is binding and agree to work in good faith with
                        engaged distributors.
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-green-900 mb-1">Deal Lock</p>
                        <p className="text-xs text-green-800">
                          Once locked, this registration cannot be modified. You can proceed to select distributors
                          and request quotes.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Select Distributors */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Select Distributors</CardTitle>
                  <p className="text-sm text-gray-600">Choose distributors to send engagement requests</p>
                </CardHeader>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search distributors offering your products..."
                    className="pl-10"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {['TechDist Global', 'NetSupply Corp', 'CloudFirst Distribution'].map((dist) => (
                    <Card key={dist} className="cursor-pointer hover:border-blue-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="rounded" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{dist}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex text-yellow-400 text-xs">★★★★★</div>
                              <span className="text-xs text-gray-600">(4.8)</span>
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">2,450 products</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-900 font-semibold mb-1">3 distributors selected</p>
                    <p className="text-xs text-blue-800">
                      Engagement requests will be sent to selected distributors. They can accept and provide quotes.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Register & Send Requests
                  </>
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
