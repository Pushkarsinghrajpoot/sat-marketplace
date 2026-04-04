 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, CheckCircle, User, Building2, Phone, Mail, Package, DollarSign } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { createProductInquiry } from '@/lib/product-helpers';

interface RequestQuoteModalProps {
  product: {
    id: string;
    name: string;
    price: number;
    organizationId: string;
  };
  onClose: () => void;
}

export function RequestQuoteModal({ product, onClose }: RequestQuoteModalProps) {
  const router = useRouter();
  const { user, organization } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadRef, setLeadRef] = useState('');

  // ── Buyer form state (guest / END_USER) ──────────────────
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCompany, setBuyerCompany] = useState('');
  const [requirement, setRequirement] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [budget, setBudget] = useState('');

  // ── Reseller form state (reseller → distributor inquiry) ─
  const [resellerMessage, setResellerMessage] = useState('');
  const [resellerQty, setResellerQty] = useState(1);

  // ─────────────────────────────────────────────────────────
  // Determine who's asking
  // ─────────────────────────────────────────────────────────
  const isReseller = user?.role === 'RESELLER';
  const isEndUser = user?.role === 'END_USER';
  const isGuest = !user;
  const isBuyer = isGuest || isEndUser;

  // ── SUCCESS screen ────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#161B2B] mb-2">Request Received!</h2>
          <p className="text-[#76767D] mb-1">A reseller will contact you within 24–48 hours.</p>
          {leadRef && <p className="text-xs text-[#A0A0A8] mb-6">Reference: <span className="font-mono font-bold">{leadRef.slice(0, 8).toUpperCase()}</span></p>}
          <div className="space-y-3">
            {!user && (
              <Button onClick={() => { onClose(); router.push('/auth/register'); }} className="w-full" style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}>
                Create Account to Track Your Request
              </Button>
            )}
            <Button onClick={onClose} variant="outline" className="w-full">Close</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── BUYER flow (guest or END_USER) ───────────────────────
  const handleBuyerSubmit = async () => {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          buyer_name: buyerName.trim(),
          buyer_email: buyerEmail.trim(),
          buyer_phone: buyerPhone.trim() || undefined,
          buyer_company: buyerCompany.trim() || undefined,
          requirement: requirement.trim() || undefined,
          bulk_quantity: quantity,
          budget_range: budget.trim() || undefined,
          source: 'MARKETPLACE',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit');

      setLeadRef(json.lead?.id || '');
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  // ── RESELLER flow (reseller → distributor product inquiry) ─
  const handleResellerSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const inquiry = await createProductInquiry({
        productId: product.id,
        userId: user.id,
        inquiryType: 'PRICING',
        subject: `Quote Request for ${product.name}`,
        question: `Requesting quote for ${resellerQty} units. ${resellerMessage || 'No additional message.'}`,
      });
      if (!inquiry) throw new Error('Failed to create inquiry');
      toast.success('Quote request sent to distributor!');
      router.push(`/reseller/inquiries/${inquiry.id}`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
          <div>
            <h2 className="text-xl font-bold text-[#161B2B]">Request a Quote</h2>
            <p className="text-[13px] text-[#76767D] mt-0.5">Get a custom price from a verified reseller</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F4F4F5] flex items-center justify-center text-[#76767D] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Product summary */}
        <div className="mx-6 mt-5 p-4 rounded-xl bg-[#F2F3FF] flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-[#E4E4E7] flex-shrink-0">
            <Package className="h-5 w-5 text-[#4648D4]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#161B2B] truncate">{product.name}</p>
            <p className="text-[12px] text-[#76767D]">Base price: ${product.price.toLocaleString()} / unit</p>
          </div>
        </div>

        {/* ── BUYER FORM (guest + END_USER) ── */}
        {isBuyer && (
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-semibold text-[#161B2B] mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Full Name *
                </label>
                <Input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Your name" className="h-10" />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-[#161B2B] mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email *
                </label>
                <Input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="you@company.com" className="h-10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-semibold text-[#161B2B] mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </label>
                <Input value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="+1 555 000 0000" className="h-10" />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-[#161B2B] mb-1.5 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Company
                </label>
                <Input value={buyerCompany} onChange={e => setBuyerCompany(e.target.value)} placeholder="Company name" className="h-10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-semibold text-[#161B2B] mb-1.5">Quantity</label>
                <Input type="number" min={1} value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="h-10" />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-[#161B2B] mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Budget Range
                </label>
                <Input value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. $5,000 – $10,000" className="h-10" />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-semibold text-[#161B2B] mb-1.5 block">Requirement / Notes</label>
              <Textarea value={requirement} onChange={e => setRequirement(e.target.value)} rows={3}
                placeholder="Describe your use case, project requirements, delivery timeline…" className="resize-none" />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[12px] text-blue-800">
              A verified reseller will review your request and reach out within <strong>24–48 hours</strong>.
            </div>

            <div className="flex gap-3 pt-1">
              <Button onClick={handleBuyerSubmit} disabled={loading} className="flex-1 h-11 font-semibold"
                style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending…' : 'Send Quote Request'}
              </Button>
              <Button onClick={onClose} variant="outline" disabled={loading} className="h-11 px-5">Cancel</Button>
            </div>
          </div>
        )}

        {/* ── RESELLER FORM (reseller → distributor) ── */}
        {isReseller && (
          <div className="px-6 py-5 space-y-4">
            <div className="bg-[#FFFBEB] border border-amber-200 rounded-xl p-3 text-[12px] text-amber-800">
              As a reseller, this request goes to the distributor for a trade quote.
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[#161B2B] mb-1.5 block">Quantity *</label>
              <Input type="number" min={1} value={resellerQty} onChange={e => setResellerQty(Math.max(1, parseInt(e.target.value) || 1))} className="h-10" />
              <p className="text-xs text-[#76767D] mt-1">Est. total: ${(product.price * resellerQty).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[#161B2B] mb-1.5 block">Message</label>
              <Textarea value={resellerMessage} onChange={e => setResellerMessage(e.target.value)} rows={4}
                placeholder="Special requirements, delivery timeline, project notes…" className="resize-none" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleResellerSubmit} disabled={loading} className="flex-1 h-11 font-semibold"
                style={{ background: 'linear-gradient(135deg,#4648D4,#6063EE)' }}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending…' : 'Request Trade Quote'}
              </Button>
              <Button onClick={onClose} variant="outline" disabled={loading} className="h-11 px-5">Cancel</Button>
            </div>
          </div>
        )}

        {/* DISTRIBUTOR / ADMIN — not a buyer role */}
        {!isBuyer && !isReseller && (
          <div className="px-6 py-8 text-center">
            <p className="text-[#76767D] text-sm">Quote requests are for buyers and resellers only.</p>
            <Button onClick={onClose} variant="outline" className="mt-4">Close</Button>
          </div>
        )}
      </div>
    </div>
  );
}
