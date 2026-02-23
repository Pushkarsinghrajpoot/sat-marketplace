'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock as LockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { signInWithEmail, updateLastLogin } from '@/lib/auth-helpers';
import { useAuthStore } from '@/lib/store';

export default function LoginSupabasePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      // Sign in with Supabase Auth
      const { session, user: authUser } = await signInWithEmail(email, password);

      if (!session || !authUser) {
        toast.error('Invalid credentials');
        setLoading(false);
        return;
      }

      // Update last login
      await updateLastLogin(authUser.id);

      // Fetch user data from users table
      const { user, organization } = await import('@/lib/auth-helpers').then(m => 
        m.getUserWithOrganization(authUser.id)
      );

      if (!user) {
        toast.error('User profile not found');
        setLoading(false);
        return;
      }

      // Store in Zustand
      login(user, organization);
      toast.success('Login successful!');

      // Redirect based on role
      switch (user.role) {
        case 'PLATFORM_ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'RESELLER':
          router.push('/reseller/dashboard');
          break;
        case 'DISTRIBUTOR':
          router.push('/distributor/dashboard');
          break;
        case 'END_USER':
          router.push('/end-user/dashboard');
          break;
        default:
          router.push('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      setLoading(false);
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
            <span className="text-xl font-bold">Marketplace</span>
          </Link>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Connect with distributors,<br />grow your business
            </h1>
            <p className="text-lg text-blue-100">
              The premier B2B marketplace for IT resellers and distributors
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-blue-100">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
            <span>Secure deal registration with verification</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
            <span>Real-time quote comparison</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
            <span>Activity tracking & scoring system</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="mb-8">
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
                    placeholder="you@company.com"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
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
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {/* <p className="text-sm text-gray-600">
                Testing? Use credentials from{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">CREDENTIALS.md</code>
              </p> */}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link href="/" className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-2">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
