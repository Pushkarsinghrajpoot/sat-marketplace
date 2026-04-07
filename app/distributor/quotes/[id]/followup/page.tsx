'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, MessageSquare, Send, Bell } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { getQuotes } from '@/lib/data-helpers';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/lib/simple-auth';
import { sendNotification } from '@/lib/notification-client';
import { toast } from 'sonner';

export default function FollowUpPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;
  const { user } = useSimpleAuth();
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  
  const [followUpData, setFollowUpData] = useState({
    scheduledDate: '',
    scheduledTime: '10:00',
    type: 'CALL',
    notes: '',
    reminder: '1_day_before',
  });

  useEffect(() => {
    async function fetchQuote() {
      try {
        // Fetch quote with relationships
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

  const handleScheduleFollowUp = async () => {
    if (!quote?.id || !followUpData.scheduledDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setScheduling(true);
    try {
      // Create follow-up activity record
      const followUp = {
        quote_id: quote.id,
        distributor_id: user?.organizationId,
        reseller_id: quote.reseller_id,
        scheduled_date: new Date(`${followUpData.scheduledDate}T${followUpData.scheduledTime}`).toISOString(),
        type: followUpData.type,
        notes: followUpData.notes,
        reminder: followUpData.reminder,
        status: 'SCHEDULED',
        created_at: new Date().toISOString(),
      };

      // In a real implementation, you would save this to your activities table
      console.log('Scheduled follow-up:', followUp);

      // Create notification for the distributor
      const notification = {
        user_id: user?.id,
        notification_type: 'FOLLOW_UP_SCHEDULED',
        title: 'Follow-up Scheduled',
        message: `Follow-up for quote ${quote.id.slice(-8)} scheduled for ${followUpData.scheduledDate}`,
        link: `/distributor/quotes/${quote.id}`,
      };

      console.log('Follow-up notification:', notification);

      toast.success('Follow-up scheduled successfully!');
      router.push(`/distributor/quotes/${quote.id}`);
      
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      toast.error('Failed to schedule follow-up');
    } finally {
      setScheduling(false);
    }
  };

  const handleSendReminder = async () => {
    if (!quote?.reseller_id) return;

    try {
      await sendNotification({
        userId: quote.reseller_id,
        notificationType: 'QUOTE_REMINDER',
        title: 'Quote Follow-up Reminder',
        message: `Distributor is following up on quote #${quote.id.slice(-8)} for ${formatCurrency(quote.total || 0)}`,
        link: `/reseller/deals/${quote.deal_id}/quotes`,
        emailData: {
          dealName: quote.deal?.opportunity_name || quote.deals?.opportunity_name,
          amount: formatCurrency(quote.total || 0),
        },
      });
      toast.success('Reminder sent to reseller!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading follow-up data...</p>
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

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

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
                <Calendar className="h-5 w-5" />
                Schedule Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <Input
                    type="date"
                    min={today}
                    value={followUpData.scheduledDate}
                    onChange={(e) => setFollowUpData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <Input
                    type="time"
                    value={followUpData.scheduledTime}
                    onChange={(e) => setFollowUpData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Follow-up Type</label>
                  <Select
                    value={followUpData.type}
                    onChange={(e) => setFollowUpData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Meeting</option>
                    <option value="VIDEO_CALL">Video Call</option>
                    <option value="SITE_VISIT">Site Visit</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reminder</label>
                  <Select
                    value={followUpData.reminder}
                    onChange={(e) => setFollowUpData(prev => ({ ...prev, reminder: e.target.value }))}
                  >
                    <option value="1_hour_before">1 hour before</option>
                    <option value="1_day_before">1 day before</option>
                    <option value="2_days_before">2 days before</option>
                    <option value="1_week_before">1 week before</option>
                    <option value="none">No reminder</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  placeholder="Purpose of follow-up, topics to discuss, etc..."
                  value={followUpData.notes}
                  onChange={(e) => setFollowUpData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Follow-up Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {followUpData.scheduledDate || 'Not set'}</p>
                  <p><strong>Time:</strong> {followUpData.scheduledTime}</p>
                  <p><strong>Type:</strong> {followUpData.type.replace('_', ' ').toLowerCase()}</p>
                  <p><strong>Reminder:</strong> {followUpData.reminder.replace('_', ' ')}</p>
                  {followUpData.notes && <p><strong>Notes:</strong> {followUpData.notes}</p>}
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
                onClick={handleScheduleFollowUp}
                disabled={scheduling}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {scheduling ? 'Scheduling...' : 'Schedule Follow-up'}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSendReminder}>
                <Bell className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quote ID:</span>
                <span className="text-sm font-medium">{quote.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer:</span>
                <span className="text-sm">{quote.deal?.customerName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="font-semibold">{formatCurrency(quote.total || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant="default">{quote.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm">{formatRelativeTime(quote.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Quick Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                "Just following up on our quote..."
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                "Any questions about the proposal?"
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                "Ready to move forward?"
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
