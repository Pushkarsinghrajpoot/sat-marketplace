'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  User, 
  Calendar, 
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageCircle
} from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

export default function InquiriesPage() {
  const { user } = useSimpleAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('product_inquiries')
        .select(`
          *,
          products (*),
          user:users!product_inquiries_user_id_fkey (
            id,
            name,
            email,
            avatar
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setInquiries(data || []);
    } catch (error) {
      console.error('Error loading inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" /> Open</Badge>;
      case 'RESPONDED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Responded</Badge>;
      case 'CLOSED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Closed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = searchTerm === '' || 
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.user?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Product Inquiries</h1>
        <p className="text-gray-600 mt-2">Manage customer inquiries about your products</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="RESPONDED">Responded</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No inquiries found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'No inquiries match your filters'
                : 'No inquiries have been submitted yet'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{inquiry.subject}</h3>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <p className="text-gray-600 line-clamp-2">{inquiry.question}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/reseller/inquiries/${inquiry.id}`}>
                      <Button variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {/* Customer Info */}
                  <div className="flex items-center gap-2">
                    {inquiry.user?.avatar ? (
                      <img 
                        src={inquiry.user.avatar} 
                        alt={inquiry.user.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                    <span>{inquiry.user?.name}</span>
                  </div>

                  {/* Product Info */}
                  {inquiry.products && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span>{inquiry.products.name}</span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                  </div>

                  {inquiry.responded_at && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Responded {new Date(inquiry.responded_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
