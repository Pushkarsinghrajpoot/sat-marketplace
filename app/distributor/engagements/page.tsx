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
      const statusFilter = activeTab === 'pending' ? 'PENDING' : activeTab === 'approved' ? 'APPROVED' : undefined;
      const data = await getEngagementRequests({ 
        distributorId: user.organizationId,
        status: statusFilter
      });
      setEngagements(data);
    } catch (error) {
      console.error('Error fetching engagements:', error);
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
        {engagements.map((engagement) => (
          <Card key={engagement.id} className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {engagement.resellerLogo}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{engagement.reseller}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({engagement.rating})</span>
                    {engagement.verified && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">{engagement.deal.title}</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    <span>{engagement.deal.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{formatCurrency(engagement.deal.value)}</span>
                    <span>•</span>
                    <span>Close: {engagement.deal.closeDate}</span>
                  </div>
                  <div>
                    <Badge variant="info" className="text-xs">{engagement.deal.industry}</Badge>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Products Requested:</p>
                <div className="flex items-center gap-1 text-xs">
                  <Package className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{engagement.products.length} products</span>
                </div>
                <div className="mt-2 space-y-1">
                  {engagement.products?.slice(0, 2).map((product: string, idx: number) => (
                    <p key={idx} className="text-xs text-gray-700">• {product}</p>
                  ))}
                  {engagement.products.length > 2 && (
                    <p className="text-xs text-blue-600">+{engagement.products.length - 2} more</p>
                  )}
                </div>
              </div>

              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-800 mb-2">Effort Signals:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">Deal Registered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">BOQ Uploaded</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">{engagement.effort.timeInvested} days active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">Customer Verified</span>
                  </div>
                </div>
                <Badge variant="success" className="mt-2 text-xs">High Effort Score</Badge>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-1">Message:</p>
                <p className="text-xs text-gray-600 italic">"{engagement.message}"</p>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Requested {formatRelativeTime(engagement.requestedAt)}
              </div>

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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
