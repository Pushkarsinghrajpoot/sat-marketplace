'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, DollarSign, Users, ArrowRight, Plus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function DistributorDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeQuotes: 0,
    monthlyRevenue: 328000,
    activeCustomers: 89,
  });

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    
    setStats({
      totalProducts: products.length,
      activeQuotes: quotes.filter((q: any) => q.status === 'SUBMITTED' || q.status === 'TO_SUBMIT').length,
      monthlyRevenue: 328000,
      activeCustomers: 89,
    });
  }, []);

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const salesByCategory = [
    { category: 'Networking', sales: 35 },
    { category: 'Security', sales: 25 },
    { category: 'Storage', sales: 20 },
    { category: 'Servers', sales: 15 },
    { category: 'Cloud', sales: 5 },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Good morning 👋</h1>
        <p className="text-gray-600">Here's what's happening with your business today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/distributor/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-gray-600 mt-1">Total Products</p>
                <p className="text-xs text-blue-600 mt-2">Click to manage</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributor/quotes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.activeQuotes}</p>
                <p className="text-sm text-gray-600 mt-1">Active Quotes</p>
                <p className="text-xs text-green-600 mt-2">Click to view</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributor/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-sm text-gray-600 mt-1">Monthly Revenue</p>
                <p className="text-xs text-purple-600 mt-2">+12% from last month</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributor/engagements">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.activeCustomers}</p>
                <p className="text-sm text-gray-600 mt-1">Active Customers</p>
                <p className="text-xs text-orange-600 mt-2">Click to manage</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Trend</CardTitle>
              <Link href="/distributor/analytics">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0066CC" strokeWidth={2} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales by Category</CardTitle>
              <Link href="/distributor/analytics">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#0066CC" name="Sales (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quick Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/distributor/products/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Link href="/distributor/campaigns/new">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
            <Link href="/distributor/engagements">
              <Button variant="outline" className="w-full">
                View Engagements
              </Button>
            </Link>
            <Link href="/distributor/quotes">
              <Button variant="outline" className="w-full">
                Manage Quotes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
