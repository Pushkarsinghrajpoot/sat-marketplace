'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Building, Shield } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { getPendingQualifications } from '@/lib/admin-helpers';
import Link from 'next/link';

export default function QualificationsPage() {
  const { user } = useSimpleAuth();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [pendingOrgs, setPendingOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      const [users, docs, orgs] = await Promise.all([
        getPendingQualifications({ type: 'users' }),
        getPendingQualifications({ type: 'documents' }),
        getPendingQualifications({ type: 'organizations' }),
      ]);

      setPendingUsers(users);
      setPendingDocs(docs);
      setPendingOrgs(orgs);
    } catch (error) {
      console.error('Error loading pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading qualifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Qualification Reviews</h1>
          <p className="text-gray-600">Review and approve pending user and organization qualifications</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingUsers.length}</p>
                  <p className="text-sm text-gray-600">Pending Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingDocs.length}</p>
                  <p className="text-sm text-gray-600">Pending Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingOrgs.length}</p>
                  <p className="text-sm text-gray-600">Pending Organizations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users ({pendingUsers.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({pendingDocs.length})</TabsTrigger>
            <TabsTrigger value="organizations">Organizations ({pendingOrgs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Pending User Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending user reviews</p>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default">{user.role}</Badge>
                              {user.organizations && (
                                <span className="text-xs text-gray-500">{user.organizations.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right mr-4">
                            <p className="text-xs text-gray-500">Submitted</p>
                            <p className="text-sm font-medium">
                              {user.qualification_submitted_at
                                ? new Date(user.qualification_submitted_at).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                          <Link href={`/admin/qualifications/${user.id}`}>
                            <Button>Review</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Pending Document Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingDocs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending documents</p>
                ) : (
                  <div className="space-y-3">
                    {pendingDocs.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <FileText className="h-8 w-8 text-purple-600" />
                          <div>
                            <p className="font-semibold">{doc.document_type}</p>
                            <p className="text-sm text-gray-600">{doc.file_name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {doc.organizations?.name} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => window.open(doc.file_url, '_blank')}>
                            View
                          </Button>
                          <Link href={`/admin/documents/${doc.id}`}>
                            <Button>Review</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle>Pending Organization Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingOrgs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending organizations</p>
                ) : (
                  <div className="space-y-3">
                    {pendingOrgs.map((org: any) => (
                      <div
                        key={org.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <Building className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-semibold">{org.name}</p>
                            <p className="text-sm text-gray-600">{org.type}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {org.users?.length || 0} users • Submitted{' '}
                              {org.qualification_submitted_at
                                ? new Date(org.qualification_submitted_at).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <Link href={`/admin/organizations/${org.id}/review`}>
                          <Button>Review</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
