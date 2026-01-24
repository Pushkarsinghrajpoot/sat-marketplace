'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Tag, Lock, Star } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSendOtp = () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setShowOtp(true);
    setTimer(60);
    toast.success('OTP sent to your email!');

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    // Force initialize localStorage if empty or admin user missing
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminUser = users.find((u: any) => u.email === 'admin@marketplace.satmz.com');
    
    if (users.length === 0 || !adminUser) {
      console.log('Users not found or admin missing, initializing localStorage...');
      const { initializeLocalStorage } = require('@/lib/dummy-data');
      initializeLocalStorage();
      
      // If still no admin user, add it manually
      const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedAdminUser = updatedUsers.find((u: any) => u.email === 'admin@marketplace.satmz.com');
      
      if (!updatedAdminUser) {
        console.log('Adding admin user manually...');
        const adminUser = {
          id: 'user8',
          email: 'admin@marketplace.satmz.com',
          name: 'Admin User',
          organizationId: 'org7',
          role: 'PLATFORM_ADMIN',
          createdAt: '2023-01-01T00:00:00Z',
        };
        updatedUsers.push(adminUser);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Also add admin organization if missing
        const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
        const adminOrg = orgs.find((o: any) => o.id === 'org7');
        if (!adminOrg) {
          const adminOrganization = {
            id: 'org7',
            name: 'B2B Marketplace',
            legalName: 'B2B Marketplace Platform Inc.',
            type: 'DISTRIBUTOR',
            description: 'Platform administrator organization.',
            industry: 'Technology',
            companySize: '51-200',
            yearEstablished: 2023,
            verified: true,
            rating: 5.0,
            reviewCount: 0,
            address: {
              country: 'United States',
              street: '1 Platform Way',
              city: 'San Francisco',
              state: 'CA',
              postalCode: '94102',
            },
            contact: {
              phone: '+1-415-555-9999',
              supportEmail: 'support@marketplace.example.com',
              salesEmail: 'sales@marketplace.example.com',
            },
            members: ['user8'],
            createdAt: '2023-01-01T00:00:00Z',
          };
          orgs.push(adminOrganization);
          localStorage.setItem('organizations', JSON.stringify(orgs));
        }
      }
    }

    login(email);
    toast.success('Login successful!');
    
    const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = updatedUsers.find((u: any) => u.email === email);
    
    console.log('Login debug - users count:', updatedUsers.length);
    console.log('Login debug - looking for email:', email);
    console.log('Login debug - available emails:', updatedUsers.map((u: any) => u.email));
    console.log('Login debug - user:', user);
    console.log('Login debug - user role:', user?.role);
    
    // Check if user is admin first
    if (user?.role === 'PLATFORM_ADMIN') {
      console.log('Redirecting to admin dashboard...');
      router.push('/admin/dashboard');
      return;
    }
    
    const orgs = JSON.parse(localStorage.getItem('organizations') || '[]');
    const org = orgs.find((o: any) => o.id === user?.organizationId);

    console.log('Login debug - org:', org);
    console.log('Login debug - org type:', org?.type);

    if (org?.type === 'DISTRIBUTOR') {
      router.push('/distributor/dashboard');
    } else if (org?.type === 'RESELLER') {
      router.push('/reseller/dashboard');
    } else if (org?.type === 'OEM') {
      router.push('/oem/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <span className="text-xl font-bold">B2B</span>
            </div>
            <span className="text-xl font-semibold">Marketplace</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-6">Welcome to the B2B Marketplace</h1>
          <p className="text-xl text-blue-100 mb-12">
            Connect with thousands of verified distributors and resellers
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Verified distributors only</h3>
                <p className="text-blue-100">Every business is thoroughly vetted</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Transparent pricing</h3>
                <p className="text-blue-100">Compare quotes side-by-side easily</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Deal protection</h3>
                <p className="text-blue-100">Your customer opportunities are secure</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Rated & reviewed</h3>
                <p className="text-blue-100">Real ratings from real businesses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6">
          <p className="text-sm text-blue-100">
            "This marketplace helped us close 30% more deals"
          </p>
          <p className="text-sm font-semibold mt-2">- Sarah Chen, Premier Solutions</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Login to your account</h2>
              <p className="text-gray-600">Enter your email to receive a login code</p>
            </div>

            {!showOtp ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Work Email</label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendOtp()}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Try: john@techdist.example.com (Distributor) or robert@abcresellers.example.com (Reseller)
                  </p>
                </div>
                <Button onClick={handleSendOtp} className="w-full" size="lg">
                  Continue with Email
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
                  Continue with Google
                </Button>

                <Link href="/" className="block text-center">
                  <Button variant="ghost" className="w-full">
                    Continue as visitor
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Enter OTP</label>
                  <p className="text-sm text-gray-600 mb-3">We sent a code to {email}</p>
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyOtp()}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For demo: Enter any 6 digits
                  </p>
                </div>
                <Button onClick={handleVerifyOtp} className="w-full" size="lg">
                  Verify & Login
                </Button>
                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-sm text-gray-500">Resend code in {timer}s</p>
                  ) : (
                    <Button variant="ghost" onClick={handleSendOtp}>
                      Resend code
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => setShowOtp(false)} className="w-full">
                  Change email
                </Button>
              </div>
            )}

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
