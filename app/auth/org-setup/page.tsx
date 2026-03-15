'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Upload, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const steps = ['Type', 'Info', 'Contact', 'Verification', 'Team'];

export default function OrgSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    industry: '',
    companySize: '',
    yearEstablished: new Date().getFullYear(),
    website: '',
    description: '',
    country: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    altPhone: '',
    supportEmail: '',
    salesEmail: '',
    linkedin: '',
    twitter: '',
    teamMembers: [] as Array<{ email: string; role: string }>,
    logoFile: null as File | null,
    verificationDocs: [] as Array<{ name: string; file: File }>,
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Logo must be an image file');
        return;
      }
      updateField('logoFile', file);
    }
  };

  const handleVerificationDocUpload = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const existingDocs = formData.verificationDocs.filter(doc => doc.name !== docName);
      updateField('verificationDocs', [...existingDocs, { name: docName, file }]);
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage for now
    localStorage.setItem('orgSetupDraft', JSON.stringify(formData));
    toast.success('Draft saved successfully!');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast.success('Organization setup complete!');
    router.push('/distributor/dashboard');
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { email: '', role: 'SALES_MANAGER' }]
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-xl font-bold text-white">B2B</span>
            </div>
            <span className="text-xl font-semibold">Marketplace</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Organization Profile</h1>
          <p className="text-gray-600">Please provide the following information to get started</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index < currentStep ? 'bg-blue-600 text-white' :
                    index === currentStep ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index < currentStep ? <CheckCircle className="h-6 w-6" /> : index + 1}
                  </div>
                  <span className="text-xs mt-2 font-medium">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Step 2: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="TechDist Global"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Legal Business Name *</label>
                    <Input
                      value={formData.legalName}
                      onChange={(e) => updateField('legalName', e.target.value)}
                      placeholder="TechDist Global Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Industry *</label>
                    <Select
                      value={formData.industry}
                      onChange={(e) => updateField('industry', e.target.value)}
                    >
                      <option value="">Select Industry</option>
                      <option value="IT Distribution">IT Distribution</option>
                      <option value="Cloud Services">Cloud Services</option>
                      <option value="Networking">Networking</option>
                      <option value="Software">Software</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Company Size *</label>
                    <Select
                      value={formData.companySize}
                      onChange={(e) => updateField('companySize', e.target.value)}
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Year Established *</label>
                    <Input
                      type="number"
                      value={formData.yearEstablished}
                      onChange={(e) => updateField('yearEstablished', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Tell customers about your company..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Logo Upload</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {formData.logoFile ? (
                        <div className="space-y-2">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                          <p className="text-sm text-green-600 font-medium">{formData.logoFile.name}</p>
                          <p className="text-xs text-gray-500">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-600">Drag & drop logo or click to browse</p>
                          <p className="text-xs text-gray-500">PNG, JPG (max 2MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Contact Details</h2>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Headquarters Address</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Country *</label>
                      <Select
                        value={formData.country}
                        onChange={(e) => updateField('country', e.target.value)}
                      >
                        <option value="">Select Country</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="India">India</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Qatar">Qatar</option>
                        <option value="Kuwait">Kuwait</option>
                        <option value="Bahrain">Bahrain</option>
                        <option value="Oman">Oman</option>
                        <option value="Egypt">Egypt</option>
                        <option value="Jordan">Jordan</option>
                        <option value="Lebanon">Lebanon</option>
                        <option value="Iraq">Iraq</option>
                        <option value="Yemen">Yemen</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Street Address *</label>
                      <Input
                        value={formData.street}
                        onChange={(e) => updateField('street', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <Input
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">State/Province *</label>
                      <Input
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Postal Code *</label>
                      <Input
                        value={formData.postalCode}
                        onChange={(e) => updateField('postalCode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone *</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+1-415-555-0100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Alternate Phone</label>
                      <Input
                        value={formData.altPhone}
                        onChange={(e) => updateField('altPhone', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Support Email *</label>
                      <Input
                        type="email"
                        value={formData.supportEmail}
                        onChange={(e) => updateField('supportEmail', e.target.value)}
                        placeholder="support@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Sales Email *</label>
                      <Input
                        type="email"
                        value={formData.salesEmail}
                        onChange={(e) => updateField('salesEmail', e.target.value)}
                        placeholder="sales@company.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Social Media (Optional)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">LinkedIn</label>
                      <Input
                        value={formData.linkedin}
                        onChange={(e) => updateField('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Twitter</label>
                      <Input
                        value={formData.twitter}
                        onChange={(e) => updateField('twitter', e.target.value)}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-2">Verify Your Organization</h2>
                <p className="text-gray-600 mb-6">Upload documents to verify your business (encrypted & secure)</p>
                
                <div className="space-y-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm mb-1">All documents are encrypted</p>
                          <p className="text-xs text-gray-600">Reviewed by our team within 24 hours</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {['Business License', 'Tax ID / VAT', 'Bank Reference (Optional)'].map((doc) => {
                    const uploadedDoc = formData.verificationDocs.find(d => d.name === doc);
                    return (
                      <div key={doc}>
                        <label className="block text-sm font-medium mb-2">{doc}</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleVerificationDocUpload(doc, e)}
                            className="hidden"
                            id={`doc-${doc.replace(/\s+/g, '-')}`}
                          />
                          <label htmlFor={`doc-${doc.replace(/\s+/g, '-')}`} className="cursor-pointer">
                            {uploadedDoc ? (
                              <div className="space-y-2">
                                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                                <p className="text-sm text-green-600 font-medium">{uploadedDoc.file.name}</p>
                                <p className="text-xs text-gray-500">Click to change</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                                <p className="text-sm text-gray-600">Click to upload {doc.toLowerCase()}</p>
                                <p className="text-xs text-gray-500">PDF, JPG, PNG (max 5MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Team Invitation */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-2">Invite Your Team</h2>
                <p className="text-gray-600 mb-6">Add team members who will manage your organization</p>

                <div className="space-y-4">
                  {formData.teamMembers.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 mb-4">No team members added yet</p>
                      <Button variant="outline" onClick={addTeamMember}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Team Member
                      </Button>
                    </div>
                  ) : (
                    <>
                      {formData.teamMembers.map((member, index) => (
                        <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1 space-y-3">
                            <Input
                              placeholder="Email address"
                              value={member.email}
                              onChange={(e) => {
                                const newMembers = [...formData.teamMembers];
                                newMembers[index].email = e.target.value;
                                updateField('teamMembers', newMembers);
                              }}
                            />
                            <Select
                              value={member.role}
                              onChange={(e) => {
                                const newMembers = [...formData.teamMembers];
                                newMembers[index].role = e.target.value;
                                updateField('teamMembers', newMembers);
                              }}
                            >
                              <option value="ADMIN">Admin</option>
                              <option value="SALES_MANAGER">Sales Manager</option>
                              <option value="PRODUCT_MANAGER">Product Manager</option>
                              <option value="SUPPORT">Support</option>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTeamMember(index)}
                            className="self-start"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button variant="outline" onClick={addTeamMember} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Team Member
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <div className="flex gap-3">
                {currentStep < steps.length - 1 && (
                  <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
                )}
                <Button onClick={handleNext}>
                  {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
