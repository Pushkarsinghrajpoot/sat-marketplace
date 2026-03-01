'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Search, Send, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { createDeal } from '@/lib/data-helpers';
import { useAuthStore } from '@/lib/store';

const steps = ['Deal Type', 'Customer Info', 'Deal Details', 'Verification', 'Declaration'];

export default function RegisterDealPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [dealType, setDealType] = useState<'DEAL_REGISTRATION' | 'BIDDING' | 'DIRECT_QUERY' | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [signature, setSignature] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerCompany: '',
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

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Deal Type
        if (!dealType) {
          toast.error('Please select a deal type');
          return false;
        }
        return true;
      
      case 1: // Customer Info
        if (!formData.customerName || !formData.customerCompany || !formData.customerEmail) {
          toast.error('Please fill in all required customer information');
          return false;
        }
        if (!formData.customerEmail.includes('@')) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;
      
      case 2: // Deal Details
        if (!formData.opportunityName || !formData.estimatedValue || !formData.closeDate) {
          toast.error('Please fill in all required deal details');
          return false;
        }
        if (parseFloat(formData.estimatedValue) <= 0) {
          toast.error('Deal value must be greater than 0');
          return false;
        }
        return true;
      
      case 3: // Verification
        // Only require verification for DEAL_REGISTRATION
        if (dealType === 'DEAL_REGISTRATION' && !isVerified) {
          toast.error('Please verify customer email before proceeding');
          return false;
        }
        return true;
      
      case 4: // Declaration
        if (!formData.confirmedRelationship || !formData.agreedToTerms || !signature) {
          toast.error('Please confirm all declarations and provide signature');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    // Skip verification step for BIDDING and DIRECT_QUERY
    if (currentStep === 2 && (dealType === 'BIDDING' || dealType === 'DIRECT_QUERY')) {
      setCurrentStep(4); // Skip to declaration
      return;
    }
    
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

  const handleSendVerification = () => {
    if (!formData.customerEmail) {
      toast.error('Please enter customer email');
      return;
    }
    setVerificationSent(true);
    toast.success('Verification email sent to ' + formData.customerEmail);
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      setIsVerified(true);
      toast.success('Email verified successfully!');
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please enter valid 6-digit code');
    }
  };

  const { user } = useAuthStore();

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Please login to register a deal');
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }
    
    try {
      const dealData = {
        opportunity_name: formData.opportunityName,
        deal_type: dealType,
        customer_name: formData.customerName,
        customer_company: formData.customerCompany,
        customer_email: formData.customerEmail,
        customer_contact: formData.customerContact,
        estimated_value: parseFloat(formData.estimatedValue),
        close_date: formData.closeDate,
        notes: formData.notes,
        status: 'DRAFT',
        reseller_id: user.id,
        reseller_organization_id: user.organizationId,
        is_verified: isVerified,
        declaration_signature: signature,
        is_locked: true,
        locked_by: user.id,
        locked_at: new Date().toISOString(),
      };
      
      await createDeal(dealData);
      toast.success('Deal registered successfully!');
      router.push('/reseller/deals');
    } catch (error: any) {
      console.error('Error creating deal:', error);
      toast.error(error.message || 'Failed to register deal');
    }
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
            {/* Step 0: Deal Type Selection */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Select Deal Type</CardTitle>
                  <p className="text-sm text-gray-600">Choose the type of deal you want to create</p>
                </CardHeader>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${dealType === 'DEAL_REGISTRATION' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}
                    onClick={() => setDealType('DEAL_REGISTRATION')}
                  >
                    <CardContent className="p-6">
                      <Lock className="h-8 w-8 text-blue-600 mb-3" />
                      <h3 className="font-semibold mb-2">Deal Registration</h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Protect your customer opportunity with verification and locking
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Customer verification required</li>
                        <li>• Deal locking & protection</li>
                        <li>• Activity tracking & scoring</li>
                        <li>• Convert to bidding option</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${dealType === 'BIDDING' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}
                    onClick={() => setDealType('BIDDING')}
                  >
                    <CardContent className="p-6">
                      <Search className="h-8 w-8 text-purple-600 mb-3" />
                      <h3 className="font-semibold mb-2">Open Bidding</h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Create an open bidding opportunity for multiple distributors
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• No verification required</li>
                        <li>• No deal locking</li>
                        <li>• Multiple distributors can bid</li>
                        <li>• Faster quote process</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${dealType === 'DIRECT_QUERY' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}
                    onClick={() => setDealType('DIRECT_QUERY')}
                  >
                    <CardContent className="p-6">
                      <Send className="h-8 w-8 text-green-600 mb-3" />
                      <h3 className="font-semibold mb-2">Direct Query</h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Send a direct query to specific distributors
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• No verification needed</li>
                        <li>• No locking or scoring</li>
                        <li>• Quick response</li>
                        <li>• Simple requirement sharing</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {dealType && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-blue-900 font-semibold">
                        {dealType === 'DEAL_REGISTRATION' && 'Deal Registration selected - Full protection with verification'}
                        {dealType === 'BIDDING' && 'Open Bidding selected - Quick bidding process without verification'}
                        {dealType === 'DIRECT_QUERY' && 'Direct Query selected - Simple query without verification'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Customer Information</CardTitle>
                  <p className="text-sm text-gray-600">
                    {dealType === 'DEAL_REGISTRATION' 
                      ? "Enter your end customer's corporate email for verification" 
                      : "Enter your end customer's details"}
                  </p>
                </CardHeader>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer Name *</label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <Input
                      value={formData.customerCompany}
                      onChange={(e) => setFormData({...formData, customerCompany: e.target.value})}
                      placeholder="XYZ Corporation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Number *</label>
                    <Input
                      value={formData.customerContact}
                      onChange={(e) => setFormData({...formData, customerContact: e.target.value})}
                      placeholder="+1 555 0100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {dealType === 'DEAL_REGISTRATION' ? 'Corporate Email *' : 'Customer Email *'}
                    </label>
                    <Input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                      placeholder="john@xyzcorp.com"
                    />
                    {dealType === 'DEAL_REGISTRATION' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Must be a corporate email - verification will be sent
                      </p>
                    )}
                  </div>
                </div>

                {dealType === 'DEAL_REGISTRATION' && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-blue-900 mb-1">Deal Protection & Lock</p>
                          <p className="text-xs text-blue-800">
                            Once verified, this deal will be locked to you. Other resellers from your company or any other company cannot lock the same customer opportunity.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 2: Deal Details */}
            {currentStep === 2 && (
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

            {/* Step 3: Verification */}
            {currentStep === 3 && dealType === 'DEAL_REGISTRATION' && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Email Verification</CardTitle>
                  <p className="text-sm text-gray-600">Verify customer's corporate email</p>
                </CardHeader>

                {!verificationSent ? (
                  <div className="space-y-4">
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm text-yellow-900 mb-1">Verification Required</p>
                            <p className="text-xs text-yellow-800">
                              A verification code will be sent to <strong>{formData.customerEmail}</strong> to confirm the business relationship.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="text-center">
                      <Button onClick={handleSendVerification} size="lg">
                        <Send className="h-4 w-4 mr-2" />
                        Send Verification Code
                      </Button>
                    </div>
                  </div>
                ) : !isVerified ? (
                  <div className="space-y-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-blue-900">
                          Verification code has been sent to <strong>{formData.customerEmail}</strong>
                        </p>
                      </CardContent>
                    </Card>

                    <div className="max-w-md mx-auto">
                      <label className="block text-sm font-medium mb-2">Enter 6-digit verification code</label>
                      <Input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="000000"
                        className="text-center text-2xl tracking-widest"
                      />
                    </div>

                    <div className="text-center">
                      <Button onClick={handleVerifyCode} disabled={verificationCode.length !== 6}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Code
                      </Button>
                    </div>

                    <div className="text-center">
                      <button 
                        onClick={handleSendVerification}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Resend verification code
                      </button>
                    </div>
                  </div>
                ) : (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <p className="font-semibold text-green-900 mb-1">Email Verified Successfully!</p>
                      <p className="text-sm text-green-800">
                        Customer relationship confirmed. Proceed to declaration.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Skip verification for Bidding and Direct Query */}
            {currentStep === 3 && dealType !== 'DEAL_REGISTRATION' && (
              <div className="space-y-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-blue-900">
                      No verification required for {dealType === 'BIDDING' ? 'Bidding' : 'Direct Query'} deals. 
                      Click Next to continue.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Declaration */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Declaration & E-Sign</CardTitle>
                  <p className="text-sm text-gray-600">Accept terms and provide electronic signature</p>
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
                        I have an active business relationship with {formData.customerCompany} and am authorized
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

                <div>
                  <label className="block text-sm font-medium mb-2">Electronic Signature *</label>
                  <Input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Type your full name as signature"
                    className="text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    By typing your name, you agree to use it as your electronic signature
                  </p>
                </div>

                {dealType === 'DEAL_REGISTRATION' && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-green-900 mb-1">Deal Will Be Locked</p>
                          <p className="text-xs text-green-800">
                            Once submitted, this deal will be automatically locked to you. Other resellers (including those from your company) cannot register the same customer opportunity. You'll be able to track activities and add points to increase your deal score.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
              <Button 
                onClick={handleNext}
                disabled={currentStep === 0 && !dealType}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    {dealType === 'DEAL_REGISTRATION' ? 'Lock & Register Deal' : 'Submit Deal'}
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
