'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Save, RotateCcw } from 'lucide-react';
import { 
  TeamRole, 
  Permission, 
  DEFAULT_TEAM_ROLE_PERMISSIONS,
  RESELLER_ROUTES,
  DISTRIBUTOR_ROUTES
} from '@/lib/rbac/permissions';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RolePermissionsManagerProps {
  userId: string;
  userName: string;
  userRole: 'RESELLER' | 'DISTRIBUTOR' | 'END_USER';
  currentTeamRole: TeamRole;
  currentPermissions: Permission[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function RolePermissionsManager({
  userId,
  userName,
  userRole,
  currentTeamRole,
  currentPermissions,
  onClose,
  onUpdate
}: RolePermissionsManagerProps) {
  const [selectedTeamRole, setSelectedTeamRole] = useState<TeamRole>(currentTeamRole);
  const [customPermissions, setCustomPermissions] = useState<Permission[]>(currentPermissions);
  const [useCustomPermissions, setUseCustomPermissions] = useState(currentPermissions.length > 0);
  const [saving, setSaving] = useState(false);

  // Get available modules from routes
  const availableRoutes = userRole === 'RESELLER' ? RESELLER_ROUTES : DISTRIBUTOR_ROUTES;
  const modules = Array.from(new Set(
    availableRoutes
      .filter(r => r.requiredPermissions)
      .flatMap(r => r.requiredPermissions!.map(p => p.module))
  ));

  const actions: Array<'view' | 'create' | 'edit' | 'delete' | 'manage'> = [
    'view', 'create', 'edit', 'delete', 'manage'
  ];

  const hasPermission = (module: string, action: string): boolean => {
    const perms = useCustomPermissions ? customPermissions : DEFAULT_TEAM_ROLE_PERMISSIONS[selectedTeamRole] || [];
    
    // Check for wildcard
    if (perms.some(p => p.module === '*' && p.action === 'manage')) return true;
    
    return perms.some(p => {
      if (p.module !== module) return false;
      if (p.action === 'manage') return true;
      if (p.action === action) return true;
      return false;
    });
  };

  const togglePermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'manage') => {
    setCustomPermissions(prev => {
      const exists = prev.some(p => p.module === module && p.action === action);
      
      if (exists) {
        // Remove permission
        return prev.filter(p => !(p.module === module && p.action === action));
      } else {
        // Add permission
        return [...prev, { module, action }];
      }
    });
  };

  const resetToDefaults = () => {
    setUseCustomPermissions(false);
    setCustomPermissions([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const permissions = useCustomPermissions ? customPermissions : [];
      
      const { error } = await supabase
        .from('users')
        .update({
          team_role: selectedTeamRole,
          permissions: permissions
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Permissions updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const defaultPermissions = DEFAULT_TEAM_ROLE_PERMISSIONS[selectedTeamRole] || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Permissions - {userName}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Configure role and permissions for this team member
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {/* Team Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Team Role</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(['ADMIN', 'MANAGER', 'SALES', 'SUPPORT', 'MEMBER'] as TeamRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedTeamRole(role)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTeamRole === role
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Permissions Toggle */}
          <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium">Use Custom Permissions</label>
              <p className="text-xs text-gray-500 mt-1">
                {useCustomPermissions 
                  ? 'Using custom permissions instead of role defaults'
                  : `Using default permissions for ${selectedTeamRole} role`
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              {useCustomPermissions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              )}
              <Switch
                checked={useCustomPermissions}
                onCheckedChange={setUseCustomPermissions}
              />
            </div>
          </div>

          {/* Permissions Grid */}
          {useCustomPermissions ? (
            <div>
              <h3 className="text-sm font-medium mb-3">Custom Permissions</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Module
                      </th>
                      {actions.map(action => (
                        <th key={action} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {modules.map(module => (
                      <tr key={module}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                          {module}
                        </td>
                        {actions.map(action => (
                          <td key={action} className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={hasPermission(module, action)}
                              onChange={() => togglePermission(module, action)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-medium mb-3">
                Default Permissions for {selectedTeamRole}
              </h3>
              <div className="flex flex-wrap gap-2">
                {defaultPermissions.map((perm, index) => (
                  <Badge key={index} variant="secondary">
                    {perm.module === '*' ? 'All Modules' : perm.module}: {perm.action}
                  </Badge>
                ))}
              </div>
              {defaultPermissions.length === 0 && (
                <p className="text-sm text-gray-500">No default permissions for this role</p>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer Actions */}
        <div className="border-t p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
