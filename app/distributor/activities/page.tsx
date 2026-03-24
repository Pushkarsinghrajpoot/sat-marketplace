'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Calendar, Video, FileEdit, Lock, TrendingUp } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { sendNotification } from '@/lib/notification-client';

export default function DistributorActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'acknowledged' | 'all'>('pending');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const { user } = useSimpleAuth();

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const fetchActivities = async () => {
    if (!user?.organizationId) return;

    try {
      // Fetch all deal activities where deals are locked and visible to distributor
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('id')
        .eq('is_locked', true);

      if (dealsError) throw dealsError;

      const dealIds = dealsData?.map(d => d.id) || [];

      if (dealIds.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('deal_activities')
        .select(`
          *,
          deals:deal_id (
            id,
            opportunity_name,
            customer_name,
            customer_company,
            estimated_value,
            reseller_id,
            score
          ),
          users:reseller_id (
            id,
            name,
            email,
            organizations:organization_id (
              name
            )
          )
        `)
        .in('deal_id', dealIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (activityId: string, dealId: string, resellerId: string, points: number) => {
    setActioningId(activityId);
    try {
      // Update activity status
      const { error: updateError } = await supabase
        .from('deal_activities')
        .update({
          status: 'ACKNOWLEDGED',
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', activityId);

      if (updateError) throw updateError;

      // Send notification to reseller with email
      await sendNotification({
        userId: resellerId,
        notificationType: 'ACTIVITY_ACKNOWLEDGED',
        title: 'Activity Acknowledged',
        message: `Your activity has been acknowledged! You earned ${points} points.`,
        link: `/reseller/deals/${dealId}/activities`,
        emailData: {
          points,
        },
      });

      toast.success(`Activity acknowledged! Reseller earned ${points} points.`);
      fetchActivities();
    } catch (error) {
      console.error('Error acknowledging activity:', error);
      toast.error('Failed to acknowledge activity');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (activityId: string, dealId: string, resellerId: string) => {
    const reason = rejectionReasons[activityId];
    if (!reason?.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActioningId(activityId);
    try {
      const { error: updateError } = await supabase
        .from('deal_activities')
        .update({
          status: 'REJECTED',
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', activityId);

      if (updateError) throw updateError;

      // Send notification to reseller with email
      await sendNotification({
        userId: resellerId,
        notificationType: 'ACTIVITY_REJECTED',
        title: 'Activity Rejected',
        message: `Your activity was rejected: ${reason}`,
        link: `/reseller/deals/${dealId}/activities`,
        emailData: {
          reason,
        },
      });

      toast.info('Activity rejected');
      // Clear this activity's rejection reason
      setRejectionReasons(prev => {
        const updated = { ...prev };
        delete updated[activityId];
        return updated;
      });
      fetchActivities();
    } catch (error) {
      console.error('Error rejecting activity:', error);
      toast.error('Failed to reject activity');
    } finally {
      setActioningId(null);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'MEETING': return Calendar;
      case 'DEMO': return Video;
      case 'BOQ_REVISION': return FileEdit;
      default: return Calendar;
    }
  };

  const filteredActivities = activities.filter(a => {
    if (activeTab === 'pending') return a.status === 'PENDING';
    if (activeTab === 'acknowledged') return a.status === 'ACKNOWLEDGED';
    return true;
  });

  const counts = {
    pending: activities.filter(a => a.status === 'PENDING').length,
    acknowledged: activities.filter(a => a.status === 'ACKNOWLEDGED').length,
    all: activities.length,
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Requests</h1>
        <p className="text-gray-600">Review and acknowledge reseller deal activities</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'pending' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({counts.pending})
        </Button>
        <Button
          variant={activeTab === 'acknowledged' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('acknowledged')}
        >
          Acknowledged ({counts.acknowledged})
        </Button>
        <Button
          variant={activeTab === 'all' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('all')}
        >
          All ({counts.all})
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading activities...</p>
          </CardContent>
        </Card>
      ) : filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No {activeTab} activities</p>
            <p className="text-sm text-gray-500 mt-2">
              Activity requests from resellers will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const Icon = getActivityIcon(activity.activity_type);
            const deal = activity.deals;
            const reseller = activity.users;

            return (
              <Card key={activity.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold">{activity.title || activity.activity_type.replace('_', ' ')}</h3>
                            <Badge variant={
                              activity.status === 'ACKNOWLEDGED' ? 'success' :
                              activity.status === 'REJECTED' ? 'danger' : 'warning'
                            }>
                              {activity.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {activity.description || 'No description provided'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>Deal: {deal?.opportunity_name || 'N/A'}</span>
                            <span>•</span>
                            <span>Reseller: {reseller?.name || 'N/A'} ({reseller?.organizations?.name || 'N/A'})</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Lock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-semibold">Deal Score: {deal?.score || 0}</span>
                          </div>
                          <p className="text-xs text-gray-500">+{activity.points} points</p>
                        </div>
                      </div>

                      {activity.scheduled_date && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">Scheduled Date:</p>
                          <p className="text-sm font-semibold">{new Date(activity.scheduled_date).toLocaleDateString()}</p>
                        </div>
                      )}

                      {activity.notes && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Notes:</p>
                          <p className="text-sm">{activity.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span>Created: {formatRelativeTime(activity.created_at)}</span>
                        {activity.acknowledged_at && (
                          <>
                            <span>•</span>
                            <span>Acknowledged: {formatRelativeTime(activity.acknowledged_at)}</span>
                          </>
                        )}
                      </div>

                      {activity.status === 'PENDING' && (
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            onClick={() => handleAcknowledge(activity.id, activity.deal_id, activity.reseller_id, activity.points)}
                            disabled={actioningId === activity.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {actioningId === activity.id ? 'Processing...' : 'Acknowledge'}
                          </Button>
                          <div className="flex-1 flex gap-2">
                            <Textarea
                              placeholder="Rejection reason..."
                              value={rejectionReasons[activity.id] || ''}
                              onChange={(e) => setRejectionReasons(prev => ({
                                ...prev,
                                [activity.id]: e.target.value
                              }))}
                              className="flex-1"
                              rows={1}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(activity.id, activity.deal_id, activity.reseller_id)}
                              disabled={actioningId === activity.id}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {activity.status === 'REJECTED' && activity.rejection_reason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-900 font-semibold mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-800">{activity.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
