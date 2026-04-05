'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  User, Building2, Mail, Phone, Pencil, Check, X, Users, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

export default function EndUserProfilePage() {
  const router = useRouter();
  const { user, organization, teamRole, loading: authLoading } = useSimpleAuth();

  // ── Profile state ──
  const [editProfile, setEditProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({ name: '', phone_number: '' });

  // ── Org state ──
  const [editOrg, setEditOrg] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgLegalName, setOrgLegalName] = useState('');

  // Refetch user data after save to reflect changes in UI
  const [refreshedOrg, setRefreshedOrg] = useState<{ name: string; legal_name: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }
    setProfile({ name: user.name || '', phone_number: user.phoneNumber || '' });
  }, [user, authLoading]);

  useEffect(() => {
    if (organization) {
      setOrgName((organization as any).name || '');
      setOrgLegalName((organization as any).legal_name || '');
    }
  }, [organization]);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  // ── Save profile ──
  const saveProfile = async () => {
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/end-user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name.trim(), phone_number: profile.phone_number }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      toast.success('Profile updated');
      setEditProfile(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Save org ──
  const saveOrg = async () => {
    if (!orgName.trim()) { toast.error('Company name is required'); return; }
    setSavingOrg(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/end-user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ org_name: orgName.trim(), org_legal_name: orgLegalName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      toast.success(organization ? 'Company updated' : 'Company created');
      setRefreshedOrg({ name: orgName.trim(), legal_name: orgLegalName.trim() });
      setEditOrg(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingOrg(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = !teamRole || teamRole === 'ADMIN';
  const displayOrg = refreshedOrg || (organization ? { name: (organization as any).name, legal_name: (organization as any).legal_name } : null);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#09090B]">My Profile</h1>
        <p className="text-[14px] text-[#71717A]">Manage your personal details and company information</p>
      </div>

      {/* ── Personal Profile ── */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl mb-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#6366F1]" />
            <p className="text-[14px] font-bold text-[#09090B]">Personal Profile</p>
          </div>
          {!editProfile ? (
            <button onClick={() => setEditProfile(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6366F1] hover:bg-[#F8F9FF] px-3 py-1.5 rounded-lg transition-colors">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveProfile} disabled={savingProfile}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#6366F1] hover:bg-[#5254CC] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                <Check className="h-3.5 w-3.5" /> {savingProfile ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditProfile(false); setProfile({ name: user?.name || '', phone_number: user?.phoneNumber || '' }); }}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#71717A] border border-[#E4E4E7] hover:bg-[#F4F4F5] px-3 py-1.5 rounded-lg transition-colors">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-[#6366F1] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {(editProfile ? profile.name : user?.name)?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#09090B]">{user?.name}</p>
              <p className="text-[13px] text-[#71717A]">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold bg-[#EEF2FF] text-[#6366F1] px-2 py-0.5 rounded-full uppercase tracking-wide">
                {teamRole || 'Buyer'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Full Name</label>
              {editProfile ? (
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1]" />
              ) : (
                <div className="flex items-center gap-2 text-[13px] text-[#09090B]">
                  <User className="h-4 w-4 text-[#A1A1AA]" /> {user?.name || '—'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Phone Number</label>
              {editProfile ? (
                <input value={profile.phone_number} onChange={e => setProfile(p => ({ ...p, phone_number: e.target.value }))}
                  placeholder="+1-415-555-0100"
                  className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1]" />
              ) : (
                <div className="flex items-center gap-2 text-[13px] text-[#09090B]">
                  <Phone className="h-4 w-4 text-[#A1A1AA]" /> {user?.phoneNumber || '—'}
                </div>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Email Address</label>
              <div className="flex items-center gap-2 text-[13px] text-[#71717A]">
                <Mail className="h-4 w-4 text-[#A1A1AA]" /> {user?.email}
                <span className="text-[10px] text-[#A1A1AA]">(cannot be changed)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Company / Organization ── */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl mb-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#6366F1]" />
            <p className="text-[14px] font-bold text-[#09090B]">
              {displayOrg ? 'Company' : 'Set Up Your Company'}
            </p>
            {!displayOrg && (
              <span className="text-[11px] text-[#A1A1AA] bg-[#F4F4F5] px-2 py-0.5 rounded-full">Optional</span>
            )}
          </div>
          {!editOrg ? (
            <button onClick={() => setEditOrg(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6366F1] hover:bg-[#F8F9FF] px-3 py-1.5 rounded-lg transition-colors">
              <Pencil className="h-3.5 w-3.5" /> {displayOrg ? 'Edit' : 'Add'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveOrg} disabled={savingOrg}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#6366F1] hover:bg-[#5254CC] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                <Check className="h-3.5 w-3.5" /> {savingOrg ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditOrg(false); setOrgName(displayOrg?.name || ''); setOrgLegalName(displayOrg?.legal_name || ''); }}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#71717A] border border-[#E4E4E7] hover:bg-[#F4F4F5] px-3 py-1.5 rounded-lg transition-colors">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-5">
          {!editOrg && !displayOrg && (
            <div className="text-center py-4">
              <Building2 className="h-10 w-10 text-[#D4D4D8] mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-[#09090B] mb-1">No company linked yet</p>
              <p className="text-[13px] text-[#71717A] mb-4">Add your company name to personalize your account and orders.</p>
              <button onClick={() => setEditOrg(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white text-[13px] font-semibold rounded-xl hover:bg-[#5254CC] transition-colors">
                <Building2 className="h-4 w-4" /> Add Company
              </button>
            </div>
          )}

          {!editOrg && displayOrg && (
            <div className="space-y-3">
              <div>
                <p className="text-[12px] font-semibold text-[#52525B] mb-0.5">Company Name</p>
                <p className="text-[14px] font-semibold text-[#09090B]">{displayOrg.name}</p>
              </div>
              {displayOrg.legal_name && displayOrg.legal_name !== displayOrg.name && (
                <div>
                  <p className="text-[12px] font-semibold text-[#52525B] mb-0.5">Legal Name</p>
                  <p className="text-[13px] text-[#52525B]">{displayOrg.legal_name}</p>
                </div>
              )}
            </div>
          )}

          {editOrg && (
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Company Name *</label>
                <input value={orgName} onChange={e => setOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">
                  Legal Business Name
                  <span className="ml-1 text-[11px] font-normal text-[#A1A1AA]">(leave blank to use company name)</span>
                </label>
                <input value={orgLegalName} onChange={e => setOrgLegalName(e.target.value)}
                  placeholder="Acme Corp Ltd."
                  className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F4F4F5]">
          <p className="text-[14px] font-bold text-[#09090B]">Quick Links</p>
        </div>
        <div className="px-6 py-4 flex flex-wrap gap-3">
          <Link href="/end-user/orders"
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] font-semibold text-[#52525B] hover:border-[#6366F1] hover:text-[#6366F1] transition-colors">
            <ShoppingBag className="h-4 w-4" /> My Orders
          </Link>
          {isAdmin && (
            <Link href="/end-user/team"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] font-semibold text-[#52525B] hover:border-[#6366F1] hover:text-[#6366F1] transition-colors">
              <Users className="h-4 w-4" /> My Team
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
