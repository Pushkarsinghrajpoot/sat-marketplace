'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Building2, User, Calendar, DollarSign, Lock, FileText, TrendingUp, CheckCircle, XCircle, Clock, Video, Users } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/lib/simple-auth';
import { toast } from 'sonner';
import Link from 'next/link';

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
    icon: FileText,
    points: 10,
    color: 'green',
    description: 'Request BOQ revision or update'
  },
];

export default function DistributorDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSimpleAuth();
  const dealId = params.id as string;
  const [deal, setDeal] = useState<any>(null);
  const [boqs, setBOQs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchDealDetails();
  }, [dealId]);

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
      const activityData = {
        deal_id: dealId,
        reseller_id: user.id, // Note: Distributors are also using reseller_id field
        activity_type: selectedActivity,
        title: title || activityType.label,
        description: description || activityType.description,
        scheduled_date: scheduledDate || new Date().toISOString(),
        notes,
        status: 'PENDING',
      };
      
      console.log('Distributor - Creating activity:', activityData);
      
      const { data, error } = await supabase
        .from('deal_activities')
        .insert(activityData)
        .select()
        .single();

      if (error) throw error;
      
      console.log('Distributor - Activity created successfully:', data);

      toast.success(`${activityType.label} added successfully! +${activityType.points} points pending acknowledgment`);
      
      setSelectedActivity(null);
      setScheduledDate('');
      setNotes('');
      setTitle('');
      setDescription('');
      
      // Wait a moment then refresh
      setTimeout(() => {
        fetchActivities(); // Refresh activities
      }, 500);
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    }
  };

  const fetchActivities = async () => {
    if (!dealId) return;

    try {
      const { data, error } = await supabase
        .from('deal_activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Distributor - Activities fetched:', data);
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const totalScore = activities
    .filter(a => a.status === 'ACKNOWLEDGED')
    .reduce((sum, a) => sum + (a.points || 0), 0);

  const checkDealAccess = async (deal: any, distributorOrgId: string) => {
    // Allow access if:
    // 1. Deal is BIDDING type (open for all distributors)
    // 2. Deal is DEAL_REGISTRATION (visible to all distributors for viewing)
    // 3. Deal is DIRECT_QUERY (check if this distributor is the target)
    
    if (deal.deal_type === 'BIDDING') {
      return true; // Open bidding deals are visible to all distributors
    }
    
    // Allow access to all DEAL_REGISTRATION deals for viewing
    if (deal.deal_type === 'DEAL_REGISTRATION') {
      return true; // All registered deals are visible to distributors
    }
    
    if (deal.deal_type === 'DIRECT_QUERY') {
      // For direct queries, check if this distributor is the target
      const { data: queryData } = await supabase
        .from('direct_queries')
        .select('distributor_id')
        .eq('id', deal.id)
        .single();
      
      if (queryData && queryData.distributor_id === distributorOrgId) {
        return true;
      }
    }
    
    return false;
  };

  const fetchDealDetails = async () => {
    if (!dealId || !user?.organizationId) return;

    try {
      // Fetch deal details with authorization check
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select(`
          *,
          users:reseller_id (
            id,
            name,
            email,
            organizations:organization_id (
              name
            )
          )
        `)
        .eq('id', dealId)
        .single();

      if (dealError) throw dealError;
      
      // Check if this distributor should have access to this deal
      const hasAccess = await checkDealAccess(dealData, user.organizationId);
      
      if (!hasAccess) {
        console.error('Unauthorized access to deal:', dealId);
        setDeal(null);
        return;
      }
      
      setDeal(dealData);

      // Fetch BOQs for this deal
      const { data: boqData } = await supabase
        .from('boqs')
        .select('*')
        .eq('deal_id', dealId);
      
      setBOQs(boqData || []);

      // Fetch activities for this deal
      await fetchActivities();

    } catch (error) {
      console.error('Error fetching deal details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading deal details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 font-semibold">Deal not found</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{deal.opportunity_name}</h1>
              {deal.is_locked && (
                <Badge variant="success">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
              <Badge>{deal.deal_type?.replace('_', ' ')}</Badge>
            </div>
            <p className="text-gray-600">{deal.customer_company}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Estimated Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(deal.estimated_value)}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold">{deal.customer_name}</p>
                  <p className="text-sm text-gray-600">{deal.customer_company}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Reseller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-semibold">{deal.users?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{deal.users?.organizations?.name || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Deal Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{deal.score || 0}</p>
                  <p className="text-sm text-gray-600">
                    {activities.filter(a => a.status === 'ACKNOWLEDGED').length} activities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge variant="default">{deal.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Expected Close Date</p>
                <p className="font-medium">
                  {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created</p>
                <p className="font-medium">{formatRelativeTime(deal.created_at)}</p>
              </div>
              {deal.converted_to_bidding && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Converted to Bidding</p>
                  <p className="font-medium">{formatRelativeTime(deal.converted_to_bidding_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>BOQs & Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              {boqs.length > 0 ? (
                <div className="space-y-3">
                  {boqs.map((boq) => (
                    <div key={boq.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{boq.file_name}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(boq.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(boq.file_url, '_blank')}
                        >
                          View
                        </Button>
                        <Link href={`/distributor/quotes/create?boqId=${boq.id}&dealId=${deal.id}`}>
                          <Button size="sm">Create Quote</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No BOQs uploaded yet</p>
                  {deal.deal_type === 'BIDDING' && (
                    <Link href={`/distributor/quotes/create?dealId=${deal.id}`}>
                      <Button className="mt-4" size="sm">
                        Create Quote Anyway
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Score Display */}
        <Card className="mt-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
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

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
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
                <p className="text-sm text-gray-600">Track deal progress</p>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No activities yet</p>
                    <p className="text-sm text-gray-500">Add activities to build deal score</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const Icon = getActivityIcon(activity.activity_type);
                      const activityType = ACTIVITY_TYPES.find(a => a.type === activity.activity_type);
                      
                      console.log('Distributor - Rendering activity:', {
                        title: activity.title,
                        description: activity.description,
                        status: activity.status,
                        points: activity.points,
                        notes: activity.notes,
                        scheduled_date: activity.scheduled_date,
                        created_at: activity.created_at,
                        acknowledged_at: activity.acknowledged_at
                      });

                      return (
                        <Card key={activity.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 bg-${activityType?.color || 'blue'}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`h-6 w-6 text-${activityType?.color || 'blue'}-600`} />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-lg">{activity.title || activityType?.label}</h4>
                                      {getStatusBadge(activity.status)}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                      {activity.description || activityType?.description}
                                    </p>
                                    
                                    {/* Meeting Details */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <span className="font-medium text-blue-900">📅 Scheduled:</span>
                                          <span className="text-blue-800 ml-2">
                                            {activity.scheduled_date ? 
                                              `${new Date(activity.scheduled_date).toLocaleDateString()} at ${new Date(activity.scheduled_date).toLocaleTimeString()}` : 
                                              'Not scheduled'
                                            }
                                          </span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-blue-900">👥 Organizer:</span>
                                          <span className="text-blue-800 ml-2">
                                            {activity.users?.name || 'Unknown'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-blue-900">📧 Contact:</span>
                                          <span className="text-blue-800 ml-2">
                                            {activity.users?.email || 'No email'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-blue-900">🎯 Activity Type:</span>
                                          <span className="text-blue-800 ml-2 capitalize">
                                            {activity.activity_type?.replace('_', ' ')}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Notes Section */}
                                    {activity.notes && (
                                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                        <h5 className="font-medium text-yellow-900 mb-2">📝 Notes & Action Items:</h5>
                                        <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                                          {activity.notes}
                                        </p>
                                      </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-2">
                                      <span>🕐 Created: {new Date(activity.created_at).toLocaleDateString()} at {new Date(activity.created_at).toLocaleTimeString()}</span>
                                      {activity.acknowledged_at && (
                                        <span>✅ Acknowledged: {new Date(activity.acknowledged_at).toLocaleDateString()} at {new Date(activity.acknowledged_at).toLocaleTimeString()}</span>
                                      )}
                                      <span className="font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        {activity.status === 'ACKNOWLEDGED' ? `+${activity.points} points earned` : `${activity.points} points pending`}
                                      </span>
                                    </div>
                                  </div>
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
                  <li>• Each activity is worth 10 points when acknowledged</li>
                  <li>• Higher scores show stronger deal engagement</li>
                  <li>• Activities help track deal progress</li>
                  <li>• Target 70+ points for excellent engagement</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
