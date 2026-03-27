'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Award, Building, Star, Shield, CheckCircle } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { assignBadge, getAdminActivityLog } from '@/lib/admin-helpers';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const BADGE_TYPES = [
  { value: 'TOP_RATED', label: 'Top Rated', icon: Star, color: 'text-yellow-600', description: 'Consistently high ratings' },
  { value: 'TRUSTED', label: 'Trusted Partner', icon: Shield, color: 'text-blue-600', description: 'Verified and trusted' },
  { value: 'VERIFIED', label: 'Verified', icon: CheckCircle, color: 'text-green-600', description: 'Verified organization' },
  { value: 'PREFERRED_PARTNER', label: 'Preferred Partner', icon: Award, color: 'text-purple-600', description: 'Preferred partnership status' },
];

export default function BadgeManagementPage() {
  const { user } = useSimpleAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [orgsData, actionsData] = await Promise.all([
        loadOrganizations(),
        getAdminActivityLog({ activityType: 'BADGE_ASSIGNMENT', limit: 10 }),
      ]);

      setOrganizations(orgsData);
      setRecentActions(actionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('qualification_status', 'APPROVED')
      .order('name');

    if (error) {
      console.error('Error loading organizations:', error);
      return [];
    }

    return data || [];
  };

  const handleAssignBadge = async () => {
    if (!user?.id || !selectedOrg || !selectedBadge) {
      toast.error('Please select an organization and badge');
      return;
    }

    setAssigning(true);
    try {
      const result = await assignBadge(selectedOrg, selectedBadge, user.id);
      
      if (result.success) {
        toast.success('Badge assigned successfully!');
        setSelectedOrg('');
        setSelectedBadge('');
        loadData();
      } else {
        toast.error('Failed to assign badge');
      }
    } catch (error) {
      console.error('Error assigning badge:', error);
      toast.error('Failed to assign badge');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveBadge = async (orgId: string) => {
    if (!user?.id) return;

    if (!confirm('Remove badge from this organization?')) return;

    try {
      const result = await assignBadge(orgId, '', user.id);
      
      if (result.success) {
        toast.success('Badge removed');
        loadData();
      } else {
        toast.error('Failed to remove badge');
      }
    } catch (error) {
      console.error('Error removing badge:', error);
      toast.error('Failed to remove badge');
    }
  };

  const getBadgeInfo = (badgeValue: string) => {
    return BADGE_TYPES.find(b => b.value === badgeValue);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading badge management...</p>
        </div>
      </div>
    );
  }

  const badgedOrgs = organizations.filter(o => o.badge);
  const unbadgedOrgs = organizations.filter(o => !o.badge);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Badge Management</h1>
          <p className="text-gray-600">Assign recognition badges to qualified organizations</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {BADGE_TYPES.map((badge) => {
            const Icon = badge.icon;
            const count = organizations.filter(o => o.badge === badge.value).length;
            
            return (
              <Card key={badge.value}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-6 w-6 ${badge.color}`} />
                    <div>
                      <p className="font-semibold">{badge.label}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assign New Badge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organization</label>
                <Select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                >
                  <option value="">Select organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} {org.badge && `(${getBadgeInfo(org.badge)?.label})`}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Badge</label>
                <Select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                >
                  <option value="">Select badge</option>
                  {BADGE_TYPES.map((badge) => (
                    <option key={badge.value} value={badge.value}>
                      {badge.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleAssignBadge}
                  disabled={assigning || !selectedOrg || !selectedBadge}
                  className="w-full"
                >
                  {assigning ? 'Assigning...' : 'Assign Badge'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Badged Organizations ({badgedOrgs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {badgedOrgs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No badged organizations yet</p>
              ) : (
                <div className="space-y-3">
                  {badgedOrgs.map((org) => {
                    const badgeInfo = getBadgeInfo(org.badge);
                    const Icon = badgeInfo?.icon || Award;
                    
                    return (
                      <div
                        key={org.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${badgeInfo?.color || 'text-gray-400'}`} />
                          <div>
                            <p className="font-semibold">{org.name}</p>
                            <Badge variant="default" className="mt-1">
                              {badgeInfo?.label}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveBadge(org.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Badge Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent actions</p>
              ) : (
                <div className="space-y-3">
                  {recentActions.map((action: any) => (
                    <div
                      key={action.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{action.action}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(action.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        by {action.admin?.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
