'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Video, FileEdit, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const ACTIVITY_TYPES = [
  { 
    type: 'MEETING', 
    label: 'Schedule Meeting',
    icon: Calendar,
    points: 10,
    color: 'blue',
    description: 'Request a meeting with distributor'
  },
  { 
    type: 'DEMO', 
    label: 'Request Demo',
    icon: Video,
    points: 10,
    color: 'purple',
    description: 'Schedule a product demonstration'
  },
  { 
    type: 'BOQ_REVISION', 
    label: 'BOQ Revision',
    icon: FileEdit,
    points: 10,
    color: 'green',
    description: 'Request BOQ revision or update'
  },
];

export default function DealActivitiesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const dealId = params.id as string;
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [dealId]);

  const fetchActivities = async () => {
    if (!dealId) return;

    try {
      const { data, error } = await supabase
        .from('deal_activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalScore = activities
    .filter(a => a.status === 'ACKNOWLEDGED')
    .reduce((sum, a) => sum + (a.points || 0), 0);

  const handleAddActivity = async () => {
    if (!selectedActivity) {
      toast.error('Please select an activity type');
      return;
    }

    if (!user?.id) {
      toast.error('Please login to add activity');
      return;
    }

    const activityType = ACTIVITY_TYPES.find(a => a.type === selectedActivity);
    if (!activityType) return;

    try {
      const { data, error } = await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          reseller_id: user.id,
          activity_type: selectedActivity,
          title: title || activityType.label,
          description: description || activityType.description,
          scheduled_date: scheduledDate || new Date().toISOString(),
          notes,
          status: 'PENDING',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`${activityType.label} added successfully! +${activityType.points} points pending acknowledgment`);
      
      setSelectedActivity(null);
      setScheduledDate('');
      setNotes('');
      setTitle('');
      setDescription('');
      fetchActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACKNOWLEDGED':
        return (
          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            <CheckCircle className="h-3 w-3" />
            Acknowledged
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  const getActivityIcon = (activityType: string) => {
    const activity = ACTIVITY_TYPES.find(a => a.type === activityType);
    if (!activity) return Calendar;
    return activity.icon;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Deal Activities</h1>
            <p className="text-gray-600">Track activities and build your deal score</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back to Deal
          </Button>
        </div>

        {/* Score Display */}
        <Card className="mb-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Total Deal Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{totalScore}</span>
                  <span className="text-2xl text-blue-200">/100</span>
                </div>
                <p className="text-sm text-blue-100 mt-2">
                  {activities.filter(a => a.status === 'ACKNOWLEDGED').length} activities acknowledged
                </p>
              </div>
              <div className="text-right">
                <TrendingUp className="h-16 w-16 text-blue-200 mb-2" />
                <p className="text-sm text-blue-100">
                  {totalScore >= 70 ? 'Excellent' : totalScore >= 40 ? 'Good' : 'Building up'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Activity Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Add Activity</CardTitle>
                <p className="text-sm text-gray-600">Select activity to add points</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {ACTIVITY_TYPES.map((activity) => {
                  const Icon = activity.icon;
                  const isSelected = selectedActivity === activity.type;
                  
                  return (
                    <Card
                      key={activity.type}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? `border-${activity.color}-500 bg-${activity.color}-50` 
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedActivity(activity.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 bg-${activity.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-5 w-5 text-${activity.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{activity.label}</h4>
                            <p className="text-xs text-gray-600 mb-2">{activity.description}</p>
                            <span className={`text-xs bg-${activity.color}-100 text-${activity.color}-800 px-2 py-0.5 rounded-full`}>
                              +{activity.points} points
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {selectedActivity && (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium mb-2">Scheduled Date</label>
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Additional details..."
                      />
                    </div>

                    <Button onClick={handleAddActivity} className="w-full">
                      Add Activity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <p className="text-sm text-gray-600">Track your deal progress</p>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No activities yet</p>
                    <p className="text-sm text-gray-500">Add activities to build your deal score</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const Icon = getActivityIcon(activity.activity_type);
                      const activityType = ACTIVITY_TYPES.find(a => a.type === activity.activity_type);

                      return (
                        <Card key={activity.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 bg-${activityType?.color || 'blue'}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`h-6 w-6 text-${activityType?.color || 'blue'}-600`} />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold">{activity.title || activityType?.label}</h4>
                                    <p className="text-sm text-gray-600">
                                      {activity.description || activityType?.description}
                                    </p>
                                    {activity.scheduled_date && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Scheduled: {new Date(activity.scheduled_date).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  {getStatusBadge(activity.status)}
                                </div>

                                {activity.notes && (
                                  <p className="text-sm text-gray-600 mb-2 p-2 bg-gray-50 rounded">
                                    {activity.notes}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>Created: {new Date(activity.created_at).toLocaleDateString()}</span>
                                  {activity.acknowledged_at && (
                                    <span>Acknowledged: {new Date(activity.acknowledged_at).toLocaleDateString()}</span>
                                  )}
                                  <span className="font-semibold text-blue-600">
                                    {activity.status === 'ACKNOWLEDGED' ? `+${activity.points} points` : `${activity.points} points pending`}
                                  </span>
                                </div>

                                {activity.status === 'REJECTED' && activity.rejection_reason && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                    <p className="text-xs text-red-900 font-semibold">Rejection Reason:</p>
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
              </CardContent>
            </Card>

            {/* Point System Info */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">How Points Work</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Each activity is worth 10 points when acknowledged by distributor</li>
                  <li>• Higher scores show stronger deal engagement and commitment</li>
                  <li>• Distributors can see your score when evaluating deals</li>
                  <li>• Points help prioritize your deal over others</li>
                  <li>• Target 70+ points for Gold Deal status</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
