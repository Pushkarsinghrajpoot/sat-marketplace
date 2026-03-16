'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Send, FileText, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { getQuotes, updateQuote } from '@/lib/data-helpers';

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuote() {
      try {
        // Fetch quote with line items directly
        const { data: quoteData, error: quoteError } = await supabase
          .from('quotes')
          .select(`
            *,
            deals!inner(*),
            organizations!quotes_distributor_id_fkey(*),
            users!quotes_reseller_id_fkey(*),
            quote_line_items(*)
          `)
          .eq('id', quoteId)
          .single();

        if (quoteError) throw quoteError;
        
        if (quoteData) {
          // Map the data to match expected format
          const mappedQuote = {
            ...quoteData,
            deal: quoteData.deals,
            distributor: quoteData.organizations,
            resellerUser: quoteData.users,
            lineItems: quoteData.quote_line_items || [],
            // Additional fields for UI
            quote_type: quoteData.quote_type,
            distributor_id: quoteData.distributor_id,
            reseller_id: quoteData.reseller_id,
            payment_terms: quoteData.payment_terms_method || 'Standard',
            delivery_timeline: quoteData.delivery_terms_estimated_delivery || 'Standard',
            notes: quoteData.notes || '',
          };
          
          setQuote(mappedQuote);
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
      } finally {
        setLoading(false);
      }
    }

    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  const handleSubmit = async () => {
    if (!quote?.id) return;

    setSubmitting(true);
    try {
      await updateQuote(quote.id, { status: 'SUBMITTED' });
      toast.success('Quote submitted successfully!');
      router.push('/distributor/quotes');
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error('Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateQuote = async () => {
    setSubmitting(true);
    try {
      await updateQuote(quote.id, { 
        status: 'UNDER_REVIEW',
        updated_at: new Date().toISOString()
      });
      toast.success('Quote updated successfully!');
      router.push('/distributor/quotes');
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvoice = () => {
    router.push(`/distributor/quotes/${quote.id}/invoice`);
  };

  const handleScheduleFollowUp = () => {
    router.push(`/distributor/quotes/${quote.id}/followup`);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Quote not found</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Quote Details</h1>
            <p className="text-gray-600">Review and manage quote</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleGenerateInvoice}>
              <Download className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || quote.status === 'SUBMITTED'}>
              <Send className="h-4 w-4 mr-2" />
              {quote.status === 'SUBMITTED' ? 'Submitted' : submitting ? 'Submitting...' : 'Submit Quote'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quote Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quote Number</label>
                    <Input value={quote.id} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Badge variant={quote.status === 'SUBMITTED' ? 'success' : 'warning'}>
                      {quote.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Deal ID</label>
                  <Input value={quote.dealId || 'N/A'} disabled />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Amount</label>
                    <Input 
                      value={formatCurrency(quote.total || 0)} 
                      disabled 
                      className="font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Valid Until</label>
                    <Input value={quote.validUntil || 'N/A'} type="date" disabled />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <Textarea 
                    value={quote.notes || 'No notes'} 
                    rows={4}
                    disabled 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Item</th>
                        <th className="text-right p-3 text-sm font-medium">Qty</th>
                        <th className="text-right p-3 text-sm font-medium">Unit Price</th>
                        <th className="text-right p-3 text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.lineItems && quote.lineItems.length > 0 ? (
                        quote.lineItems.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="p-3 text-sm">{item.product_name}</td>
                            <td className="p-3 text-sm text-right">{item.quantity}</td>
                            <td className="p-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="p-3 text-sm text-right font-medium">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500">
                            No line items found for this quote
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="border-t-2">
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-bold">Total:</td>
                        <td className="p-3 text-right font-bold text-lg">
                          {formatCurrency(quote.total || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={handleUpdateQuote} disabled={submitting}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  {submitting ? 'Updating...' : 'Update Quote'}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleGenerateInvoice}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Invoice
                </Button>
                <Button variant="outline" className="w-full" onClick={handleScheduleFollowUp}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(quote.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">{formatCurrency(quote.tax || 0)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(quote.total || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
