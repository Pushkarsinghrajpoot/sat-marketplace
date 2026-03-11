'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, User, MessageCircle } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateInquiryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversation');
  const { user, organization } = useSimpleAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [conversation, setConversation] = useState<any>(null);
  const [formData, setFormData] = useState({
    subject: '',
    question: '',
    inquiryType: 'GENERAL'
  });

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      setLoading(false);
    }
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          products (*),
          users!chat_conversations_customer_id_fkey (*)
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      
      setConversation(data);
      
      // Pre-fill form based on conversation
      setFormData({
        subject: data.subject || `Inquiry about ${data.products?.name || 'Product'}`,
        question: '',
        inquiryType: 'GENERAL'
      });
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.question.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Create product inquiry
      const { data: inquiry, error: inquiryError } = await supabase
        .from('product_inquiries')
        .insert({
          product_id: conversation?.product_id || null,
          user_id: conversation?.customer_id || user?.id,
          inquiry_type: formData.inquiryType,
          subject: formData.subject,
          question: formData.question,
          status: 'OPEN'
        })
        .select(`
          *,
          products (*),
          users!product_inquiries_user_id_fkey (
            id,
            name,
            email
          )
        `)
        .single();

      if (inquiryError) throw inquiryError;

      toast.success('Inquiry created successfully!');
      
      // Redirect to the inquiry detail page
      if (inquiry) {
        router.push(`/distributor/inquiries/${inquiry.id}`);
      }
    } catch (error) {
      console.error('Error creating inquiry:', error);
      toast.error('Failed to create inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href={conversationId ? `/distributor/messages/${conversationId}` : '/distributor/inquiries'}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Inquiry</CardTitle>
        </CardHeader>
        <CardContent>
          {conversation && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Based on Conversation</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{conversation.subject}</span>
                </div>
                {conversation.products && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{conversation.products.name}</span>
                  </div>
                )}
                {conversation.users && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{conversation.users.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Subject *
              </label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter inquiry subject"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Inquiry Type
              </label>
              <select
                value={formData.inquiryType}
                onChange={(e) => setFormData(prev => ({ ...prev, inquiryType: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="GENERAL">General</option>
                <option value="TECHNICAL">Technical</option>
                <option value="PRICING">Pricing</option>
                <option value="AVAILABILITY">Availability</option>
                <option value="SUPPORT">Support</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Question/Details *
              </label>
              <Textarea
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Describe your inquiry in detail..."
                rows={6}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Creating...' : 'Create Inquiry'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
