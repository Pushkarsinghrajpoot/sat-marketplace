'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText, Calendar, DollarSign, User, Mail, Phone, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { getQuotes } from '@/lib/data-helpers';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/lib/simple-auth';

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;
  const { user } = useSimpleAuth();
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const quotes = await getQuotes({});
        const foundQuote = quotes.find(q => q.id === quoteId);
        if (foundQuote) {
          setQuote(foundQuote);
          // Fetch activities related to this quote
          await fetchQuoteActivities(foundQuote.deal_id);
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

  const fetchQuoteActivities = async (dealId: string) => {
    try {
      const { data, error } = await supabase
        .from('deal_activities')
        .select(`
          *,
          users!deal_activities_reseller_id_fkey(*)
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleAcceptQuote = async () => {
    if (!quote?.id || !user?.id) return;

    setAccepting(true);
    try {
      // Update quote status to WON
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'WON' })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

      // Update deal with won_quote_id
      const { error: dealError } = await supabase
        .from('deals')
        .update({ 
          won_quote_id: quote.id,
          status: 'WON'
        })
        .eq('id', quote.deal_id);

      if (dealError) throw dealError;

      // Reject other quotes for this deal
      await supabase
        .from('quotes')
        .update({ status: 'LOST' })
        .eq('deal_id', quote.deal_id)
        .neq('id', quote.id);

      // Send notification to distributor
      if (quote.distributor_id) {
        await supabase.from('notifications').insert({
          user_id: quote.distributor_id,
          notification_type: 'QUOTE_ACCEPTED',
          title: 'Quote Accepted!',
          message: `Your quote for ${formatCurrency(quote.total || 0)} has been accepted!`,
          link: `/distributor/quotes/${quote.id}`,
        });
      }

      // Update local quote status
      setQuote((prev: any) => ({ ...prev, status: 'WON' }));
      
      toast.success('Quote accepted successfully! Deal marked as won.');
    } catch (error) {
      console.error('Error accepting quote:', error);
      toast.error('Failed to accept quote');
    } finally {
      setAccepting(false);
    }
  };

  const handleDownloadQuote = () => {
    // Generate a downloadable text quote
    const quoteText = `
QUOTE #${quote.id.slice(-8)}
Date: ${new Date(quote.created_at).toLocaleDateString()}
Status: ${quote.status.replace('_', ' ')}

DISTRIBUTOR:
${quote.distributor?.name || 'Unknown Distributor'}
${quote.distributor?.email || ''}

CUSTOMER:
${quote.deal?.customerName || 'Unknown Customer'}
${quote.deal?.customerCompany || ''}
${quote.deal?.customerEmail || ''}

DEAL:
${quote.deal?.opportunityName || 'N/A'}

ITEMS:
${quote.lineItems?.map((item: any) => 
  `${item.product_name} - Qty: ${item.quantity} x ${formatCurrency(item.unit_price)} = ${formatCurrency(item.total)}`
).join('\n') || 'No items'}

SUBTOTAL: ${formatCurrency(quote.subtotal || 0)}
TAX: ${formatCurrency(quote.tax || 0)}
SHIPPING: ${formatCurrency(quote.shipping || 0)}
DISCOUNT: ${formatCurrency(quote.discount || 0)}
TOTAL: ${formatCurrency(quote.total || 0)}

PAYMENT TERMS: ${quote.payment_terms || 'N/A'}
DELIVERY: ${quote.delivery_timeline || 'N/A'}
VALID UNTIL: ${quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}

NOTES:
${quote.notes || 'No additional notes'}
    `.trim();

    // Create downloadable file
    const blob = new Blob([quoteText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quote-${quote.id.slice(-8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Quote downloaded successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TO_SUBMIT': return 'warning';
      case 'SUBMITTED': return 'info';
      case 'UNDER_REVIEW': return 'default';
      case 'WON': return 'success';
      case 'LOST': return 'danger';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'MEETING': return <Calendar className="h-4 w-4" />;
      case 'DEMO': return <FileText className="h-4 w-4" />;
      case 'BOQ_REVISION': return <MessageSquare className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading quote details...</p>
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
          Back to Quotes
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Quote Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 mb-2">
                    Quote #{quote.id.slice(-8)}
                    <Badge variant={getStatusColor(quote.status)}>
                      {quote.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <p className="text-gray-600">
                    Deal: {quote.deal?.opportunityName || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(quote.total || 0)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted {formatRelativeTime(quote.created_at)}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Quote Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Distributor Info */}
              <div>
                <h3 className="font-semibold mb-3">Distributor Information</h3>
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium">{quote.distributor?.name || 'Unknown'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium">{quote.distributor?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{quote.deal?.customerName || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium">{quote.deal?.customerCompany || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="font-semibold mb-3">Quote Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium">Product</th>
                        <th className="p-3 text-right text-sm font-medium">Quantity</th>
                        <th className="p-3 text-right text-sm font-medium">Unit Price</th>
                        <th className="p-3 text-right text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.lineItems?.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b">
                          <td className="p-3 text-sm">{item.product_name}</td>
                          <td className="p-3 text-sm text-right">{item.quantity}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="p-3 text-sm text-right font-medium">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 bg-gray-50">
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-bold">Subtotal:</td>
                        <td className="p-3 text-right font-bold">{formatCurrency(quote.subtotal || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-3 text-right">Tax:</td>
                        <td className="p-3 text-right">{formatCurrency(quote.tax || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-3 text-right">Shipping:</td>
                        <td className="p-3 text-right">{formatCurrency(quote.shipping || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-3 text-right text-green-600">Discount:</td>
                        <td className="p-3 text-right text-green-600">-{formatCurrency(quote.discount || 0)}</td>
                      </tr>
                      <tr className="border-t-2">
                        <td colSpan={3} className="p-3 text-right font-bold text-lg">Total:</td>
                        <td className="p-3 text-right font-bold text-lg">
                          {formatCurrency(quote.total || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <h3 className="font-semibold mb-3">Terms & Conditions</h3>
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Payment Terms</p>
                    <p className="font-medium">{quote.payment_terms || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Delivery Timeline</p>
                    <p className="font-medium">{quote.delivery_timeline || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Valid Until</p>
                    <p className="font-medium">
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Quote Type</p>
                    <p className="font-medium">{quote.quote_type || 'STANDARD'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {quote.notes && (
                <div>
                  <h3 className="font-semibold mb-3">Additional Notes</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm">{quote.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{activity.title || activity.activity_type}</h4>
                          <Badge variant="default">{activity.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.users?.name || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(activity.created_at)}
                          </span>
                          {activity.scheduled_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Scheduled: {new Date(activity.scheduled_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No activities recorded for this deal</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {/* Actions */}
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleDownloadQuote}>
                <Download className="h-4 w-4 mr-2" />
                Download Quote
              </Button>
              {quote.status === 'SUBMITTED' && (
                <Button 
                  className="w-full" 
                  onClick={handleAcceptQuote}
                  disabled={accepting}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {accepting ? 'Accepting...' : 'Accept Quote'}
                </Button>
              )}
              {quote.status === 'WON' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Quote Won!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    This quote has been accepted and the deal is marked as won.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Summary */}
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
                <Badge variant={getStatusColor(quote.status)}>{quote.status.replace('_', ' ')}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm">{quote.quote_type || 'STANDARD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="font-semibold">{formatCurrency(quote.total || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm">{formatRelativeTime(quote.created_at)}</span>
              </div>
              {quote.submitted_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="text-sm">{formatRelativeTime(quote.submitted_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Contact Distributor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Request Call
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
