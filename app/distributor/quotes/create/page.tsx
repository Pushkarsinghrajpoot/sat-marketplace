'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Send, FileText, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/lib/simple-auth';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { getQuotes, createQuote } from '@/lib/data-helpers';
import { sendNotification } from '@/lib/notification-client';

function CreateQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSimpleAuth();
  
  const dealId = searchParams.get('dealId');
  const boqId = searchParams.get('boqId');
  const queryId = searchParams.get('queryId');
  const conversationId = searchParams.get('conversation');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showUploadHint, setShowUploadHint] = useState(false);
  
  const [deal, setDeal] = useState<any>(null);
  const [query, setQuery] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [boq, setBoq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [quoteData, setQuoteData] = useState({
    validUntil: '',
    deliveryTimeline: '',
    paymentTerms: '',
    notes: '',
    subtotal: 0,
    taxPercent: 0,
    discountPercent: 0,
    shipping: 0,
  });
  
  const [lineItems, setLineItems] = useState<any[]>([
    { product_name: '', quantity: 1, unit_price: 0, total: 0, notes: '' }
  ]);

  useEffect(() => {
    fetchData();
  }, [dealId, boqId, queryId, conversationId]);

  const fetchData = async () => {
    if (!dealId && !queryId && !conversationId) {
      toast.error('Missing context: deal, query, or conversation ID required');
      router.back();
      return;
    }

    try {
      if (conversationId) {
        // Conversation-based quote: fetch chat conversation with product + customer
        const { data: convData, error: convError } = await supabase
          .from('chat_conversations')
          .select(`
            *,
            products (
              id,
              name,
              sku,
              price
            ),
            users:customer_id (
              id,
              name,
              email
            )
          `)
          .eq('id', conversationId)
          .single();

        if (convError) throw convError;
        setConversation(convData);

        // Pre-fill notes from conversation subject
        if (convData.subject) {
          setQuoteData(prev => ({ ...prev, notes: convData.subject }));
        }

        // Pre-fill a line item from the linked product if available
        if (convData.products) {
          const unitPrice = convData.products.price || 0;
          setLineItems([{
            product_name: convData.products.name,
            quantity: 1,
            unit_price: unitPrice,
            total: unitPrice,
            notes: '',
            sku: convData.products.sku || '',
          }]);
          setQuoteData(prev => ({ ...prev, subtotal: unitPrice }));
        }
      } else if (queryId) {
        // Query-based quote: fetch direct query details
        const { data: queryData, error: queryError } = await supabase
          .from('direct_queries')
          .select(`
            *,
            users:reseller_id (
              id,
              name,
              email
            )
          `)
          .eq('id', queryId)
          .single();

        if (queryError) throw queryError;
        setQuery(queryData);
      } else {
        // Deal-based quote: fetch deal details
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
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load information');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) { toast.error('File must have a header row and at least one data row'); setUploadingFile(false); return; }
        // Parse header to find column indices (case-insensitive)
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
        const nameIdx = headers.findIndex(h => h.includes('product') || h.includes('name') || h.includes('item'));
        const qtyIdx = headers.findIndex(h => h.includes('qty') || h.includes('quantity'));
        const priceIdx = headers.findIndex(h => h.includes('price') || h.includes('unit') || h.includes('rate'));
        const skuIdx = headers.findIndex(h => h.includes('sku') || h.includes('code'));
        if (nameIdx === -1) { toast.error('CSV must have a column for product name (e.g. "product_name")'); setUploadingFile(false); return; }
        const parsed = lines.slice(1).map(line => {
          const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          const qty = qtyIdx >= 0 ? parseInt(cols[qtyIdx]) || 1 : 1;
          const price = priceIdx >= 0 ? parseFloat(cols[priceIdx]) || 0 : 0;
          return { product_name: cols[nameIdx] || '', quantity: qty, unit_price: price, total: qty * price, notes: '', sku: skuIdx >= 0 ? cols[skuIdx] : '' };
        }).filter(item => item.product_name);
        if (parsed.length === 0) { toast.error('No valid rows found in file'); setUploadingFile(false); return; }
        setLineItems(parsed);
        calculateTotals(parsed);
        toast.success(`Imported ${parsed.length} line item${parsed.length !== 1 ? 's' : ''} from file!`);
        setShowUploadHint(false);
      } catch (err) {
        toast.error('Failed to parse file. Please use CSV format.');
      } finally {
        setUploadingFile(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const taxAmount = (quoteData.subtotal * quoteData.taxPercent) / 100;
  const discountAmount = (quoteData.subtotal * quoteData.discountPercent) / 100;

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
      const total = quoteData.subtotal + taxAmount + quoteData.shipping - discountAmount;
      const resellerId = conversationId
        ? (conversation?.customer_id)
        : queryId
        ? query?.reseller_id
        : deal?.reseller_id;
      const contextName = conversationId
        ? (conversation?.subject || conversation?.products?.name || 'Product Chat')
        : queryId
        ? query?.title
        : deal?.opportunity_name;

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          quote_type: boqId ? 'BIDDING' : 'NORMAL',
          deal_id: dealId || conversation?.deal_id || null,
          query_id: queryId || null,
          boq_id: boqId || null,
          distributor_id: user.organizationId,
          reseller_id: resellerId,
          subtotal: quoteData.subtotal,
          tax: taxAmount,
          shipping: quoteData.shipping,
          discount: discountAmount,
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
        subtotal: item.total || (item.quantity * item.unit_price),
        sku: item.sku,
      }));

      const { error: itemsError } = await supabase
        .from('quote_line_items')
        .insert(lineItemsData);

      if (itemsError) console.error('Line items error (non-critical):', itemsError);

      // If this is a query-based quote, link it back to the direct query
      if (queryId && quote.id) {
        await supabase
          .from('direct_queries')
          .update({ linked_quote_id: quote.id, status: 'ACCEPTED' })
          .eq('id', queryId);
      }

      // Notify reseller
      if (resellerId) {
        await sendNotification({
          userId: resellerId,
          notificationType: 'QUOTE_RECEIVED',
          title: 'New Quote Received',
          message: `You received a quote for ${formatCurrency(total)} for "${contextName}"`,
          link: queryId ? `/reseller/queries/${queryId}` : `/reseller/deals/${dealId}/quotes`,
          emailData: {
            dealName: contextName,
            amount: formatCurrency(total),
          },
        });
      }

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

  if (!deal && !query && !conversation) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 font-semibold">Context not found — deal, query, or conversation required</p>
            <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = quoteData.subtotal + taxAmount + quoteData.shipping - discountAmount;

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
            {deal
              ? `Deal: ${deal.opportunity_name} — ${deal.customer_company}`
              : query
              ? `Query: ${query.title}`
              : conversation
              ? `Chat: ${conversation.subject || conversation.products?.name || 'Product Conversation'}`
              : ''}
          </p>
          {boq && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600">Based on BOQ: {boq.file_name}</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Upload Quote File */}
          <Card className="border-dashed border-2 border-blue-200 bg-blue-50/40">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import from File
                  </h3>
                  <p className="text-xs text-blue-700 mt-1">Upload a CSV file to auto-fill line items. Columns: <strong>product_name, quantity, unit_price</strong> (and optionally <strong>sku</strong>)</p>
                </div>
                <button
                  onClick={() => {
                    const csv = 'product_name,sku,quantity,unit_price\nSample Product,SKU-001,10,500\nAnother Product,SKU-002,5,1200';
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'quote_template.csv';
                    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                  }}
                  className="text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Download Template
                </button>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="flex-1 border border-blue-300 bg-white rounded-lg px-4 py-2.5 flex items-center gap-3 hover:border-blue-500 transition-colors">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{uploadingFile ? 'Importing...' : 'Click to select CSV file (.csv)'}</span>
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
              </label>
            </CardContent>
          </Card>

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
                  <label className="block text-sm font-medium mb-2">Tax (%)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={quoteData.taxPercent}
                      onChange={(e) => setQuoteData({ ...quoteData, taxPercent: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      = {formatCurrency(taxAmount)}
                    </span>
                  </div>
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
                  <label className="block text-sm font-medium mb-2">Discount (%)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={quoteData.discountPercent}
                      onChange={(e) => setQuoteData({ ...quoteData, discountPercent: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      = {formatCurrency(discountAmount)}
                    </span>
                  </div>
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
