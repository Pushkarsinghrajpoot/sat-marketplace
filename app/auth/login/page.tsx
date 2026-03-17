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
    <div className="min-h-screen grid lg:grid-cols-[45%_55%]">
      <div className="hidden lg:flex bg-[#0F172A] text-white p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <span className="text-xl font-bold text-[#0F172A]">B2B</span>
            </div>
            <span className="text-xl font-semibold">Marketplace</span>
          </Link>
          
          <h1 className="text-[32px] font-semibold mb-4 leading-tight">Welcome to the B2B Marketplace</h1>
          <p className="text-[16px] text-[#94A3B8] mb-12 leading-relaxed">
            Connect with thousands of verified distributors and resellers
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#1E293B] rounded-md flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-[#22C55E]" />
              </div>
              <div>
                <h3 className="font-medium text-[15px] mb-1">Verified distributors only</h3>
                <p className="text-[14px] text-[#94A3B8]">Every business is thoroughly vetted</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#1E293B] rounded-md flex items-center justify-center flex-shrink-0">
                <Tag className="h-5 w-5 text-[#6366F1]" />
              </div>
              <div>
                <h3 className="font-medium text-[15px] mb-1">Transparent pricing</h3>
                <p className="text-[14px] text-[#94A3B8]">Compare quotes side-by-side easily</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#1E293B] rounded-md flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="font-medium text-[15px] mb-1">Deal protection</h3>
                <p className="text-[14px] text-[#94A3B8]">Your customer opportunities are secure</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#1E293B] rounded-md flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="font-medium text-[15px] mb-1">Rated & reviewed</h3>
                <p className="text-[14px] text-[#94A3B8]">Real ratings from real businesses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1E293B] pt-6">
          <p className="text-[14px] text-[#CBD5E1]">
            "This marketplace helped us close 30% more deals"
          </p>
          <p className="text-[13px] font-medium text-white mt-2">- Sarah Chen, Premier Solutions</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
                <span className="text-sm font-bold text-white">B2B</span>
              </div>
              <span className="text-lg font-semibold text-[#09090B]">Marketplace</span>
            </Link>
            <h2 className="text-[24px] font-semibold text-[#09090B] mb-2">Welcome back</h2>
            <p className="text-[14px] text-[#71717A]">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
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

          <p className="text-center text-[14px] text-[#71717A] mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-[#6366F1] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
