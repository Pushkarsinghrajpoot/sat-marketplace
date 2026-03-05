'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle, X, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getOrganizations, updateOrganization } from '@/lib/data-helpers';

export default function OrganizationsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgs = await getOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  const handleApprove = async (orgId: string, orgName: string) => {
    try {
      await updateOrganization(orgId, { verified: true });
      setOrganizations(orgs => 
        orgs.map(org => 
          org.id === orgId ? { ...org, verified: true } : org
        )
      );
      toast.success(`${orgName} has been approved!`);
    } catch (error) {
      console.error('Error approving organization:', error);
      toast.error('Failed to approve organization');
    }
  };

  const handleReject = async (orgId: string, orgName: string) => {
    try {
      await updateOrganization(orgId, { verified: false });
      setOrganizations(orgs => 
        orgs.map(org => 
          org.id === orgId ? { ...org, verified: false } : org
        )
      );
      toast.info(`${orgName} has been rejected`);
    } catch (error) {
      console.error('Error rejecting organization:', error);
      toast.error('Failed to reject organization');
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Better status filtering logic
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = org.verified === null || org.verified === undefined;
    } else if (statusFilter === 'verified') {
      matchesStatus = org.verified === true;
    } else if (statusFilter === 'rejected') {
      matchesStatus = org.verified === false;
    }
    // 'all' filter shows everything
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Verification</h1>
        <p className="text-gray-600">Review and verify organization applications</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search organizations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredOrganizations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No organizations found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrganizations.map((org) => (
          <Card key={org.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{org.name}</h3>
                    <Badge variant={org.status === 'VERIFIED' ? 'success' : 'warning'}>
                      {org.status}
                    </Badge>
                    <Badge variant="default">{org.type}</Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{org.documents} documents</span>
                    </div>
                    <span>Submitted: {org.submittedAt}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {org.verified === null || org.verified === undefined ? (
                    // Pending - show approve/reject
                    <>
                      <Button size="sm" variant="outline" onClick={() => toast.info('Review feature coming soon')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(org.id, org.name)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(org.id, org.name)}>
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  ) : org.verified === true ? (
                    // Verified - show view details
                    <Button size="sm" variant="outline" onClick={() => toast.info('View details coming soon')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  ) : (
                    // Rejected - show re-review option
                    <>
                      <Badge variant="danger">Rejected</Badge>
                      <Button size="sm" onClick={() => handleApprove(org.id, org.name)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Re-approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  );
}
