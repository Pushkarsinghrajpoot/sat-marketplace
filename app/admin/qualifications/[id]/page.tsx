'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { User, Building, Mail, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { 
  approveUserQualification, 
  rejectUserQualification, 
  requestAdditionalInfo,
  getOrganizationDocuments 
} from '@/lib/admin-helpers';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function UserReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user: admin } = useSimpleAuth();
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, [params.id]);

  const loadUserDetails = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          organizations (
            id,
            name,
            type,
            address,
            contact_number
          )
        `)
        .eq('id', params.id)
        .single();

      if (userError) throw userError;
      setUser(userData);

      if (userData.organization_id) {
        const docs = await getOrganizationDocuments(userData.organization_id);
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!admin?.id) return;
    
    setProcessing(true);
    try {
      const result = await approveUserQualification(params.id as string, admin.id, notes);
      if (result.success) {
        toast.success('User approved successfully');
        router.push('/admin/qualifications');
      } else {
        toast.error('Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!admin?.id || !notes) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const result = await rejectUserQualification(params.id as string, admin.id, notes);
      if (result.success) {
        toast.success('User rejected');
        router.push('/admin/qualifications');
      } else {
        toast.error('Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!admin?.id || !notes) {
      toast.error('Please specify what information is required');
      return;
    }

    setProcessing(true);
    try {
      const result = await requestAdditionalInfo(params.id as string, admin.id, notes);
      if (result.success) {
        toast.success('Information request sent');
        router.push('/admin/qualifications');
      } else {
        toast.error('Failed to send request');
      }
    } catch (error) {
      console.error('Error requesting info:', error);
      toast.error('Failed to send request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">User not found</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            ← Back to Qualifications
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Qualification Review</h1>
          <p className="text-gray-600">Review and approve user account qualification</p>
        </div>

        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Registered</p>
                    <p className="font-semibold">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Role</p>
                  <Badge variant="default">{user.role}</Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Qualification Status</p>
                  <Badge variant="warning">{user.qualification_status}</Badge>
                </div>

                {user.qualification_submitted_at && (
                  <div>
                    <p className="text-sm text-gray-600">Submitted At</p>
                    <p className="font-semibold">
                      {new Date(user.qualification_submitted_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Info */}
        {user.organizations && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Organization Name</p>
                    <p className="font-semibold">{user.organizations.name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <Badge>{user.organizations.type}</Badge>
                </div>

                {user.organizations.address && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{user.organizations.address}</p>
                  </div>
                )}

                {user.organizations.contact_number && (
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-semibold">{user.organizations.contact_number}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Organization Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{doc.document_type}</p>
                      <p className="text-sm text-gray-600">{doc.file_name}</p>
                      <Badge 
                        variant={
                          doc.status === 'APPROVED' ? 'success' : 
                          doc.status === 'REJECTED' ? 'danger' : 
                          'warning'
                        }
                        className="mt-1"
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      View Document
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Decision Panel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Review Decision</CardTitle>
          </CardHeader>
          <CardContent>
            {!action ? (
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  onClick={() => setAction('approve')}
                  className="flex items-center gap-2 h-24"
                >
                  <CheckCircle className="h-6 w-6" />
                  <span>Approve</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAction('request_info')}
                  className="flex items-center gap-2 h-24"
                >
                  <AlertCircle className="h-6 w-6" />
                  <span>Request Info</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setAction('reject')}
                  className="flex items-center gap-2 h-24"
                >
                  <XCircle className="h-6 w-6" />
                  <span>Reject</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-blue-900">
                    {action === 'approve' && 'Approving User Qualification'}
                    {action === 'reject' && 'Rejecting User Qualification'}
                    {action === 'request_info' && 'Requesting Additional Information'}
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    {action === 'approve' && 'User will gain marketplace access and receive approval notification'}
                    {action === 'reject' && 'User will be notified of rejection with your reason'}
                    {action === 'request_info' && 'User will be asked to provide additional information'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {action === 'approve' && 'Notes (Optional)'}
                    {action === 'reject' && 'Rejection Reason *'}
                    {action === 'request_info' && 'Information Required *'}
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      action === 'approve' ? 'Add any notes...' :
                      action === 'reject' ? 'Explain why the qualification is rejected...' :
                      'Specify what additional information is needed...'
                    }
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      if (action === 'approve') handleApprove();
                      else if (action === 'reject') handleReject();
                      else if (action === 'request_info') handleRequestInfo();
                    }}
                    disabled={processing || (action !== 'approve' && !notes)}
                    className="flex-1"
                  >
                    {processing ? 'Processing...' : 'Confirm'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAction(null);
                      setNotes('');
                    }}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
