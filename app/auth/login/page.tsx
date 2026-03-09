'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Tag, Lock, Star, Mail, Lock as LockIcon } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useSimpleAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      // Use simplified auth context login
      await login(email, password);
      
      toast.success('Login successful!');
      
      // AuthChecker will handle the redirect automatically
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.satmz.com"
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
                {/* <p className="text-xs text-gray-500 mt-1">
                  Try: robert@abcresellers.satmz.com / Test123!
                </p> */}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {/* <p className="text-sm text-gray-600">
                Test credentials in{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">CREDENTIALS.md</code>
              </p> */}
            </div>

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
