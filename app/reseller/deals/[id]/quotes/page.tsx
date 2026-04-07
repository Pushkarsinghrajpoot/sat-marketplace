'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Eye, FileText, CheckCircle } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { getQuotes } from '@/lib/data-helpers';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSimpleAuth } from '@/lib/simple-auth';
import { sendBulkNotification } from '@/lib/notification-client';

export default function DealQuotesPage() {
  const params = useParams();
  const dealId = params.id as string;
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const { user } = useSimpleAuth();

  useEffect(() => {
    fetchQuotes();
  }, [dealId]);

  const fetchQuotes = async () => {
    try {
      const data = await getQuotes({ dealId });
      console.log('Fetched quotes for deal:', dealId, data);
      
      // Fetch distributor details for each quote
      const quotesWithDetails = await Promise.all(
        data.map(async (quote) => {
          if (quote.distributor_id) {
            const { data: distributor } = await supabase
              .from('organizations')
              .select('name')
              .eq('id', quote.distributor_id)
              .single();
            
            return { ...quote, distributor };
          }
          return quote;
        })
      );
      
      setQuotes(quotesWithDetails);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    if (!user?.id) {
      toast.error('Please login to accept quote');
      return;
    }

    setAccepting(quoteId);
    try {
      // Update quote status to WON
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'WON' })
        .eq('id', quoteId);

      if (quoteError) throw quoteError;

      // Update deal with won_quote_id
      const { error: dealError } = await supabase
        .from('deals')
        .update({ 
          won_quote_id: quoteId,
          status: 'WON'
        })
        .eq('id', dealId);

      if (dealError) throw dealError;

      // Reject other quotes for this deal
      await supabase
        .from('quotes')
        .update({ status: 'LOST' })
        .eq('deal_id', dealId)
        .neq('id', quoteId);

      // Send notification to distributor users with email
      const quote = quotes.find(q => q.id === quoteId);
      if (quote?.distributor_id) {
        // Find users from the distributor organization
        const { data: distributorUsers } = await supabase
          .from('users')
          .select('id')
          .eq('organization_id', quote.distributor_id)
          .eq('role', 'DISTRIBUTOR');
        
        // Send notification to all distributor users
        if (distributorUsers && distributorUsers.length > 0) {
          await sendBulkNotification(
            distributorUsers.map(u => u.id),
            'QUOTE_ACCEPTED',
            'Quote Accepted!',
            `Your quote for ${formatCurrency(quote.total || 0)} has been accepted!`,
            `/distributor/quotes/${quoteId}`,
            { amount: formatCurrency(quote.total || 0) }
          );
        }
      }

      toast.success('Quote accepted successfully! Deal marked as won.');
      fetchQuotes();
    } catch (error) {
      console.error('Error accepting quote:', error);
      toast.error('Failed to accept quote');
    } finally {
      setAccepting(null);
    }
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

  const getLowestQuote = () => {
    if (quotes.length === 0) return null;
    return quotes.reduce((min, quote) => 
      (quote.total < min.total ? quote : min), quotes[0]
    );
  };

  const getAveragePrice = () => {
    if (quotes.length === 0) return 0;
    const sum = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
    return sum / quotes.length;
  };

  const lowestQuote = getLowestQuote();
  const averagePrice = getAveragePrice();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <Link href={`/reseller/deals/${dealId}`} className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Deal Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quotes for Deal</h1>
        <p className="text-gray-600">Compare quotes from distributors</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading quotes...</p>
          </CardContent>
        </Card>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No quotes received yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Distributors will submit quotes for this deal soon
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{quotes.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Lowest Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(lowestQuote?.total || 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-600">
                  {formatCurrency(averagePrice)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quotes List */}
          <div className="space-y-4">
            {quotes.map((quote) => {
              const isLowest = quote.id === lowestQuote?.id;
              const diffFromAverage = quote.total - averagePrice;
              
              return (
                <Card key={quote.id} className={`${isLowest ? 'border-2 border-green-500' : ''} ${quote.status === 'WON' ? 'border-2 border-yellow-400 bg-yellow-50' : ''}`}>
                  {quote.status === 'WON' && (
                    <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-t-lg font-semibold text-sm">
                      <CheckCircle className="h-4 w-4" />
                      🏆 Winning Quote — {quote.distributor?.name || 'Unknown Distributor'} won this deal
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            Quote #{quote.id.slice(-8)}
                          </h3>
                          <Badge variant={getStatusColor(quote.status)}>
                            {quote.status.replace('_', ' ')}
                          </Badge>
                          {isLowest && (
                            <Badge variant="success">
                              Best Price
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Distributor: <strong>{quote.distributor?.name || 'Unknown'}</strong>
                          </p>
                          <p className="text-sm text-gray-600">
                            Submitted: {quote.submittedAt ? formatRelativeTime(quote.submittedAt) : 'Draft'}
                          </p>
                          {quote.validUntil && (
                            <p className="text-sm text-gray-600">
                              Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">
                          {formatCurrency(quote.total || 0)}
                        </p>
                        {Math.abs(diffFromAverage) > 0 && (
                          <div className={`flex items-center justify-end gap-1 text-sm mt-1 ${
                            diffFromAverage < 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {diffFromAverage < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            <span>
                              {formatCurrency(Math.abs(diffFromAverage))} {diffFromAverage < 0 ? 'below' : 'above'} avg
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Subtotal</p>
                        <p className="font-semibold">{formatCurrency(quote.subtotal || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Tax</p>
                        <p className="font-semibold">{formatCurrency(quote.tax || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Shipping</p>
                        <p className="font-semibold">{formatCurrency(quote.shipping || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Discount</p>
                        <p className="font-semibold text-green-600">
                          -{formatCurrency(quote.discount || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/reseller/quotes/${quote.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      {quote.status === 'SUBMITTED' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleAcceptQuote(quote.id)}
                          disabled={accepting === quote.id}
                        >
                          {accepting === quote.id ? 'Accepting...' : 'Accept Quote'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
