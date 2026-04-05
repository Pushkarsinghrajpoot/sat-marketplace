'use client';

import { useEffect, useState } from 'react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { updateOrganization } from '@/lib/data-helpers';
import { toast } from 'sonner';
import {
  User, Building2, Mail, Phone, Globe, Briefcase, Users,
  Pencil, Check, X, Link as LinkIcon, MapPin
} from 'lucide-react';
import Link from 'next/link';

const INDUSTRIES = ['IT Distribution', 'Cloud Services', 'Networking', 'Software', 'Cybersecurity', 'Hardware', 'Telecommunications', 'Technology', 'Other'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

export default function ResellerProfilePage() {
  const { user, organization, teamRole } = useSimpleAuth();

  // ── Profile state ──
  const [editProfile, setEditProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({ name: '', phone_number: '' });

  // ── Org state ──
  const [editOrg, setEditOrg] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [org, setOrg] = useState({
    name: '',
    legal_name: '',
    industry: '',
    company_size: '',
    website: '',
    address_country: '',
    address_city: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', phone_number: user.phoneNumber || '' });
    }
    if (organization) {
      setOrg({
        name: organization.name || '',
        legal_name: (organization as any).legal_name || '',
        industry: (organization as any).industry || '',
        company_size: (organization as any).company_size || '',
        website: (organization as any).website || '',
        address_country: (organization as any).address_country || '',
        address_city: (organization as any).address_city || '',
      });
    }
  }, [user, organization]);

  const isOwner = !teamRole || teamRole === 'ADMIN';

  // ── Save profile ──
  const saveProfile = async () => {
    if (!user?.id || !profile.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: profile.name.trim(), phone_number: profile.phone_number.trim() || null })
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Profile updated');
      setEditProfile(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Save org ──
  const saveOrg = async () => {
    if (!organization?.id || !org.name.trim()) {
      toast.error('Organization name is required');
      return;
    }
    setSavingOrg(true);
    try {
      await updateOrganization(organization.id, {
        name: org.name.trim(),
        legal_name: org.legal_name.trim() || org.name.trim(),
        industry: org.industry || null,
        company_size: org.company_size || null,
        website: org.website.trim() || null,
        address_country: org.address_country.trim() || null,
        address_city: org.address_city.trim() || null,
      });
      toast.success('Organization updated');
      setEditOrg(false);
    } catch {
      toast.error('Failed to update organization');
    } finally {
      setSavingOrg(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#09090B]">Profile & Settings</h1>
        <p className="text-[14px] text-[#71717A]">Manage your personal profile and organization details</p>
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
                {teamRole || 'Owner'}
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
                  <User className="h-4 w-4 text-[#A1A1AA]" />{user?.name || '—'}
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
                  <Phone className="h-4 w-4 text-[#A1A1AA]" />{user?.phoneNumber || '—'}
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Email Address</label>
              <div className="flex items-center gap-2 text-[13px] text-[#71717A]">
                <Mail className="h-4 w-4 text-[#A1A1AA]" />{user?.email}
                <span className="text-[10px] text-[#A1A1AA]">(cannot be changed)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Organization ── */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl mb-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#6366F1]" />
            <p className="text-[14px] font-bold text-[#09090B]">Organization</p>
          </div>
          {isOwner && !editOrg && (
            <button onClick={() => setEditOrg(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6366F1] hover:bg-[#F8F9FF] px-3 py-1.5 rounded-lg transition-colors">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
          {isOwner && editOrg && (
            <div className="flex gap-2">
              <button onClick={saveOrg} disabled={savingOrg}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#6366F1] hover:bg-[#5254CC] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                <Check className="h-3.5 w-3.5" /> {savingOrg ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setEditOrg(false)}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#71717A] border border-[#E4E4E7] hover:bg-[#F4F4F5] px-3 py-1.5 rounded-lg transition-colors">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          )}
        </div>

        {!organization ? (
          <div className="px-6 py-8 text-center text-[13px] text-[#A1A1AA]">
            No organization linked to your account.
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Organization Name *</label>
                {editOrg ? (
                  <input value={org.name} onChange={e => setOrg(o => ({ ...o, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1]" />
                ) : (
                  <p className="text-[13px] font-semibold text-[#09090B]">{organization.name || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Legal Business Name</label>
                {editOrg ? (
                  <input value={org.legal_name} onChange={e => setOrg(o => ({ ...o, legal_name: e.target.value }))}
                    placeholder="Same as org name if blank"
                    className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1]" />
                ) : (
                  <p className="text-[13px] text-[#52525B]">{(organization as any).legal_name || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Industry</label>
                {editOrg ? (
                  <select value={org.industry} onChange={e => setOrg(o => ({ ...o, industry: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1] bg-white">
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 text-[13px] text-[#52525B]">
                    <Briefcase className="h-4 w-4 text-[#A1A1AA]" />{(organization as any).industry || '—'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Company Size</label>
                {editOrg ? (
                  <select value={org.company_size} onChange={e => setOrg(o => ({ ...o, company_size: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1] bg-white">
                    <option value="">Select Size</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 text-[13px] text-[#52525B]">
                    <Users className="h-4 w-4 text-[#A1A1AA]" />{(organization as any).company_size || '—'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">Website</label>
                {editOrg ? (
                  <input value={org.website} onChange={e => setOrg(o => ({ ...o, website: e.target.value }))}
                    placeholder="https://company.com"
                    className="w-full px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1]" />
                ) : (
                  <div className="flex items-center gap-2 text-[13px] text-[#52525B]">
                    <Globe className="h-4 w-4 text-[#A1A1AA]" />
                    {(organization as any).website
                      ? <a href={(organization as any).website} target="_blank" rel="noopener noreferrer" className="text-[#6366F1] hover:underline">{(organization as any).website}</a>
                      : '—'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#52525B] mb-1.5">City / Country</label>
                {editOrg ? (
                  <div className="flex gap-2">
                    <input value={org.address_city} onChange={e => setOrg(o => ({ ...o, address_city: e.target.value }))}
                      placeholder="City"
                      className="flex-1 px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1]" />
                    <input value={org.address_country} onChange={e => setOrg(o => ({ ...o, address_country: e.target.value }))}
                      placeholder="Country"
                      className="flex-1 px-3 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] focus:outline-none focus:border-[#6366F1]" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[13px] text-[#52525B]">
                    <MapPin className="h-4 w-4 text-[#A1A1AA]" />
                    {[(organization as any).address_city, (organization as any).address_country].filter(Boolean).join(', ') || '—'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Links ── */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F4F4F5]">
          <p className="text-[14px] font-bold text-[#09090B]">Quick Links</p>
        </div>
        <div className="px-6 py-4 flex flex-wrap gap-3">
          <Link href="/reseller/team"
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] font-semibold text-[#52525B] hover:border-[#6366F1] hover:text-[#6366F1] transition-colors">
            <Users className="h-4 w-4" /> Manage Team
          </Link>
          <Link href="/reseller/team/assignments"
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E4E4E7] rounded-xl text-[13px] font-semibold text-[#52525B] hover:border-[#6366F1] hover:text-[#6366F1] transition-colors">
            <LinkIcon className="h-4 w-4" /> Team Assignments
          </Link>
        </div>
      </div>
    </div>
  );
}
