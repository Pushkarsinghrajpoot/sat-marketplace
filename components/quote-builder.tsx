'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface QuoteBuilderProps {
  inquiryId?: string;
  productId?: string;
  resellerId?: string;
  distributorId: string;
  onComplete?: () => void;
}

export function QuoteBuilder({ inquiryId, productId, resellerId, distributorId, onComplete }: QuoteBuilderProps) {
  const router = useRouter();
  const [lineItems, setLineItems] = useState([
    { productName: '', sku: '', quantity: 1, unitPrice: 0, discount: 0 }
  ]);
  const [paymentTerms, setPaymentTerms] = useState({
    netDays: 30,
    method: 'Bank Transfer',
    earlyDiscount: 0
  });
  const [deliveryTerms, setDeliveryTerms] = useState({
    estimatedDelivery: '',
    method: 'Standard Shipping',
    location: '',
    incoterms: 'FOB'
  });
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [loading, setLoading] = useState(false);

  const addLineItem = () => {
    setLineItems([...lineItems, { productName: '', sku: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateSubtotal = (item: any) => {
    return item.quantity * item.unitPrice;
  };

  const calculateTotal = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + calculateSubtotal(item), 0);
    const discount = lineItems.reduce((sum, item) => sum + (item.discount || 0), 0);
    return subtotal - discount;
  };

  const handleSubmit = async () => {
    if (lineItems.length === 0 || lineItems.some(item => !item.productName || item.unitPrice <= 0)) {
      toast.error('Please fill all line items with valid data');
      return;
    }

    setLoading(true);
    try {
      const subtotal = lineItems.reduce((sum, item) => sum + calculateSubtotal(item), 0);
      const discount = lineItems.reduce((sum, item) => sum + (item.discount || 0), 0);
      const total = subtotal - discount;

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          quote_type: 'DIRECT',
          distributor_id: distributorId,
          reseller_id: resellerId,
          subtotal,
          discount,
          tax: 0,
          shipping: 0,
          total,
          status: 'TO_SUBMIT',
          payment_terms_net_days: paymentTerms.netDays,
          payment_terms_method: paymentTerms.method,
          payment_terms_early_discount: paymentTerms.earlyDiscount,
          delivery_terms_estimated_delivery: deliveryTerms.estimatedDelivery || null,
          delivery_terms_method: deliveryTerms.method,
          delivery_terms_location: deliveryTerms.location,
          delivery_terms_incoterms: deliveryTerms.incoterms,
          valid_until: validUntil || null,
          notes
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create line items
      const lineItemsData = lineItems.map(item => ({
        quote_id: quote.id,
        product_name: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount || 0,
        subtotal: calculateSubtotal(item)
      }));

      const { error: lineItemsError } = await supabase
        .from('quote_line_items')
        .insert(lineItemsData);

      if (lineItemsError) throw lineItemsError;

      // Update inquiry status if provided
      if (inquiryId) {
        await supabase
          .from('product_inquiries')
          .update({ status: 'RESPONDED' })
          .eq('id', inquiryId);
      }

      toast.success('Quote created successfully!');
      onComplete?.();
      router.push(`/distributor/quotes/${quote.id}`);
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Failed to create quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quote Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 p-4 border rounded-lg">
                <div className="col-span-3">
                  <label className="block text-sm font-medium mb-1">Product Name *</label>
                  <Input
                    value={item.productName}
                    onChange={(e) => updateLineItem(index, 'productName', e.target.value)}
                    placeholder="Product name"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <Input
                    value={item.sku}
                    onChange={(e) => updateLineItem(index, 'sku', e.target.value)}
                    placeholder="SKU"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Unit Price *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Discount</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount}
                    onChange={(e) => updateLineItem(index, 'discount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="col-span-12 text-sm text-gray-600">
                  Subtotal: ${calculateSubtotal(item).toFixed(2)}
                </div>
              </div>
            ))}
            
            <Button variant="outline" onClick={addLineItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Line Item
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Net Days</label>
              <Input
                type="number"
                value={paymentTerms.netDays}
                onChange={(e) => setPaymentTerms({ ...paymentTerms, netDays: parseInt(e.target.value) || 30 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <Input
                value={paymentTerms.method}
                onChange={(e) => setPaymentTerms({ ...paymentTerms, method: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Early Payment Discount (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={paymentTerms.earlyDiscount}
                onChange={(e) => setPaymentTerms({ ...paymentTerms, earlyDiscount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Delivery</label>
              <Input
                type="date"
                value={deliveryTerms.estimatedDelivery}
                onChange={(e) => setDeliveryTerms({ ...deliveryTerms, estimatedDelivery: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Method</label>
              <Input
                value={deliveryTerms.method}
                onChange={(e) => setDeliveryTerms({ ...deliveryTerms, method: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Location</label>
              <Input
                value={deliveryTerms.location}
                onChange={(e) => setDeliveryTerms({ ...deliveryTerms, location: e.target.value })}
                placeholder="City, State, Country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Incoterms</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={deliveryTerms.incoterms}
                onChange={(e) => setDeliveryTerms({ ...deliveryTerms, incoterms: e.target.value })}
              >
                <option value="FOB">FOB - Free On Board</option>
                <option value="CIF">CIF - Cost, Insurance & Freight</option>
                <option value="EXW">EXW - Ex Works</option>
                <option value="DDP">DDP - Delivered Duty Paid</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Valid Until</label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes / Terms & Conditions</label>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special terms, conditions, or notes..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold">Total: ${calculateTotal().toFixed(2)}</h3>
              <p className="text-sm text-gray-600">
                Subtotal: ${lineItems.reduce((sum, item) => sum + calculateSubtotal(item), 0).toFixed(2)} | 
                Discount: ${lineItems.reduce((sum, item) => sum + (item.discount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Quote'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
