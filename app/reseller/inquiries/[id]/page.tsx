'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Calendar, 
  MessageCircle,
  Send,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSimpleAuth();
  const inquiryId = params.id as string;

  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadInquiry();
  }, [inquiryId]);

  const loadInquiry = async () => {
    try {
      const { data, error } = await supabase
        .from('product_inquiries')
        .select(`
          *,
          products (*),
          user:users!product_inquiries_user_id_fkey (
            id,
            name,
            email,
            avatar
          ),
          responder:users!product_inquiries_responded_by_fkey (
            id,
            name,
            email
          )
        `)
        .eq('id', inquiryId)
        .single();

      if (error) throw error;
      
      setInquiry(data);
      setStatus(data.status);
      setResponse(data.response || '');
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

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('product_inquiries')
        .update({
          response: response,
          responded_by: user?.id,
          responded_at: new Date().toISOString(),
          status: 'RESPONDED',
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId);

      if (error) throw error;

      toast.success('Response sent successfully!');
      await loadInquiry();
    } catch (error) {
      console.error('Error responding to inquiry:', error);
      toast.error('Failed to send response');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="default"><AlertCircle className="h-3 w-3 mr-1" /> Open</Badge>;
      case 'RESPONDED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Responded</Badge>;
      case 'CLOSED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Closed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading inquiry...</p>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Inquiry not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/reseller/inquiries">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inquiries
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Inquiry Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{inquiry.subject}</CardTitle>
                <p className="text-gray-600 mt-1">Inquiry ID: {inquiry.id.slice(0, 8)}...</p>
              </div>
              {getStatusBadge(inquiry.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Information */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {inquiry.user?.avatar ? (
                  <img 
                    src={inquiry.user.avatar} 
                    alt={inquiry.user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{inquiry.user?.name}</h3>
                <p className="text-sm text-gray-600">{inquiry.user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Information */}
            {inquiry.products && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-4">
                  <Package className="h-8 w-8 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{inquiry.products.name}</h3>
                    <p className="text-sm text-gray-600">SKU: {inquiry.products.sku}</p>
                    <p className="text-sm text-gray-500 mt-1">{inquiry.products.short_description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Question */}
            <div>
              <h3 className="font-semibold mb-2">Question</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="whitespace-pre-wrap">{inquiry.question}</p>
              </div>
            </div>

            {/* Response */}
            {inquiry.response && (
              <div>
                <h3 className="font-semibold mb-2">Response</h3>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{inquiry.response}</p>
                  {inquiry.responded_at && (
                    <p className="text-sm text-gray-500 mt-2">
                      Responded on {new Date(inquiry.responded_at).toLocaleDateString()} by {inquiry.responder?.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Form */}
        {inquiry.status === 'OPEN' && (
          <Card>
            <CardHeader>
              <CardTitle>Respond to Inquiry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Response
                </label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                  rows={6}
                />
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleRespond}
                  disabled={submitting || !response.trim()}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Response
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setResponse('')}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
