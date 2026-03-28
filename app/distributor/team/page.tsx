'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Users, UserPlus, Mail, Shield, Trash2, Edit, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSimpleAuth } from '@/lib/simple-auth';
import { 
  inviteTeamMember,
  createTeamMemberDirect,
  getTeamMembers, 
  getPendingInvitations,
  updateTeamMember,
  removeTeamMember 
} from '@/lib/team-management';
import RolePermissionsManager from '@/components/team/RolePermissionsManager';

const TEAM_ROLES = [
  { value: 'ADMIN', label: 'Admin', description: 'Full access to all features' },
  { value: 'MANAGER', label: 'Manager', description: 'Manage quotes and team members' },
  { value: 'SALES', label: 'Sales', description: 'Handle deals and quotes' },
  { value: 'SUPPORT', label: 'Support', description: 'Handle inquiries and messages' },
  { value: 'MEMBER', label: 'Member', description: 'Basic access to products' },
];

export default function DistributorTeamPage() {
  const { user } = useSimpleAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [creationMethod, setCreationMethod] = useState<'direct' | 'invite'>('direct');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    password: '',
    teamRole: 'SALES',
  });
  const [sending, setSending] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  useEffect(() => {
    loadTeamData();
  }, [user?.organizationId]);

  const loadTeamData = async () => {
    if (!user?.organizationId) return;
    
    try {
      const [members, invitations] = await Promise.all([
        getTeamMembers(user.organizationId),
        getPendingInvitations(user.organizationId),
      ]);
      
      setTeamMembers(members);
      setPendingInvitations(invitations);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!user?.id || !user?.organizationId || !inviteForm.email) {
      toast.error('Please provide email address');
      return;
    }

    if (creationMethod === 'direct') {
      if (!inviteForm.name || !inviteForm.password) {
        toast.error('Please provide name and password');
        return;
      }
    }

    setSending(true);
    try {
      let result;
      
      if (creationMethod === 'direct') {
        result = await createTeamMemberDirect({
          organizationId: user.organizationId,
          email: inviteForm.email,
          name: inviteForm.name,
          password: inviteForm.password,
          role: user.role,
          teamRole: inviteForm.teamRole,
          createdBy: user.id,
        });
        
        if (result.success) {
          toast.success(`Team member created! They can login with: ${inviteForm.email}`);
        }
      } else {
        result = await inviteTeamMember({
          organizationId: user.organizationId,
          email: inviteForm.email,
          role: user.role,
          teamRole: inviteForm.teamRole,
          invitedBy: user.id,
        });
        
        if (result.success) {
          toast.success('Invitation link sent to email!');
        }
      }

      if (result.success) {
        setShowInviteModal(false);
        setInviteForm({ email: '', name: '', password: '', teamRole: 'SALES' });
        loadTeamData();
      } else {
        toast.error('Failed to add team member');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const result = await updateTeamMember(userId, { teamRole: newRole });
      if (result.success) {
        toast.success('Role updated successfully');
        loadTeamData();
      } else {
        toast.error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const result = await removeTeamMember(userId);
      if (result.success) {
        toast.success('Team member removed');
        loadTeamData();
      } else {
        toast.error('Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove team member');
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
            <p className="text-gray-600">Manage your team members and invitations</p>
          </div>
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Team Member
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                  <p className="text-sm text-gray-600">Team Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingInvitations.length}</p>
                  <p className="text-sm text-gray-600">Pending Invitations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {teamMembers.filter(m => m.team_role === 'ADMIN').length}
                  </p>
                  <p className="text-sm text-gray-600">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No team members yet</p>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="default">{member.team_role || 'SALES'}</Badge>
                      
                      <Badge variant={member.invitation_status === 'ACTIVE' ? 'success' : 'warning'}>
                        {member.invitation_status || 'ACTIVE'}
                      </Badge>
                      
                      {member.id !== user?.id && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMember(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-semibold">{invitation.email}</p>
                        <p className="text-sm text-gray-600">
                          Invited {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="warning">{invitation.team_role}</Badge>
                      <Badge>Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Invite Team Member</h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Creation Method Toggle */}
                  <div>
                    <label className="block text-sm font-medium mb-3">How would you like to add this member?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCreationMethod('direct')}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                          creationMethod === 'direct'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold mb-1">Create Account</div>
                        <div className="text-xs opacity-75">Set password for them</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreationMethod('invite')}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                          creationMethod === 'invite'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold mb-1">Send Invite</div>
                        <div className="text-xs opacity-75">They set password</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      placeholder="colleague@example.com"
                    />
                  </div>

                  {/* Show name and password fields only for direct creation */}
                  {creationMethod === 'direct' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <Input
                          type="text"
                          value={inviteForm.name}
                          onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Password *</label>
                        <Input
                          type="password"
                          value={inviteForm.password}
                          onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                          placeholder="Enter secure password"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Make sure to share this password securely with the team member
                        </p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Team Role *</label>
                    <Select
                      value={inviteForm.teamRole}
                      onChange={(e) => setInviteForm({ ...inviteForm, teamRole: e.target.value })}
                    >
                      {TEAM_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label} - {role.description}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className={`border-2 rounded-lg p-4 ${
                    creationMethod === 'direct' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className={`text-sm font-semibold mb-2 ${creationMethod === 'direct' ? 'text-green-900' : 'text-blue-900'}`}>
                      What happens next:
                    </p>
                    {creationMethod === 'direct' ? (
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>✓ Account created instantly</li>
                        <li>✓ They can login immediately with email & password</li>
                        <li>✓ Share the password securely with them</li>
                      </ul>
                    ) : (
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Invitation link sent to their email</li>
                        <li>✓ They click link and set their own password</li>
                        <li>✓ Account created after they accept</li>
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleInvite}
                    disabled={sending || !inviteForm.email}
                    className="flex-1"
                  >
                    {sending ? (creationMethod === 'direct' ? 'Creating...' : 'Sending...') : (creationMethod === 'direct' ? 'Create Account' : 'Send Invitation')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteModal(false)}
                    disabled={sending}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Role Permissions Manager Modal */}
        {editingMember && user && (
          <RolePermissionsManager
            userId={editingMember.id}
            userName={editingMember.name}
            userRole={user.role}
            currentTeamRole={editingMember.team_role || 'SALES'}
            currentPermissions={editingMember.permissions || []}
            onClose={() => setEditingMember(null)}
            onUpdate={loadTeamData}
          />
        )}
      </div>
    </div>
  );
}
