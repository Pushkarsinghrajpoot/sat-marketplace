'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Users, Factory, User as UserIcon } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import type { OrganizationType } from '@/lib/types';

const orgTypes: Array<{ type: OrganizationType; icon: any; label: string; description: string }> = [
  {
    type: 'DISTRIBUTOR',
    icon: Building,
    label: 'Distributor',
    description: 'I supply products/services to resellers',
  },
  {
    type: 'RESELLER',
    icon: Users,
    label: 'Reseller',
    description: 'I sell to end customers',
  },
  {
    type: 'OEM',
    icon: Factory,
    label: 'OEM',
    description: 'I manufacture products',
  },
  {
    type: 'INDIVIDUAL',
    icon: UserIcon,
    label: 'Individual',
    description: 'Individual professional',
  },
];

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [orgType, setOrgType] = useState<OrganizationType | ''>('');
  const router = useRouter();

  const handleRegister = () => {
    if (!email || !name || !orgType) {
      toast.error('Please fill all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser) {
      toast.error('Email already registered');
      return;
    }

    const userId = generateId();
    const orgId = generateId();

    const newOrg = {
      id: orgId,
      name: `${name}'s Company`,
      legalName: `${name}'s Company Inc.`,
      type: orgType,
      description: 'New organization',
      industry: 'Technology',
      companySize: '1-10',
      yearEstablished: new Date().getFullYear(),
      verified: false,
      rating: 0,
      reviewCount: 0,
      address: {
        country: 'United States',
        street: '',
        city: '',
        state: '',
        postalCode: '',
      },
      contact: {
        phone: '',
        supportEmail: email,
        salesEmail: email,
      },
      members: [userId],
      createdAt: new Date().toISOString(),
    };

    const newUser = {
      id: userId,
      email,
      name,
      organizationId: orgId,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    };

    const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
    orgs.push(newOrg);
    localStorage.setItem('organizations', JSON.stringify(orgs));

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    toast.success('Account created successfully!');
    router.push('/auth/org-setup?new=true');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-xl font-bold text-white">B2B</span>
              </div>
              <span className="text-xl font-semibold">Marketplace</span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">Join thousands of businesses on our platform</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Organization Type</label>
              <div className="grid md:grid-cols-2 gap-4">
                {orgTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.type}
                      onClick={() => setOrgType(type.type)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        orgType === type.type
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          orgType === type.type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{type.label}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Work Email</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" required />
              <p className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <Button onClick={handleRegister} className="w-full" size="lg">
              Create Account
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" size="lg">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
