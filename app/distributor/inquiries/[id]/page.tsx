'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { QuoteBuilder } from '@/components/quote-builder';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, organization } = useSimpleAuth();
  const [inquiry, setInquiry] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    loadInquiry();
  }, [params.id]);

  const loadInquiry = async () => {
    try {
      const { data, error } = await supabase
        .from('product_inquiries')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            price,
            brand
          ),
          user:users!product_inquiries_user_id_fkey (
            id,
            name,
            email,
            organization_id,
            organizations!users_organization_id_fkey (
              id,
              name,
              type
            )
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setInquiry(data);
    } catch (error) {
      console.error('Error loading inquiry:', error);
      toast.error('Failed to load inquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setResponding(true);
    try {
      const { error } = await supabase
        .from('product_inquiries')
        .update({
          status: 'RESPONDED',
          response: response,
          responded_by: user?.id,
          responded_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) throw error;

      toast.success('Response sent successfully');
      loadInquiry();
      setResponse('');
    } catch (error) {
      console.error('Error responding:', error);
      toast.error('Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Inquiry not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showQuoteBuilder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setShowQuoteBuilder(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inquiry
          </Button>
        </div>
        <QuoteBuilder
          inquiryId={inquiry.id}
          productId={inquiry.product_id}
          resellerId={inquiry.user?.organization_id}
          distributorId={organization?.id || ''}
          onComplete={() => {
            setShowQuoteBuilder(false);
            loadInquiry();
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/distributor/inquiries">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inquiries
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-2">{inquiry.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge>{inquiry.inquiry_type}</Badge>
                    <Badge variant={inquiry.status === 'OPEN' ? 'warning' : 'success'}>
                      {inquiry.status}
                    </Badge>
                  </div>
                </div>
                <Button onClick={() => setShowQuoteBuilder(true)}>
                  Create Quote
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Question</h3>
                <p className="text-gray-700">{inquiry.question}</p>
              </div>

              {inquiry.response && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Your Response</h3>
                  <p className="text-gray-700">{inquiry.response}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Responded {new Date(inquiry.responded_at).toLocaleString()}
                  </p>
                </div>
              )}

              {inquiry.status === 'OPEN' && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Send Response</h3>
                  <Textarea
                    rows={4}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response..."
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleRespond} disabled={responding}>
                      {responding ? 'Sending...' : 'Send Response'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowQuoteBuilder(true)}>
                      Create Quote Instead
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiry.products ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-semibold">{inquiry.products.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SKU</p>
                    <p className="font-semibold">{inquiry.products.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Brand</p>
                    <p className="font-semibold">{inquiry.products.brand || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Base Price</p>
                    <p className="font-semibold">{formatCurrency(inquiry.products.price)}</p>
                  </div>
                  <Link href={`/products/${inquiry.products.id}`}>
                    <Button variant="outline" className="w-full mt-3">
                      View Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">No product linked</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiry.user ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{inquiry.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{inquiry.user.email}</p>
                  </div>
                  {inquiry.user.organizations && (
                    <div>
                      <p className="text-sm text-gray-600">Organization</p>
                      <p className="font-semibold">{inquiry.user.organizations.name}</p>
                      <Badge variant="info" className="mt-1">
                        {inquiry.user.organizations.type}
                      </Badge>
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-3">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">No customer info</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium">{new Date(inquiry.created_at).toLocaleString()}</p>
                </div>
                {inquiry.responded_at && (
                  <div>
                    <p className="text-gray-600">Responded</p>
                    <p className="font-medium">{new Date(inquiry.responded_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
