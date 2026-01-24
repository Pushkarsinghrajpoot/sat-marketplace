'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, X, Send } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';

export default function SettingsPage() {
  const { organization } = useAuthStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('SALES_REP');
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'John Smith', email: 'john@techdist.example.com', role: 'ADMIN', status: 'Active' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@techdist.example.com', role: 'SALES_MANAGER', status: 'Active' },
  ]);

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    const invitation = {
      id: generateId(),
      email: inviteEmail,
      role: inviteRole,
      organizationId: organization?.id,
      status: 'PENDING',
      sentAt: new Date().toISOString(),
    };

    // Save to localStorage
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    invitations.push(invitation);
    localStorage.setItem('invitations', JSON.stringify(invitations));

    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Settings</h1>
          <p className="text-gray-600">Manage your team and organization preferences</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="info">{member.role.replace('_', ' ')}</Badge>
                      <Badge variant="success">{member.status}</Badge>
                      {member.role !== 'ADMIN' && (
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Team Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Role *</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SALES_REP">Sales Rep</option>
                      <option value="SALES_MANAGER">Sales Manager</option>
                      <option value="PRODUCT_MANAGER">Product Manager</option>
                      <option value="SUPPORT">Support</option>
                      <option value="PRESALES_ENGINEER">Presales Engineer</option>
                      <option value="ACCOUNT_MANAGER">Account Manager</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> An invitation email will be sent to the provided address. 
                    They'll need to accept the invitation to join your organization.
                  </p>
                </div>

                <Button onClick={handleInvite}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Name</label>
                  <Input value={organization?.name} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Legal Name</label>
                  <Input value={organization?.legalName} disabled />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <Input value={organization?.industry} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Size</label>
                    <Input value={organization?.companySize} disabled />
                  </div>
                </div>
                <Button variant="outline">Edit Organization Details</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
