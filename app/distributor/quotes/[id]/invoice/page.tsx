'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText, Calendar, DollarSign, Mail } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { getQuotes } from '@/lib/data-helpers';
import { useAuth } from '@/lib/auth-context';

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;
  const { user } = useAuth();
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: 'Net 30 days',
    notes: '',
  });

  useEffect(() => {
    async function fetchQuote() {
      try {
        const quotes = await getQuotes({});
        const foundQuote = quotes.find(q => q.id === quoteId);
        if (foundQuote) {
          setQuote(foundQuote);
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

  const handleGenerateInvoice = async () => {
    if (!quote?.id) return;

    setGenerating(true);
    try {
      // Create invoice record (you might want to add an invoices table)
      const invoice = {
        ...invoiceData,
        quoteId: quote.id,
        distributorId: user?.organizationId,
        resellerId: quote.reseller_id,
        total: quote.total,
        subtotal: quote.subtotal,
        tax: quote.tax,
        shipping: quote.shipping,
        discount: quote.discount,
        status: 'ISSUED',
        createdAt: new Date().toISOString(),
      };

      // For now, just generate a downloadable text invoice
      const invoiceText = `
INVOICE #${invoiceData.invoiceNumber}
Date: ${invoiceData.issueDate}
Due Date: ${invoiceData.dueDate}

BILL TO:
${quote.deal?.customerName || 'Customer'}
${quote.deal?.customerCompany || ''}
${quote.deal?.customerEmail || ''}

FROM:
Your Company

QUOTE DETAILS:
Quote ID: ${quote.id}
Deal: ${quote.deal?.opportunityName || 'N/A'}

ITEMS:
${quote.lineItems?.map((item: any) => 
  `${item.product_name} - Qty: ${item.quantity} x ${formatCurrency(item.unit_price)} = ${formatCurrency(item.total)}`
).join('\n') || 'No items'}

SUBTOTAL: ${formatCurrency(quote.subtotal || 0)}
TAX: ${formatCurrency(quote.tax || 0)}
SHIPPING: ${formatCurrency(quote.shipping || 0)}
DISCOUNT: ${formatCurrency(quote.discount || 0)}
TOTAL: ${formatCurrency(quote.total || 0)}

PAYMENT TERMS: ${invoiceData.paymentTerms}
${invoiceData.notes ? `NOTES: ${invoiceData.notes}` : ''}
      `.trim();

      // Create downloadable file
      const blob = new Blob([invoiceText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceData.invoiceNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice generated and downloaded successfully!');
      
      // Update quote status to indicate invoice was generated
      // await updateQuote(quote.id, { status: 'INVOICED' });
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!quote?.reseller_id) return;

    try {
      // Create notification for reseller
      const notification = {
        user_id: quote.reseller_id,
        notification_type: 'INVOICE_ISSUED',
        title: 'Invoice Generated',
        message: `Invoice #${invoiceData.invoiceNumber} has been generated for your quote`,
        link: `/reseller/deals/${quote.deal_id}/quotes`,
      };

      // In a real implementation, you would send this to your notifications table
      console.log('Invoice notification:', notification);
      
      toast.success('Invoice notification sent to reseller!');
    } catch (error) {
      console.error('Error sending invoice notification:', error);
      toast.error('Failed to send invoice notification');
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 font-semibold">Quote not found</p>
            <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quote
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Invoice Number</label>
                  <Input
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Issue Date</label>
                  <Input
                    type="date"
                    value={invoiceData.issueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Terms</label>
                  <Input
                    value={invoiceData.paymentTerms}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  placeholder="Additional invoice notes..."
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Invoice Preview</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Invoice:</strong> {invoiceData.invoiceNumber}</p>
                  <p><strong>Date:</strong> {invoiceData.issueDate}</p>
                  <p><strong>Due:</strong> {invoiceData.dueDate}</p>
                  <p><strong>Customer:</strong> {quote.deal?.customerName || 'N/A'}</p>
                  <p><strong>Total Amount:</strong> {formatCurrency(quote.total || 0)}</p>
                </div>
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
              <Button 
                className="w-full" 
                onClick={handleGenerateInvoice}
                disabled={generating}
              >
                <Download className="h-4 w-4 mr-2" />
                {generating ? 'Generating...' : 'Download Invoice'}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSendInvoice}>
                <Mail className="h-4 w-4 mr-2" />
                Send to Customer
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quote ID:</span>
                <span className="text-sm font-medium">{quote.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant="default">{quote.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="font-semibold">{formatCurrency(quote.total || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm">{new Date(quote.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
