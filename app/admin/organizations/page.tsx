'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, CheckCircle, X, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function OrganizationsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = () => {
    const storedOrgs = JSON.parse(localStorage.getItem('organizations') || '[]');
    const pendingOrgs = [
      { id: 'p1', name: 'NewTech Solutions', type: 'DISTRIBUTOR', status: 'PENDING', submittedAt: '2024-01-23', documents: 2 },
      { id: 'p2', name: 'Global Resale Corp', type: 'RESELLER', status: 'PENDING', submittedAt: '2024-01-24', documents: 3 },
      { id: 'p3', name: 'Future Tech Distribution', type: 'DISTRIBUTOR', status: 'PENDING', submittedAt: '2024-01-25', documents: 3 },
    ];
    
    const verifiedOrgs = storedOrgs.map((org: any) => ({
      id: org.id,
      name: org.name,
      type: org.type,
      status: 'VERIFIED',
      submittedAt: '2023-01-15',
      documents: 3,
    }));

    setOrganizations([...pendingOrgs, ...verifiedOrgs]);
  };

  const handleApprove = (orgId: string, orgName: string) => {
    setOrganizations(orgs => 
      orgs.map(org => 
        org.id === orgId ? { ...org, status: 'VERIFIED' } : org
      )
    );
    toast.success(`${orgName} has been approved!`);
  };

  const handleReject = (orgId: string, orgName: string) => {
    setOrganizations(orgs => 
      orgs.map(org => 
        org.id === orgId ? { ...org, status: 'REJECTED' } : org
      )
    );
    toast.error(`${orgName} has been rejected`);
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && org.status === 'PENDING') ||
                         (statusFilter === 'verified' && org.status === 'VERIFIED') ||
                         (statusFilter === 'rejected' && org.status === 'REJECTED');
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
                  {org.status === 'PENDING' ? (
                    <>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
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
