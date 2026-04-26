'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function DistributorInquiriesPage() {
  const { user, organization } = useSimpleAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'responded'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization || user?.organizationId) {
      loadInquiries();
    }
  }, [organization, user?.organizationId, filter]);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const organizationId = organization?.id || user?.organizationId;
      if (!organizationId) {
        setInquiries([]);
        return;
      }

      let query = supabase
        .from('product_inquiries')
        .select(`
          *,
          products!inner (
            id,
            name,
            sku,
            organization_id
          ),
          user:users!product_inquiries_user_id_fkey (
            id,
            name,
            email,
            organizations (
              id,
              name,
              type
            )
          )
        `)
        .eq('products.organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        const statusMap = {
          open: 'OPEN',
          responded: 'RESPONDED'
        };
        query = query.eq('status', statusMap[filter]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error loading inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Inquiries</h1>
          <p className="text-gray-600">Manage customer inquiries and quote requests</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Inquiries
        </Button>
        <Button
          variant={filter === 'open' ? 'primary' : 'outline'}
          onClick={() => setFilter('open')}
        >
          Open
        </Button>
        <Button
          variant={filter === 'responded' ? 'primary' : 'outline'}
          onClick={() => setFilter('responded')}
        >
          Responded
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading inquiries...</p>
          </CardContent>
        </Card>
      ) : inquiries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No inquiries found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={inquiry.status === 'OPEN' ? 'warning' : 'success'}>
                        {inquiry.status}
                      </Badge>
                      <Badge>{inquiry.inquiry_type}</Badge>
                      {inquiry.status === 'OPEN' && (
                        <Badge variant="danger">Action Required</Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{inquiry.subject}</h3>
                    <p className="text-gray-700 mb-3">{inquiry.question}</p>

                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      {inquiry.products && (
                        <div>
                          <p className="text-sm text-gray-600">Product</p>
                          <p className="font-medium">{inquiry.products.name}</p>
                          <p className="text-sm text-gray-500">SKU: {inquiry.products.sku}</p>
                        </div>
                      )}
                      {inquiry.user && (
                        <div>
                          <p className="text-sm text-gray-600">From</p>
                          <p className="font-medium">{inquiry.user.name}</p>
                          <p className="text-sm text-gray-500">{inquiry.user.email}</p>
                          {inquiry.user.organizations && (
                            <Badge variant="info" className="mt-1">
                              {inquiry.user.organizations.type}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  <Link href={`/distributor/inquiries/${inquiry.id}`}>
                    <Button>
                      <Eye className="h-4 w-4 mr-2" />
                      {inquiry.status === 'OPEN' ? 'Respond' : 'View'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
