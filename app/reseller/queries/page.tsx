'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Search, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { getDirectQueries } from '@/lib/data-helpers';
import { useAuthStore } from '@/lib/store';

export default function QueriesPage() {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchQueries();
  }, [user]);

  const fetchQueries = async () => {
    if (!user?.id) return;
    
    try {
      const data = await getDirectQueries({ userId: user.id });
      setQueries(data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800',
    };
    return colors[urgency as keyof typeof colors] || colors.MEDIUM;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESPONDED':
        return (
          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            <CheckCircle className="h-3 w-3" />
            Responded
          </span>
        );
      case 'CLOSED':
        return (
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
            Closed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            Open
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Direct Queries</h1>
          <p className="text-gray-600">Send queries directly to distributors for quick responses</p>
        </div>
        <Link href="/reseller/queries/create">
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Create Query
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search queries..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {queries.map((query) => (
          <Card key={query.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{query.title}</h3>
                    {getStatusBadge(query.status)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyBadge(query.urgency)}`}>
                      {query.urgency}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{query.requirement}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created: {new Date(query.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      0 responses
                    </span>
                  </div>
                </div>
                <Button variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {queries.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No queries yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Create a direct query to get quick responses from distributors
            </p>
            <Link href="/reseller/queries/create">
              <Button>Create Your First Query</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
