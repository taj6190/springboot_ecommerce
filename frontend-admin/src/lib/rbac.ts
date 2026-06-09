// Role-based access control configuration
// Maps each role to the sidebar sections and routes they can access

export type RoleKey = 'ROLE_ADMIN' | 'ROLE_PRODUCT_MANAGER' | 'ROLE_INVENTORY_MANAGER' | 'ROLE_CONTENT_EDITOR' | 'ROLE_CUSTOMER';

export interface Permission {
  allowedRoutes: string[];      // Route prefixes user can access
  sidebarSections: string[];    // Sidebar section titles to display
}

export const ROLE_PERMISSIONS: Record<RoleKey, Permission> = {
  ROLE_ADMIN: {
    allowedRoutes: ['/dashboard'],  // full access
    sidebarSections: ['Overview', 'Catalog', 'Sales', 'Content', 'Users', 'System'],
  },
  ROLE_PRODUCT_MANAGER: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/reports',
      '/dashboard/products',
      '/dashboard/categories',
      '/dashboard/brands',
      '/dashboard/tags',
      '/dashboard/inventory',
    ],
    sidebarSections: ['Overview', 'Catalog'],
  },
  ROLE_INVENTORY_MANAGER: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/inventory',
      '/dashboard/products',
    ],
    sidebarSections: ['Overview', 'Catalog'],
  },
  ROLE_CONTENT_EDITOR: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/sliders',
      '/dashboard/sections',
      '/dashboard/reviews',
      '/dashboard/static-pages',
    ],
    sidebarSections: ['Overview', 'Content'],
  },
  ROLE_CUSTOMER: {
    allowedRoutes: [],
    sidebarSections: [],
  },
};

/**
 * Check if user with given roles can access a route
 */
export function canAccess(userRoles: string[], route: string): boolean {
  if (userRoles.includes('ROLE_ADMIN')) return true;
  return userRoles.some((role) => {
    const perm = ROLE_PERMISSIONS[role as RoleKey];
    if (!perm) return false;
    return perm.allowedRoutes.some((allowed) =>
      route === allowed || route.startsWith(allowed + '/')
    );
  });
}

/**
 * Get combined sidebar sections for user roles
 */
export function getAllowedSections(userRoles: string[]): string[] {
  if (userRoles.includes('ROLE_ADMIN')) {
    return ROLE_PERMISSIONS.ROLE_ADMIN.sidebarSections;
  }
  const sections = new Set<string>();
  userRoles.forEach((role) => {
    const perm = ROLE_PERMISSIONS[role as RoleKey];
    if (perm) perm.sidebarSections.forEach((s) => sections.add(s));
  });
  return Array.from(sections);
}
