'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/lib/simple-auth';
import { toast } from 'sonner';
import {
  Users, Plus, X, Eye, EyeOff, Building2, User, Store,
  Search, ChevronDown, CheckCircle, Loader2, Mail, Phone,
  Globe, MapPin, Calendar, Briefcase,
} from 'lucide-react';

type UserRole = 'RESELLER' | 'DISTRIBUTOR' | 'END_USER';

const ROLE_META: Record<UserRole, { label: string; color: string; bg: string }> = {
  DISTRIBUTOR: { label: 'Distributor', color: '#4648D4', bg: 'rgba(70,72,212,0.1)' },
  RESELLER:    { label: 'Reseller',    color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  END_USER:    { label: 'End User',    color: '#059669', bg: 'rgba(5,150,105,0.1)' },
};

const INDUSTRIES = ['IT Distribution', 'Cloud Services', 'Networking', 'Software', 'Cybersecurity', 'Hardware', 'Telecommunications', 'Technology'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'India', 'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Egypt', 'Jordan'];

const emptyForm = {
  // User
  name: '',
  email: '',
  password: '',
  phone_number: '',
  role: 'RESELLER' as UserRole,
  // Org
  org_name: '',
  org_legal_name: '',
  org_industry: '',
  org_company_size: '',
  org_year_established: new Date().getFullYear(),
  org_website: '',
  org_description: '',
  org_country: '',
  org_city: '',
  org_state: '',
  org_postal_code: '',
  org_phone: '',
  org_support_email: '',
  org_sales_email: '',
  org_verified: false,
};

export default function AdminUsersPage() {
  const { user: adminUser } = useSimpleAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [panelOpen, setPanelOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orgStep, setOrgStep] = useState(false);

  const needsOrg = form.role === 'RESELLER' || form.role === 'DISTRIBUTOR';

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone_number, is_active, created_at, organizations(name, type, verified)')
      .in('role', ['RESELLER', 'DISTRIBUTOR', 'END_USER'])
      .order('created_at', { ascending: false });

    if (!error) setUsers(data || []);
    setLoading(false);
  }

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.organizations?.name?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    ALL: users.length,
    DISTRIBUTOR: users.filter(u => u.role === 'DISTRIBUTOR').length,
    RESELLER: users.filter(u => u.role === 'RESELLER').length,
    END_USER: users.filter(u => u.role === 'END_USER').length,
  };

  async function handleSubmit() {
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (needsOrg && !form.org_name) {
      toast.error('Organization name is required');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No admin session found');

      const payload: Record<string, any> = { ...form };
      // Map org_type to role value for RESELLER/DISTRIBUTOR
      if (needsOrg) payload.org_type = form.role;

      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create user');

      toast.success(`${ROLE_META[form.role].label} created successfully!`);
      setPanelOpen(false);
      setForm({ ...emptyForm });
      setOrgStep(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function openPanel() {
    setForm({ ...emptyForm });
    setOrgStep(false);
    setPanelOpen(true);
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage resellers, distributors and end users</p>
        </div>
        <button onClick={openPanel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}>
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['ALL', 'DISTRIBUTOR', 'RESELLER', 'END_USER'] as const).map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              roleFilter === r
                ? 'bg-[#4648D4] text-white shadow'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4648D4]'
            }`}>
            {r === 'ALL' ? 'All Users' : ROLE_META[r].label}
            <span className="ml-2 text-xs opacity-70">({counts[r]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, organization…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4648D4]" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-4 font-semibold text-gray-600">User</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Role</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Organization</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Phone</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading users…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map(u => {
                const meta = ROLE_META[u.role as UserRole] || ROLE_META.END_USER;
                return (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: meta.color }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ backgroundColor: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.organizations ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-700">{u.organizations.name}</span>
                          {u.organizations.verified && (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.phone_number || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===== SLIDE-OVER PANEL ===== */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />

          {/* Panel */}
          <div className="relative ml-auto w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {!orgStep ? 'Step 1 of 2 — User details' : 'Step 2 of 2 — Organization details'}
                </p>
              </div>
              <button onClick={() => setPanelOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="flex px-8 py-4 gap-2 border-b border-gray-50">
              {[
                { label: 'User Details', icon: User },
                ...(needsOrg ? [{ label: 'Organization', icon: Building2 }] : []),
              ].map((step, i) => {
                const active = needsOrg ? (orgStep ? i === 1 : i === 0) : i === 0;
                const done = needsOrg && orgStep && i === 0;
                return (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <div className="w-8 h-px bg-gray-200 mx-1" />}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      done ? 'bg-green-100 text-green-700' : active ? 'bg-[#4648D4] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {done ? <CheckCircle className="h-3.5 w-3.5" /> : <step.icon className="h-3.5 w-3.5" />}
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">

              {/* ─── STEP 1: User Details ─── */}
              {!orgStep && (
                <div className="space-y-5">
                  {/* Role selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">User Type *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['DISTRIBUTOR', 'RESELLER', 'END_USER'] as UserRole[]).map(r => {
                        const meta = ROLE_META[r];
                        const Icon = r === 'DISTRIBUTOR' ? Building2 : r === 'RESELLER' ? Store : User;
                        return (
                          <button key={r} type="button" onClick={() => set('role', r)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                              form.role === r ? 'border-[#4648D4] bg-[#F2F3FF]' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                            <Icon className="h-6 w-6" style={{ color: form.role === r ? meta.color : '#94a3b8' }} />
                            <span className="text-xs font-semibold" style={{ color: form.role === r ? meta.color : '#64748b' }}>
                              {meta.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input value={form.name} onChange={e => set('name', e.target.value)}
                          placeholder="John Smith"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                          placeholder="john@company.com"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input value={form.phone_number} onChange={e => set('phone_number', e.target.value)}
                          placeholder="+1-415-555-0100"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                      </div>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      This user will be created with email already confirmed — no verification email will be sent.
                      The account will be immediately active.
                    </p>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: Organization Details ─── */}
              {orgStep && needsOrg && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization Name *</label>
                      <input value={form.org_name} onChange={e => set('org_name', e.target.value)}
                        placeholder="TechDist Global"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Legal Business Name</label>
                      <input value={form.org_legal_name} onChange={e => set('org_legal_name', e.target.value)}
                        placeholder="TechDist Global Inc."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry</label>
                      <select value={form.org_industry} onChange={e => set('org_industry', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4] bg-white">
                        <option value="">Select Industry</option>
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Size</label>
                      <select value={form.org_company_size} onChange={e => set('org_company_size', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4] bg-white">
                        <option value="">Select Size</option>
                        {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year Established</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="number" value={form.org_year_established} onChange={e => set('org_year_established', parseInt(e.target.value))}
                          min={1900} max={new Date().getFullYear()}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input value={form.org_website} onChange={e => set('org_website', e.target.value)}
                          placeholder="https://company.com"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                      <textarea value={form.org_description} onChange={e => set('org_description', e.target.value)}
                        placeholder="Brief description of the organization…"
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4] resize-none" />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                      <select value={form.org_country} onChange={e => set('org_country', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4] bg-white">
                        <option value="">Select Country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input value={form.org_city} onChange={e => set('org_city', e.target.value)}
                          placeholder="Dubai"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">State / Province</label>
                      <input value={form.org_state} onChange={e => set('org_state', e.target.value)}
                        placeholder="Dubai"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Postal Code</label>
                      <input value={form.org_postal_code} onChange={e => set('org_postal_code', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                    </div>

                    {/* Contact */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Org Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input value={form.org_phone} onChange={e => set('org_phone', e.target.value)}
                          placeholder="+971-4-xxx-xxxx"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Support Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="email" value={form.org_support_email} onChange={e => set('org_support_email', e.target.value)}
                          placeholder="support@company.com"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sales Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="email" value={form.org_sales_email} onChange={e => set('org_sales_email', e.target.value)}
                          placeholder="sales@company.com"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4648D4]" />
                      </div>
                    </div>

                    {/* Verified toggle */}
                    <div className="col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div onClick={() => set('org_verified', !form.org_verified)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${form.org_verified ? 'bg-[#4648D4]' : 'bg-gray-300'}`}>
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.org_verified ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Mark Organization as Verified</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-14">Verified organizations appear with a checkmark across the platform</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel footer */}
            <div className="border-t border-gray-100 px-8 py-5 flex items-center justify-between bg-gray-50">
              <button onClick={() => { if (orgStep) setOrgStep(false); else setPanelOpen(false); }}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white transition-colors">
                {orgStep ? '← Back' : 'Cancel'}
              </button>

              {needsOrg && !orgStep ? (
                <button onClick={() => {
                    if (!form.name || !form.email || !form.password) {
                      toast.error('Fill in all required fields first');
                      return;
                    }
                    setOrgStep(true);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}>
                  Next: Organization →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {submitting ? 'Creating…' : 'Create User'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
