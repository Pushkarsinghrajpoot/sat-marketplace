'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Star, CheckCircle, Target, Clock, Package } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { getEngagementRequests, updateEngagementRequest } from '@/lib/data-helpers';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function EngagementsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [engagements, setEngagements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEngagements();
  }, [user, activeTab]);

  const fetchEngagements = async () => {
    if (!user?.organizationId) return;
    
    try {
      let query = supabase
        .from('engagement_requests')
        .select(`
          *,
          deals!inner(
            id,
            opportunity_name,
            customer_name,
            customer_company,
            estimated_value,
            close_date,
            is_verified,
            score
          ),
          users!engagement_requests_reseller_id_fkey(
            id,
            name,
            email
          )
        `)
        // Show engagement requests assigned to this distributor OR generic ones (distributor_id is null)
        .or(`distributor_id.eq.${user.organizationId},distributor_id.is.null`)
        .order('created_at', { ascending: false });

      if (activeTab === 'pending') {
        query = query.eq('status', 'PENDING');
      } else if (activeTab === 'approved') {
        query = query.eq('status', 'APPROVED');
      } else if (activeTab === 'declined') {
        query = query.eq('status', 'DECLINED');
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setEngagements(data || []);
    } catch (error) {
      console.error('Error fetching engagements:', error);
      toast.error('Failed to load engagement requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (engagementId: string) => {
    if (!user?.id) return;
    try {
      await updateEngagementRequest(engagementId, { status: 'APPROVED' }, user.id);
      toast.success('Engagement approved!');
      fetchEngagements();
    } catch (error) {
      console.error('Error approving engagement:', error);
      toast.error('Failed to approve engagement');
    }
  };

  const handleDecline = async (engagementId: string) => {
    if (!user?.id) return;
    try {
      await updateEngagementRequest(engagementId, { 
        status: 'DECLINED',
        decline_reason: 'Not interested at this time'
      }, user.id);
      toast.info('Engagement declined');
      fetchEngagements();
    } catch (error) {
      console.error('Error declining engagement:', error);
      toast.error('Failed to decline engagement');
    }
  };

  // Helper function for score-based badging
  const getBadge = (score: number) => {
    if (score >= 250) return { label: 'Gold', color: 'bg-yellow-500' };
    if (score >= 100) return { label: 'Silver', color: 'bg-gray-400' };
    return { label: 'Bronze', color: 'bg-orange-600' };
  };

  // Filter engagements based on search and tab
  const filteredEngagements = engagements.filter((eng: any) => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      eng.deals?.opportunityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eng.deals?.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eng.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && eng.status === 'PENDING') ||
      (activeTab === 'approved' && eng.status === 'APPROVED') ||
      (activeTab === 'declined' && eng.status === 'DECLINED');
    
    return matchesSearch && matchesTab;
  });

  const getCounts = () => {
    return {
      pending: engagements.filter((e: any) => e.status === 'PENDING').length,
      approved: engagements.filter((e: any) => e.status === 'APPROVED').length,
      declined: engagements.filter((e: any) => e.status === 'DECLINED').length,
      all: engagements.length,
    };
  };

  const counts = getCounts();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Engagement Requests</h1>
        <p className="text-gray-600">Review and respond to engagement requests from resellers</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 border-b border-gray-200">
          {[
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'approved', label: 'Approved', count: counts.approved },
            { key: 'declined', label: 'Declined', count: counts.declined },
            { key: 'all', label: 'All', count: counts.all },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by reseller name or deal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {filteredEngagements.length > 0 ? (
          filteredEngagements.map((engagement) => (
            <Card key={engagement.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {engagement.users?.name?.charAt(0) || 'R'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{engagement.users?.name || 'Unknown Reseller'}</h3>
                    <p className="text-xs text-gray-600">{engagement.reseller_organizations?.name || 'N/A'}</p>
                    {engagement.deals?.is_verified && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Verified</span>
                      </div>
                    )}
                  </div>
                  <Badge variant={
                    engagement.status === 'PENDING' ? 'warning' :
                    engagement.status === 'APPROVED' ? 'success' : 'default'
                  }>
                    {engagement.status}
                  </Badge>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">{engagement.deals?.opportunity_name || 'N/A'}</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      <span>{engagement.deals?.customer_company || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{formatCurrency(engagement.deals?.estimated_value || 0)}</span>
                      {engagement.deals?.close_date && (
                        <>
                          <span>•</span>
                          <span>Close: {new Date(engagement.deals.close_date).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    <div>
                      <Badge variant="info" className="text-xs">{engagement.engagement_type || 'General Request'}</Badge>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-800 mb-2">Effort Signals:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-green-700">Deal Registered</span>
                    </div>
                    {engagement.deals?.is_verified && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-700">Customer Verified</span>
                      </div>
                    )}
                    {engagement.deals?.score > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-700">Score: {engagement.deals.score}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="success" className="mt-2 text-xs">
                    {engagement.deals?.score >= 100 ? 'High' : engagement.deals?.score >= 50 ? 'Medium' : 'Low'} Effort
                  </Badge>
                  <div className="mt-2 text-xs text-green-700">
                    <span className="font-semibold">Points Earned:</span> 70 {engagement.engagement_type && ' + 10 bonus'}
                  </div>
                </div>

                {engagement.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Message:</p>
                    <p className="text-xs text-gray-600 italic">"{engagement.message}"</p>
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  Requested {formatRelativeTime(engagement.created_at)}
                </div>

                {engagement.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleApprove(engagement.id)}
                    >
                      Accept & Quote
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDecline(engagement.id)}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-3">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No engagement requests found</p>
              <p className="text-sm text-gray-500">Engagement requests from resellers will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
