'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Target, Package, Folder, User, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useSimpleAuth } from '@/lib/simple-auth';
import {
  createUserAssignment,
  getUserAssignments,
  deleteUserAssignment,
  getTeamMembers,
} from '@/lib/team-management';
import { supabase } from '@/lib/supabase';

const ASSIGNMENT_TYPES = [
  { value: 'PRODUCT', label: 'Product', icon: Package, color: 'blue' },
  { value: 'CATEGORY', label: 'Category', icon: Folder, color: 'purple' },
  { value: 'SUPPORT', label: 'Support', icon: User, color: 'green' },
  { value: 'SALES', label: 'Sales', icon: Target, color: 'orange' },
];

export default function AssignmentsPage() {
  const { user } = useSimpleAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: '',
    assignmentType: 'PRODUCT',
    referenceId: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.organizationId]);

  const loadData = async () => {
    if (!user?.organizationId) {
      console.log('No organization ID, skipping load');
      setLoading(false);
      return;
    }

    console.log('Loading assignments for organization:', user.organizationId);
    
    try {
      const [members, productsData] = await Promise.all([
        getTeamMembers(user.organizationId),
        loadProducts(),
      ]);

      console.log('Loaded team members:', members.length);
      console.log('Loaded products:', productsData.length);

      setTeamMembers(members);
      setProducts(productsData);

      // Load all assignments for the team
      const allAssignments: any[] = [];
      for (const member of members) {
        const memberAssignments = await getUserAssignments(member.id);
        console.log(`Assignments for ${member.name}:`, memberAssignments.length);
        allAssignments.push(
          ...memberAssignments.map((a: any) => ({ ...a, user: member }))
        );
      }
      
      console.log('Total assignments loaded:', allAssignments.length);
      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!user?.organizationId) return [];

    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku')
      .eq('organization_id', user.organizationId)
      .order('name');

    if (error) {
      console.error('Error loading products:', error);
      return [];
    }

    console.log('Loaded products for organization:', data?.length || 0);
    return data || [];
  };

  const handleCreateAssignment = async () => {
    if (!user?.id || !assignForm.userId || !assignForm.assignmentType) {
      toast.error('Please fill all required fields');
      return;
    }

    // For PRODUCT type, require reference ID
    if (assignForm.assignmentType === 'PRODUCT' && !assignForm.referenceId) {
      toast.error('Please select a product');
      return;
    }

    setSaving(true);
    try {
      const result = await createUserAssignment({
        userId: assignForm.userId,
        assignmentType: assignForm.assignmentType,
        referenceId: assignForm.referenceId || undefined,
        createdBy: user.id,
      });

      if (result.success) {
        toast.success('Assignment created successfully');
        setShowAssignModal(false);
        setAssignForm({ userId: '', assignmentType: 'PRODUCT', referenceId: '' });
        loadData();
      } else {
        toast.error('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Remove this assignment?')) return;

    try {
      const result = await deleteUserAssignment(assignmentId);
      if (result.success) {
        toast.success('Assignment removed');
        loadData();
      } else {
        toast.error('Failed to remove assignment');
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? `${product.name} (${product.sku})` : 'Unknown Product';
  };

  const getAssignmentLabel = (assignment: any) => {
    if (assignment.assignment_type === 'PRODUCT' && assignment.reference_id) {
      return getProductName(assignment.reference_id);
    }
    return assignment.assignment_type;
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      </div>
    );
  }

  const assignmentsByType = ASSIGNMENT_TYPES.map((type) => ({
    ...type,
    assignments: assignments.filter((a) => a.assignment_type === type.value),
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Assignments</h1>
            <p className="text-gray-600">Assign team members to products, categories, and roles</p>
          </div>
          <Button onClick={() => setShowAssignModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {teamMembers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No team members found. Add team members first.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {assignmentsByType.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.value}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 text-${type.color}-600`} />
                      <CardTitle>{type.label} Assignments</CardTitle>
                      <Badge variant="default" className="ml-auto">
                        {type.assignments.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {type.assignments.length === 0 ? (
                      <p className="text-center text-gray-500 py-4 text-sm">
                        No {type.label.toLowerCase()} assignments
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {type.assignments.map((assignment: any) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-sm">{assignment.user?.name}</p>
                              <p className="text-xs text-gray-600">
                                {getAssignmentLabel(assignment)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How Assignments Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Product Assignments</p>
                  <p>Assign users to specific products. Inquiries about these products will be routed to them.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Folder className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Category Assignments</p>
                  <p>Assign users to product categories for broader coverage.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Support Assignments</p>
                  <p>Designate support specialists who handle general inquiries.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Sales Assignments</p>
                  <p>Assign sales representatives for deal management.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Create Assignment</h3>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Team Member * <span className="text-xs text-gray-500">(from your organization)</span>
                    </label>
                    <Select
                      value={assignForm.userId}
                      onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                    >
                      <option value="">Select team member</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.team_role || member.role}
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Showing {teamMembers.length} team member(s) from your organization
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Assignment Type *</label>
                    <Select
                      value={assignForm.assignmentType}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          assignmentType: e.target.value,
                          referenceId: '',
                        })
                      }
                    >
                      {ASSIGNMENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {assignForm.assignmentType === 'PRODUCT' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Product *</label>
                      <Select
                        value={assignForm.referenceId}
                        onChange={(e) =>
                          setAssignForm({ ...assignForm, referenceId: e.target.value })
                        }
                      >
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Auto-Routing:</strong> Messages and inquiries will be automatically
                      assigned to this team member based on this assignment.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleCreateAssignment}
                    disabled={saving || !assignForm.userId}
                    className="flex-1"
                  >
                    {saving ? 'Creating...' : 'Create Assignment'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
