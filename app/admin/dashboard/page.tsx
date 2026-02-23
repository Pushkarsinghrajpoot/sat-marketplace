'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, FileText, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getUsers, getOrganizations, getDeals } from '@/lib/data-helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrgs: 0,
    activeDeals: 0,
    gmv: 0,
    pendingVerifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [users, organizations, deals] = await Promise.all([
          getUsers(),
          getOrganizations(),
          getDeals(),
        ]);

        const activeDeals = deals.filter((d: any) => 
          d.status !== 'WON' && d.status !== 'LOST' && d.status !== 'REJECTED'
        );
        const totalGMV = deals
          .filter((d: any) => d.status === 'WON')
          .reduce((sum, d) => sum + (d.deal_value || 0), 0);
        
        setStats({
          totalUsers: users.length,
          totalOrgs: organizations.length,
          activeDeals: activeDeals.length,
          gmv: totalGMV,
          pendingVerifications: organizations.filter((o: any) => !o.verified).length,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Overview</h1>
        <p className="text-gray-600">Monitor and manage the B2B marketplace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600 mt-1">Total Users</p>
              <p className="text-xs text-green-600 mt-2">↑ 12% this month</p>
            </div>
          </CardContent>
        </Card>

        <Link href="/admin/organizations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrgs}</p>
                <p className="text-sm text-gray-600 mt-1">Organizations</p>
                <p className="text-xs text-orange-600 mt-2">{stats.pendingVerifications} pending verification</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.activeDeals}</p>
              <p className="text-sm text-gray-600 mt-1">Active Deals</p>
              <p className="text-xs text-green-600 mt-2">↑ 8% this week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(15800000)}</p>
              <p className="text-sm text-gray-600 mt-1">GMV (Monthly)</p>
              <p className="text-xs text-green-600 mt-2">↑ 15% vs last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Verifications</span>
              <Link href="/admin/organizations">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-sm">TechCorp Distribution Inc.</p>
                      <p className="text-xs text-gray-600">Submitted 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/admin/organizations">
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Organization verified', org: 'CloudFirst Solutions', icon: CheckCircle, color: 'text-green-600' },
                { action: 'New user registered', org: 'john@example.com', icon: Users, color: 'text-blue-600' },
                { action: 'Deal completed', org: 'Premier Resellers - $125K', icon: FileText, color: 'text-purple-600' },
              ].map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className={`h-5 w-5 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.org}</p>
                    </div>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-semibold">API Status</span>
              </div>
              <p className="text-xs text-gray-600">All systems operational</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-semibold">Database</span>
              </div>
              <p className="text-xs text-gray-600">Healthy</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-semibold">Storage</span>
              </div>
              <p className="text-xs text-gray-600">78% capacity</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-semibold">Uptime</span>
              </div>
              <p className="text-xs text-gray-600">99.98%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
