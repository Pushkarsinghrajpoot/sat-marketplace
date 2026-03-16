'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const dealData = [
    { month: 'Jan', registered: 8, won: 3, lost: 2, pending: 3 },
    { month: 'Feb', registered: 12, won: 5, lost: 3, pending: 4 },
    { month: 'Mar', registered: 10, won: 4, lost: 2, pending: 4 },
    { month: 'Apr', registered: 15, won: 7, lost: 4, pending: 4 },
    { month: 'May', registered: 11, won: 5, lost: 3, pending: 3 },
    { month: 'Jun', registered: 14, won: 6, lost: 3, pending: 5 },
  ];

  const performanceData = [
    { month: 'Jan', value: 125000, deals: 3 },
    { month: 'Feb', value: 215000, deals: 5 },
    { month: 'Mar', value: 180000, deals: 4 },
    { month: 'Apr', value: 295000, deals: 7 },
    { month: 'May', value: 235000, deals: 5 },
    { month: 'Jun', value: 310000, deals: 6 },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Analytics</h1>
          <p className="text-gray-600">Track your deal performance and win rates</p>
        </div>
        <Select defaultValue="90">
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">70</p>
            <p className="text-sm text-gray-600 mt-1">Total Deals</p>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +18% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">30</p>
            <p className="text-sm text-gray-600 mt-1">Deals Won</p>
            <p className="text-xs text-green-600 mt-2">42.8% win rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">19</p>
            <p className="text-sm text-gray-600 mt-1">In Progress</p>
            <p className="text-xs text-gray-500 mt-2">Pending quotes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">SAR 1.36M</p>
            <p className="text-sm text-gray-600 mt-1">Total Value</p>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +24% growth
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dealData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="won" fill="#1D8102" name="Won" />
                <Bar dataKey="pending" fill="#FF9900" name="Pending" />
                <Bar dataKey="lost" fill="#D13212" name="Lost" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#0066CC" strokeWidth={2} name="Revenue (SAR)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
