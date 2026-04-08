'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search, MessageSquare, Clock, CheckCircle, AlertCircle,
  ArrowRight, Filter, Calendar, User, Building2, Package,
  Eye, RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getDirectQueries } from '@/lib/data-helpers';
import { useSimpleAuth } from '@/lib/simple-auth';
import { formatDistanceToNow } from 'date-fns';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    OPEN: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <AlertCircle className="h-3 w-3" /> },
    RESPONDED: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
    CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <CheckCircle className="h-3 w-3" /> },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-3 w-3" /> },
  };
  const config = map[status] || map.OPEN;
  return (
    <Badge className={`${config.bg} ${config.text} flex items-center gap-1`}>
      {config.icon}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

export default function DistributorQueriesPage() {
  const { user } = useSimpleAuth();
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchQueries();
  }, [user?.id]);

  const fetchQueries = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const queriesData = await getDirectQueries({ 
        userRole: 'DISTRIBUTOR', 
        distributorId: user.organizationId 
      });
      console.log('Queries data:', queriesData); // Debug log
      setQueries(queriesData || []);
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = !searchTerm || 
      query.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.requirement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.customer_company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || query.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: queries.length,
    open: queries.filter(q => q.status === 'OPEN').length,
    responded: queries.filter(q => q.status === 'RESPONDED').length,
    closed: queries.filter(q => q.status === 'CLOSED').length,
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-[#09090B] mb-1">Direct Queries</h1>
          <p className="text-[13px] text-gray-500">Manage customer inquiries and direct queries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchQueries}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Queries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                <p className="text-sm text-gray-500">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.responded}</p>
                <p className="text-sm text-gray-500">Responded</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
                <p className="text-sm text-gray-500">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search queries by subject, customer, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="RESPONDED">Responded</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queries List */}
      {filteredQueries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' ? 'No queries match your filters' : 'No queries yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Direct customer queries will appear here'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((query) => (
            <Card key={query.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {query.title || 'Untitled Query'}
                      </h3>
                      <StatusBadge status={query.status} />
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {query.requirement || 'No requirement provided'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {query.customer_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{query.customer_name}</span>
                        </div>
                      )}
                      {query.customer_company && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{query.customer_company}</span>
                        </div>
                      )}
                      {query.estimatedBudget && (
                        <div className="flex items-center gap-1">
                          <span>Budget: {formatCurrency(query.estimatedBudget)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {(() => {
                            console.log('Query createdAt:', query.createdAt, typeof query.createdAt);
                            if (!query.createdAt) return 'No date';
                            
                            try {
                              const date = new Date(query.createdAt);
                              if (isNaN(date.getTime())) return 'Invalid date';
                              return formatDistanceToNow(date, { addSuffix: true });
                            } catch (error) {
                              console.error('Date parsing error:', error);
                              return 'Date error';
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/distributor/queries/${query.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
