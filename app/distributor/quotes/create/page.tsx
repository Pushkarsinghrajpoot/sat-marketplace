'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Send, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';

function CreateQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const dealId = searchParams.get('dealId');
  const boqId = searchParams.get('boqId');
  
  const [deal, setDeal] = useState<any>(null);
  const [boq, setBoq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [quoteData, setQuoteData] = useState({
    validUntil: '',
    deliveryTimeline: '',
    paymentTerms: '',
    notes: '',
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
  });
  
  const [lineItems, setLineItems] = useState<any[]>([
    { product_name: '', quantity: 1, unit_price: 0, total: 0, notes: '' }
  ]);

  useEffect(() => {
    fetchData();
  }, [dealId, boqId]);

  const fetchData = async () => {
    if (!dealId) {
      toast.error('Deal ID is required');
      router.back();
      return;
    }

    try {
      // Fetch deal details
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select(`
          *,
          users:reseller_id (
            id,
            name,
            email
          )
        `)
        .eq('id', dealId)
        .single();

      if (dealError) throw dealError;
      setDeal(dealData);

      // Fetch BOQ if provided
      if (boqId) {
        const { data: boqData, error: boqError } = await supabase
          .from('boqs')
          .select(`
            *,
            boq_items(*)
          `)
          .eq('id', boqId)
          .single();

        if (!boqError && boqData) {
          setBoq(boqData);
          
          // Pre-fill line items from BOQ items
          if (boqData.boq_items && boqData.boq_items.length > 0) {
            setLineItems(boqData.boq_items.map((item: any) => ({
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: 0,
              total: 0,
              notes: item.specifications || '',
              sku: item.sku,
            })));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load deal information');
    } finally {
      setLoading(false);
    }
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate total for this line item
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = updated[index].quantity * updated[index].unit_price;
    }
    
    setLineItems(updated);
    calculateTotals(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { product_name: '', quantity: 1, unit_price: 0, total: 0, notes: '' }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) {
      toast.error('Quote must have at least one line item');
      return;
    }
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);
    calculateTotals(updated);
  };

  const calculateTotals = (items: any[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    setQuoteData(prev => ({ ...prev, subtotal }));
  };

  const handleSubmit = async () => {
    if (!user?.organizationId) {
      toast.error('Please login as distributor');
      return;
    }

    if (lineItems.some(item => !item.product_name || item.unit_price <= 0)) {
      toast.error('Please fill in all line items with valid prices');
      return;
    }

    if (!quoteData.validUntil) {
      toast.error('Please set quote validity date');
      return;
    }

    setSubmitting(true);

    try {
      const total = quoteData.subtotal + quoteData.tax + quoteData.shipping - quoteData.discount;

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          deal_id: dealId,
          boq_id: boqId || null,
          distributor_id: user.organizationId,
          reseller_id: deal?.reseller_id,
          subtotal: quoteData.subtotal,
          tax: quoteData.tax,
          shipping: quoteData.shipping,
          discount: quoteData.discount,
          total: total,
          valid_until: quoteData.validUntil,
          delivery_timeline: quoteData.deliveryTimeline,
          payment_terms: quoteData.paymentTerms,
          notes: quoteData.notes,
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote line items
      const lineItemsData = lineItems.map(item => ({
        quote_id: quote.id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        notes: item.notes,
        sku: item.sku,
      }));

      const { error: itemsError } = await supabase
        .from('quote_line_items')
        .insert(lineItemsData);

      if (itemsError) {
        console.error('Line items error:', itemsError);
        // Non-critical, continue
      }

      // Send notification to reseller
      await supabase.from('notifications').insert({
        user_id: deal?.reseller_id,
        notification_type: 'QUOTE_RECEIVED',
        title: 'New Quote Received',
        message: `You received a quote for ${formatCurrency(total)} for ${deal?.opportunity_name}`,
        link: `/reseller/deals/${dealId}/quotes`,
      });

      toast.success('Quote submitted successfully!');
      router.push('/distributor/quotes');
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error('Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 font-semibold">Deal not found</p>
            <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = quoteData.subtotal + quoteData.tax + quoteData.shipping - quoteData.discount;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Quote</h1>
          <p className="text-gray-600">
            Deal: {deal.opportunity_name} - {deal.customer_company}
          </p>
          {boq && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600">Based on BOQ: {boq.file_name}</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-4">
                    <label className="block text-xs font-medium mb-1">Product/Service</label>
                    <Input
                      value={item.product_name}
                      onChange={(e) => handleLineItemChange(index, 'product_name', e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Quantity</label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Unit Price</label>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Total</label>
                    <Input
                      value={formatCurrency(item.total)}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.notes && (
                    <div className="col-span-12">
                      <p className="text-xs text-gray-600">Notes: {item.notes}</p>
                    </div>
                  )}
                </div>
              ))}
              
              <Button variant="outline" onClick={addLineItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Line Item
              </Button>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quote Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Valid Until *</label>
                  <Input
                    type="date"
                    value={quoteData.validUntil}
                    onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Timeline</label>
                  <Input
                    value={quoteData.deliveryTimeline}
                    onChange={(e) => setQuoteData({ ...quoteData, deliveryTimeline: e.target.value })}
                    placeholder="e.g., 2-3 weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Terms</label>
                  <Input
                    value={quoteData.paymentTerms}
                    onChange={(e) => setQuoteData({ ...quoteData, paymentTerms: e.target.value })}
                    placeholder="e.g., Net 30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes</label>
                  <Textarea
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                    rows={4}
                    placeholder="Any additional terms or conditions..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subtotal</label>
                  <Input
                    value={formatCurrency(quoteData.subtotal)}
                    disabled
                    className="bg-gray-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tax</label>
                  <Input
                    type="number"
                    value={quoteData.tax}
                    onChange={(e) => setQuoteData({ ...quoteData, tax: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Shipping</label>
                  <Input
                    type="number"
                    value={quoteData.shipping}
                    onChange={(e) => setQuoteData({ ...quoteData, shipping: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount</label>
                  <Input
                    type="number"
                    value={quoteData.discount}
                    onChange={(e) => setQuoteData({ ...quoteData, discount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium mb-2">Total</label>
                  <Input
                    value={formatCurrency(total)}
                    disabled
                    className="bg-blue-50 font-bold text-xl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting Quote...' : 'Submit Quote'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CreateQuotePage() {
  return (
    <Suspense fallback={
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <CreateQuoteContent />
    </Suspense>
  );
}
