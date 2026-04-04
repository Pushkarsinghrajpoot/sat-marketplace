'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Users, UserPlus, Mail, Phone, Shield, Trash2, Edit2, X,
  CheckCircle, Clock, Eye, ShoppingBag, ChevronDown, Building2
} from 'lucide-react';

const TEAM_ROLES = [
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Full access — can manage team, place & approve orders',
    icon: Shield,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    value: 'PURCHASER',
    label: 'Purchaser',
    description: 'Can browse products, add to cart and place orders',
    icon: ShoppingBag,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'APPROVER',
    label: 'Approver',
    description: 'Can review and approve purchase orders',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700',
  },
  {
    value: 'VIEWER',
    label: 'Viewer',
    description: 'Read-only access to orders and products',
    icon: Eye,
    color: 'bg-gray-100 text-gray-700',
  },
];

const getRoleConfig = (role: string) => TEAM_ROLES.find(r => r.value === role) || TEAM_ROLES[3];

function AddMemberModal({
  onClose,
  onAdded,
  token,
}: {
  onClose: () => void;
  onAdded: (member: any) => void;
  token: string;
}) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone_number: '', teamRole: 'PURCHASER' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/end-user/team', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`${form.name} has been added to your team`);
        onAdded(json.member);
        onClose();
      } else {
        toast.error(json.error || 'Failed to add member');
      }
    } catch {
      toast.error('Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7]">
          <h2 className="font-bold text-[16px] text-[#09090B]">Add Team Member</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F4F5] text-[#71717A]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Full Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Jane Doe"
                className="w-full h-10 px-3 border border-[#E4E4E7] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Phone</label>
              <input
                value={form.phone_number}
                onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                placeholder="+1 234 567 8900"
                className="w-full h-10 px-3 border border-[#E4E4E7] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="jane@company.com"
              className="w-full h-10 px-3 border border-[#E4E4E7] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Minimum 8 characters"
              className="w-full h-10 px-3 border border-[#E4E4E7] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#52525B] mb-2">Team Role *</label>
            <div className="space-y-2">
              {TEAM_ROLES.map(role => {
                const Icon = role.icon;
                return (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.teamRole === role.value
                        ? 'border-[#6366F1] bg-[#EEF2FF]'
                        : 'border-[#E4E4E7] hover:border-[#6366F1]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="teamRole"
                      value={role.value}
                      checked={form.teamRole === role.value}
                      onChange={() => setForm(f => ({ ...f, teamRole: role.value }))}
                      className="hidden"
                    />
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${role.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#09090B]">{role.label}</p>
                      <p className="text-[11px] text-[#71717A]">{role.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#6366F1] text-white rounded-xl text-[13px] font-semibold hover:bg-[#5254CC] transition-colors disabled:opacity-50">
              {saving ? 'Adding member…' : 'Add to Team'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 border border-[#E4E4E7] text-[#71717A] rounded-xl text-[13px] font-semibold hover:bg-[#F4F4F5] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditRoleModal({
  member,
  onClose,
  onUpdated,
  token,
}: {
  member: any;
  onClose: () => void;
  onUpdated: (member: any) => void;
  token: string;
}) {
  const [selectedRole, setSelectedRole] = useState(member.team_role || 'VIEWER');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/end-user/team/${member.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamRole: selectedRole }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Role updated');
        onUpdated(json.member);
        onClose();
      } else {
        toast.error(json.error || 'Failed to update role');
      }
    } catch {
      toast.error('Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7]">
          <h2 className="font-bold text-[15px] text-[#09090B]">Change Role — {member.name}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F4F5] text-[#71717A]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-2">
          {TEAM_ROLES.map(role => {
            const Icon = role.icon;
            return (
              <label key={role.value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedRole === role.value ? 'border-[#6366F1] bg-[#EEF2FF]' : 'border-[#E4E4E7] hover:border-[#6366F1]/40'
                }`}>
                <input type="radio" name="editRole" value={role.value} checked={selectedRole === role.value}
                  onChange={() => setSelectedRole(role.value)} className="hidden" />
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${role.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#09090B]">{role.label}</p>
                  <p className="text-[11px] text-[#71717A]">{role.description}</p>
                </div>
                {selectedRole === role.value && <CheckCircle className="h-4 w-4 text-[#6366F1] flex-shrink-0" />}
              </label>
            );
          })}
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 bg-[#6366F1] text-white rounded-xl text-[13px] font-semibold hover:bg-[#5254CC] disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Role'}
            </button>
            <button onClick={onClose}
              className="px-4 py-2.5 border border-[#E4E4E7] text-[#71717A] rounded-xl text-[13px] font-semibold hover:bg-[#F4F4F5]">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EndUserTeamPage() {
  const { user, teamRole } = useSimpleAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgExists, setOrgExists] = useState(false);
  const [org, setOrg] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (user?.id) loadTeam();
  }, [user?.id]);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const t = session?.access_token || '';
      setToken(t);
      const res = await fetch('/api/end-user/team', {
        headers: { Authorization: `Bearer ${t}` },
      });
      const json = await res.json();
      if (res.ok) {
        setMembers(json.members || []);
        setOrgExists(json.orgExists || false);
        setOrg(json.org || null);
      }
    } catch {
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from your team?`)) return;
    try {
      const res = await fetch(`/api/end-user/team/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== memberId));
        toast.success(`${memberName} removed from team`);
      } else {
        toast.error(json.error || 'Failed to remove member');
      }
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const isAdmin = !teamRole || teamRole === 'ADMIN';
  const activeMembers = members.filter(m => m.is_active);
  const inactiveMembers = members.filter(m => !m.is_active);

  const stats = [
    { label: 'Total Members', value: activeMembers.length, icon: Users, color: 'bg-[#EEF2FF] text-[#6366F1]' },
    { label: 'Purchasers', value: activeMembers.filter(m => m.team_role === 'PURCHASER').length, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Approvers', value: activeMembers.filter(m => m.team_role === 'APPROVER').length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Admins', value: activeMembers.filter(m => m.team_role === 'ADMIN').length, icon: Shield, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#09090B]">Team Management</h1>
          <p className="text-[14px] text-[#71717A]">
            {org ? `Managing team for ${org.name}` : 'Manage your company buying team'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-xl text-[13px] font-semibold hover:bg-[#5254CC] transition-colors">
            <UserPlus className="h-4 w-4" /> Add Member
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !orgExists && activeMembers.length === 0 ? (
        /* Empty state — first time */
        <Card className="border-[#E4E4E7]">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-[#6366F1]" />
            </div>
            <h3 className="text-[18px] font-bold text-[#09090B] mb-2">Set up your buying team</h3>
            <p className="text-[14px] text-[#71717A] max-w-sm mx-auto mb-6">
              Invite colleagues from your company to share purchasing access. Each member can have a specific role — Admin, Purchaser, Approver, or Viewer.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
              {TEAM_ROLES.map(role => {
                const Icon = role.icon;
                return (
                  <div key={role.value} className={`flex items-center gap-2.5 p-3 rounded-xl ${role.color.split(' ')[0]}`}>
                    <Icon className={`h-4 w-4 ${role.color.split(' ')[1]}`} />
                    <div>
                      <p className={`text-[12px] font-bold ${role.color.split(' ')[1]}`}>{role.label}</p>
                      <p className="text-[10px] text-[#71717A]">{role.description.split('—')[0].trim()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {isAdmin && (
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#6366F1] text-white rounded-xl text-[13px] font-semibold hover:bg-[#5254CC] transition-colors mx-auto">
                <UserPlus className="h-4 w-4" /> Add Your First Team Member
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-[#E4E4E7]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[20px] font-bold text-[#09090B] leading-none">{value}</p>
                    <p className="text-[11px] text-[#71717A] mt-1">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active Members */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-3">
              Active Members ({activeMembers.length})
            </p>
            <div className="space-y-2">
              {activeMembers.map(member => {
                const roleConfig = getRoleConfig(member.team_role);
                const RoleIcon = roleConfig.icon;
                const isMe = member.id === user?.id;
                return (
                  <Card key={member.id} className="border-[#E4E4E7]">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-bold text-sm flex-shrink-0">
                          {member.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[14px] font-semibold text-[#09090B]">{member.name}</p>
                            {isMe && (
                              <span className="text-[10px] bg-[#EEF2FF] text-[#6366F1] font-bold px-1.5 py-0.5 rounded">You</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[12px] text-[#71717A]">
                            <a href={`mailto:${member.email}`} className="flex items-center gap-1 hover:text-[#6366F1]">
                              <Mail className="h-3 w-3" />{member.email}
                            </a>
                            {member.phone_number && (
                              <a href={`tel:${member.phone_number}`} className="flex items-center gap-1 hover:text-[#6366F1]">
                                <Phone className="h-3 w-3" />{member.phone_number}
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Role badge */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex-shrink-0 ${roleConfig.color}`}>
                          <RoleIcon className="h-3.5 w-3.5" />
                          {roleConfig.label}
                        </div>

                        {/* Actions */}
                        {isAdmin && !isMe && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => setEditingMember(member)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E4E4E7] text-[#71717A] hover:border-[#6366F1] hover:text-[#6366F1] transition-colors">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => removeMember(member.id, member.name)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E4E4E7] text-[#71717A] hover:border-red-400 hover:text-red-500 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Inactive Members */}
          {inactiveMembers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wide mb-3">
                Deactivated ({inactiveMembers.length})
              </p>
              <div className="space-y-2">
                {inactiveMembers.map(member => (
                  <Card key={member.id} className="border-[#E4E4E7] opacity-60">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center text-[#A1A1AA] font-bold text-sm flex-shrink-0">
                        {member.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#71717A]">{member.name}</p>
                        <p className="text-[12px] text-[#A1A1AA]">{member.email}</p>
                      </div>
                      <span className="text-[11px] bg-[#F4F4F5] text-[#A1A1AA] font-bold px-2 py-1 rounded-lg">Deactivated</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddMemberModal
          token={token}
          onClose={() => setShowAddModal(false)}
          onAdded={member => setMembers(prev => [...prev, member])}
        />
      )}
      {editingMember && (
        <EditRoleModal
          member={editingMember}
          token={token}
          onClose={() => setEditingMember(null)}
          onUpdated={updated => {
            setMembers(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}
