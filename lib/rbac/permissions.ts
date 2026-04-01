// Role-Based Access Control (RBAC) System
// Defines permissions for different team roles across organization types

export type TeamRole = 'ADMIN' | 'MANAGER' | 'SALES' | 'SUPPORT' | 'MEMBER';
export type UserRole = 'RESELLER' | 'DISTRIBUTOR' | 'END_USER' | 'PLATFORM_ADMIN';

export type Permission = {
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage';
  resource?: string;
};

export type RoutePermission = {
  path: string;
  label: string;
  icon?: string;
  requiredPermissions?: Permission[];
  teamRoles?: TeamRole[]; // If specified, only these team roles can access
};

// Default permissions for each team role within an organization
export const DEFAULT_TEAM_ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  ADMIN: [
    // Full access to everything within their organization
    { module: '*', action: 'manage' },
  ],
  MANAGER: [
    // Deals & Quotes
    { module: 'deals', action: 'view' },
    { module: 'deals', action: 'create' },
    { module: 'deals', action: 'edit' },
    { module: 'quotes', action: 'view' },
    { module: 'quotes', action: 'create' },
    { module: 'quotes', action: 'edit' },
    // Products & Services
    { module: 'products', action: 'view' },
    { module: 'services', action: 'view' },
    // Messages & Inquiries
    { module: 'messages', action: 'view' },
    { module: 'messages', action: 'create' },
    { module: 'inquiries', action: 'view' },
    { module: 'inquiries', action: 'create' },
    // Team (view only)
    { module: 'team', action: 'view' },
    // Analytics
    { module: 'analytics', action: 'view' },
    // Ratings
    { module: 'ratings', action: 'view' },
    // Credit
    { module: 'credit', action: 'view' },
  ],
  SALES: [
    // Deals & Quotes
    { module: 'deals', action: 'view' },
    { module: 'deals', action: 'create' },
    { module: 'quotes', action: 'view' },
    // Products & Services
    { module: 'products', action: 'view' },
    { module: 'services', action: 'view' },
    // Messages & Inquiries
    { module: 'messages', action: 'view' },
    { module: 'messages', action: 'create' },
    { module: 'inquiries', action: 'view' },
    { module: 'inquiries', action: 'create' },
    // Queries
    { module: 'queries', action: 'view' },
    { module: 'queries', action: 'create' },
    // Credit
    { module: 'credit', action: 'view' },
  ],
  SUPPORT: [
    // Messages & Inquiries (full access)
    { module: 'messages', action: 'view' },
    { module: 'messages', action: 'create' },
    { module: 'messages', action: 'edit' },
    { module: 'inquiries', action: 'view' },
    { module: 'inquiries', action: 'create' },
    { module: 'inquiries', action: 'edit' },
    // Products & Services (view only)
    { module: 'products', action: 'view' },
    { module: 'services', action: 'view' },
    // Deals (view only)
    { module: 'deals', action: 'view' },
  ],
  MEMBER: [
    // Basic view access only
    { module: 'deals', action: 'view' },
    { module: 'products', action: 'view' },
    { module: 'services', action: 'view' },
    { module: 'messages', action: 'view' },
  ],
};

// Route definitions for different user roles
export const RESELLER_ROUTES: RoutePermission[] = [
  { path: '/reseller/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { 
    path: '/reseller/deals', 
    label: 'Deals', 
    icon: 'Briefcase',
    requiredPermissions: [{ module: 'deals', action: 'view' }]
  },
  { 
    path: '/reseller/deals/register', 
    label: 'Register Deal', 
    icon: 'PlusCircle',
    requiredPermissions: [{ module: 'deals', action: 'create' }]
  },
  { 
    path: '/reseller/quotes', 
    label: 'Quotes', 
    icon: 'FileText',
    requiredPermissions: [{ module: 'quotes', action: 'view' }]
  },
  { 
    path: '/reseller/queries', 
    label: 'Direct Queries', 
    icon: 'MessageSquare',
    requiredPermissions: [{ module: 'queries', action: 'view' }]
  },
  { 
    path: '/reseller/credit', 
    label: 'Credit', 
    icon: 'CreditCard',
    requiredPermissions: [{ module: 'credit', action: 'view' }]
  },
  { 
    path: '/reseller/products', 
    label: 'Products', 
    icon: 'Package',
    requiredPermissions: [{ module: 'products', action: 'view' }]
  },
  { 
    path: '/reseller/services', 
    label: 'Services', 
    icon: 'Wrench',
    requiredPermissions: [{ module: 'services', action: 'view' }]
  },
  { 
    path: '/reseller/messages', 
    label: 'Messages', 
    icon: 'Mail',
    requiredPermissions: [{ module: 'messages', action: 'view' }]
  },
  { 
    path: '/reseller/analytics', 
    label: 'Analytics', 
    icon: 'BarChart',
    requiredPermissions: [{ module: 'analytics', action: 'view' }]
  },
  { 
    path: '/reseller/ratings', 
    label: 'Ratings', 
    icon: 'Star',
    requiredPermissions: [{ module: 'ratings', action: 'view' }]
  },
  { 
    path: '/reseller/team', 
    label: 'Team', 
    icon: 'Users',
    requiredPermissions: [{ module: 'team', action: 'view' }]
  },
  { 
    path: '/reseller/team/assignments', 
    label: 'Team Assignments', 
    icon: 'UserCog',
    teamRoles: ['ADMIN'],
    requiredPermissions: [{ module: 'team', action: 'manage' }]
  },
  { 
    path: '/reseller/orders', 
    label: 'Orders', 
    icon: 'ShoppingBag',
    requiredPermissions: [{ module: 'deals', action: 'view' }]
  },
  { 
    path: '/reseller/customers', 
    label: 'Customers', 
    icon: 'Users',
    requiredPermissions: [{ module: 'deals', action: 'view' }]
  },
  { 
    path: '/reseller/inquiries', 
    label: 'Inquiries', 
    icon: 'HelpCircle',
    requiredPermissions: [{ module: 'inquiries', action: 'view' }]
  },
  { 
    path: '/reseller/settings', 
    label: 'Settings', 
    icon: 'Settings',
    teamRoles: ['ADMIN'] // Only admins can access settings
  },
];

export const DISTRIBUTOR_ROUTES: RoutePermission[] = [
  { path: '/distributor/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { 
    path: '/distributor/deals', 
    label: 'Deals', 
    icon: 'Briefcase',
    requiredPermissions: [{ module: 'deals', action: 'view' }]
  },
  { 
    path: '/distributor/quotes', 
    label: 'Quotes', 
    icon: 'FileText',
    requiredPermissions: [{ module: 'quotes', action: 'view' }]
  },
  { 
    path: '/distributor/queries', 
    label: 'Queries', 
    icon: 'MessageSquare',
    requiredPermissions: [{ module: 'queries', action: 'view' }]
  },
  { 
    path: '/distributor/credit', 
    label: 'Credit', 
    icon: 'CreditCard',
    requiredPermissions: [{ module: 'credit', action: 'view' }]
  },
  { 
    path: '/distributor/inquiries', 
    label: 'Inquiries', 
    icon: 'HelpCircle',
    requiredPermissions: [{ module: 'inquiries', action: 'view' }]
  },
  { 
    path: '/distributor/products', 
    label: 'Products', 
    icon: 'Package',
    requiredPermissions: [{ module: 'products', action: 'view' }]
  },
  { 
    path: '/distributor/messages', 
    label: 'Messages', 
    icon: 'Mail',
    requiredPermissions: [{ module: 'messages', action: 'view' }]
  },
  { 
    path: '/distributor/campaigns', 
    label: 'Campaigns', 
    icon: 'Megaphone',
    requiredPermissions: [{ module: 'campaigns', action: 'view' }],
    teamRoles: ['ADMIN', 'MANAGER']
  },
  { 
    path: '/distributor/analytics', 
    label: 'Analytics', 
    icon: 'BarChart',
    requiredPermissions: [{ module: 'analytics', action: 'view' }]
  },
  { 
    path: '/distributor/ratings', 
    label: 'Ratings', 
    icon: 'Star',
    requiredPermissions: [{ module: 'ratings', action: 'view' }]
  },
  { 
    path: '/distributor/team', 
    label: 'Team', 
    icon: 'Users',
    requiredPermissions: [{ module: 'team', action: 'view' }]
  },
  { 
    path: '/distributor/team/assignments', 
    label: 'Team Assignments', 
    icon: 'UserCog',
    teamRoles: ['ADMIN'],
    requiredPermissions: [{ module: 'team', action: 'manage' }]
  },
  { 
    path: '/distributor/settings', 
    label: 'Settings', 
    icon: 'Settings',
    teamRoles: ['ADMIN']
  },
];

export const END_USER_ROUTES: RoutePermission[] = [
  { path: '/end-user/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/end-user/my-leads', label: 'My Requests', icon: 'FileText' },
  { path: '/end-user/orders', label: 'My Orders', icon: 'ShoppingBag' },
];

// Helper function to check if user has permission
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  // Check for wildcard admin access
  if (userPermissions.some(p => p.module === '*' && p.action === 'manage')) {
    return true;
  }

  return userPermissions.some(p => {
    // Module must match
    if (p.module !== requiredPermission.module) return false;

    // Check action hierarchy
    if (p.action === 'manage') return true;
    if (p.action === requiredPermission.action) return true;

    return false;
  });
}

// Check if user has all required permissions
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(req => hasPermission(userPermissions, req));
}

// Get accessible routes for a user based on their permissions and team role
export function getAccessibleRoutes(
  userRole: UserRole,
  teamRole: TeamRole | null,
  customPermissions: Permission[] | null
): RoutePermission[] {
  let allRoutes: RoutePermission[] = [];

  // Get base routes for user role
  switch (userRole) {
    case 'RESELLER':
      allRoutes = RESELLER_ROUTES;
      break;
    case 'DISTRIBUTOR':
      allRoutes = DISTRIBUTOR_ROUTES;
      break;
    case 'END_USER':
      allRoutes = END_USER_ROUTES;
      break;
    case 'PLATFORM_ADMIN':
      return []; // Platform admins have different routes
  }

  // If no team role, they're the owner - return all routes
  if (!teamRole) {
    return allRoutes;
  }

  // Get user's permissions (custom or default for their team role)
  const userPermissions = customPermissions || DEFAULT_TEAM_ROLE_PERMISSIONS[teamRole] || [];

  // Filter routes based on permissions and team role restrictions
  return allRoutes.filter(route => {
    // Check team role restrictions
    if (route.teamRoles && !route.teamRoles.includes(teamRole)) {
      return false;
    }

    // Check permission requirements
    if (route.requiredPermissions) {
      return hasAllPermissions(userPermissions, route.requiredPermissions);
    }

    // If no specific requirements, allow access
    return true;
  });
}

// Merge custom permissions with default permissions
export function mergePermissions(
  defaultPermissions: Permission[],
  customPermissions: Permission[]
): Permission[] {
  const merged = [...defaultPermissions];
  
  customPermissions.forEach(custom => {
    const existingIndex = merged.findIndex(
      p => p.module === custom.module && p.resource === custom.resource
    );
    
    if (existingIndex >= 0) {
      merged[existingIndex] = custom;
    } else {
      merged.push(custom);
    }
  });
  
  return merged;
}
