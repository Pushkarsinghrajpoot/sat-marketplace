'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type FilterType = 'all' | 'pending' | 'accepted' | 'rejected' | 'boqs';

export default function ResellerQuotesPage() {
  const { user, organization } = useSimpleAuth();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [boqs, setBOQs] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadQuotes();
      loadBOQs();
    }
  }, [user, filter]);

  const loadQuotes = async () => {
    if (filter === 'boqs') return;
    setLoading(true);
    try {
      let query = supabase
        .from('quotes')
        .select(`
          *,
          quote_line_items (
            id,
            product_name,
            quantity,
            unit_price,
            subtotal
          ),
          organizations:distributor_id (
            id,
            name,
            logo
          )
        `)
        .eq('reseller_organization_id', user?.organizationId)
        .order('created_at', { ascending: false });

      // Apply status filter only for quote-related filters
      if (filter === 'pending') {
        query = query.eq('status', 'TO_SUBMIT');
      } else if (filter === 'accepted') {
        query = query.eq('status', 'WON');
      } else if (filter === 'rejected') {
        query = query.eq('status', 'LOST');
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBOQs = async () => {
    try {
      const { data, error } = await supabase
        .from('boqs')
        .select(`
          *,
          deals (
            id,
            opportunity_name,
            customer_name,
            customer_company
          ),
          quotes:quotes!boq_id (
            id,
            status,
            total,
            distributor_id,
            organizations:distributor_id (
              id,
              name
            )
          )
        `)
        .eq('reseller_organization_id', user?.organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBOQs(data || []);
    } catch (error) {
      console.error('Error loading BOQs:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      TO_SUBMIT: { variant: 'warning', text: 'Pending Review' },
      SUBMITTED: { variant: 'info', text: 'Submitted' },
      WON: { variant: 'success', text: 'Won' },
      LOST: { variant: 'danger', text: 'Lost' },
      EXPIRED: { variant: 'default', text: 'Expired' }
    };
    const config = variants[status] || { variant: 'default', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quotes</h1>
        <p className="text-gray-600">Review and manage quotes from distributors</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'boqs' ? 'primary' : 'outline'}
          onClick={() => setFilter('boqs')}
        >
          My BOQs ({boqs.length})
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Quotes
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'accepted' ? 'primary' : 'outline'}
          onClick={() => setFilter('accepted')}
        >
          Accepted
        </Button>
        <Button
          variant={filter === 'rejected' ? 'primary' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </Button>
      </div>

      {filter === 'boqs' ? (
        loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Loading BOQs...</p>
            </CardContent>
          </Card>
        ) : boqs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No BOQs found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {boqs.map((boq) => (
              <Card key={boq.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-bold text-lg">BOQ-{boq.id.slice(-8)}</h3>
                        <Badge variant="info">{boq.visibility}</Badge>
                        {boq.quotes && boq.quotes.length > 0 && (
                          <Badge variant="success">{boq.quotes.length} Quote(s) Received</Badge>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Deal</p>
                          <p className="font-semibold">{boq.deals?.opportunity_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-semibold">{boq.deals?.customer_company || boq.deals?.customer_name || 'N/A'}</p>
                        </div>
                      </div>

                      {boq.quotes && boq.quotes.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">Quotes Received:</p>
                          <div className="space-y-2">
                            {boq.quotes.map((quote: any) => (
                              <div key={quote.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{quote.organizations?.name || 'Unknown'}</span>
                                  <Badge variant={getStatusBadge(quote.status).props.variant}>
                                    {getStatusBadge(quote.status).props.children}
                                  </Badge>
                                </div>
                                <span className="text-sm font-bold">{formatCurrency(quote.total || 0)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(boq.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {boq.file_url && (
                        <Button variant="outline" size="sm" onClick={() => window.open(boq.file_url, '_blank')}>
                          <Download className="h-4 w-4 mr-2" />
                          Download BOQ
                        </Button>
                      )}
                      {boq.deal_id && (
                        <Link href={`/reseller/deals/${boq.deal_id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Deal
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading quotes...</p>
          </CardContent>
        </Card>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No quotes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusBadge(quote.status)}
                      <Badge variant="info">{quote.quote_type}</Badge>
                      {quote.valid_until && new Date(quote.valid_until) < new Date() && (
                        <Badge variant="danger">Expired</Badge>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">From</p>
                        <div className="flex items-center gap-2 mt-1">
                          {quote.organizations?.logo && (
                            <img src={quote.organizations.logo} alt="" className="w-6 h-6 rounded" />
                          )}
                          <p className="font-semibold">{quote.organizations?.name || 'Unknown Distributor'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(quote.total)}
                        </p>
                      </div>
                    </div>

                    {quote.quote_line_items && quote.quote_line_items.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">
                          {quote.quote_line_items.length} item(s)
                        </p>
                        <div className="space-y-1">
                          {quote.quote_line_items.slice(0, 3).map((item: any) => (
                            <p key={item.id} className="text-sm text-gray-700">
                              • {item.product_name} - {item.quantity} × {formatCurrency(item.unit_price)}
                            </p>
                          ))}
                          {quote.quote_line_items.length > 3 && (
                            <p className="text-sm text-gray-500">
                              +{quote.quote_line_items.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                      </span>
                      {quote.valid_until && (
                        <span>
                          Valid until: {new Date(quote.valid_until).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link href={`/reseller/quotes/${quote.id}`}>
                    <Button>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
