'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, User, Calendar, DollarSign, Lock, FileText, TrendingUp } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function DistributorDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const dealId = params.id as string;
  const [deal, setDeal] = useState<any>(null);
  const [boqs, setBOQs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealDetails();
  }, [dealId]);

  const fetchDealDetails = async () => {
    if (!dealId) return;

    try {
      // Fetch deal details
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
      setDeal(dealData);

      // Fetch BOQs for this deal
      const { data: boqData } = await supabase
        .from('boqs')
        .select('*')
        .eq('deal_id', dealId);
      
      setBOQs(boqData || []);

      // Fetch activities for this deal
      const { data: activityData } = await supabase
        .from('deal_activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });
      
      setActivities(activityData || []);

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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Deal Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{activity.title || activity.activity_type}</p>
                        <Badge variant={activity.status === 'ACKNOWLEDGED' ? 'success' : 'warning'}>
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">+{activity.points} points</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No activities yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
