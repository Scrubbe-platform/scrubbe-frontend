"use client";

import { ReactNode } from "react";
import type { UserRole } from "@/auth";
import useAuthStore from "@/lib/stores/auth.store";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * RoleGuard Component
 * 
 * A wrapper component that conditionally renders children based on user roles.
 * 
 * @example
 * ```tsx
 * <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
 *   <AdminDashboard />
 * </RoleGuard>
 * 
 * <RoleGuard 
 *   allowedRoles={["SUPER_ADMIN"]} 
 *   fallback={<div>Super Admin only</div>}
 * >
 *   <SuperAdminPanel />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user, isLoading } = useAuthStore();

  // While loading, show nothing or a loading state
  if (isLoading) {
    return null;
  }

  // Not authenticated
  if (!user?.roles) {
    return <>{fallback}</>;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = allowedRoles.some(role => 
    user.roles?.includes(role)
  );

  if (!hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * AdminGuard Component
 * 
 * Shortcut for ADMIN and SUPER_ADMIN roles
 */
export function AdminGuard({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * SuperAdminGuard Component
 * 
 * Shortcut for SUPER_ADMIN role only
 */
export function SuperAdminGuard({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Hook to check user roles
 */
export function useRoleCheck() {
  const { user } = useAuthStore();

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user?.roles) return false;
    return roles.some(role => user.roles?.includes(role));
  };

  const isAdmin = (): boolean => hasRole(["ADMIN", "SUPER_ADMIN"]);
  const isSuperAdmin = (): boolean => hasRole(["SUPER_ADMIN"]);
  const isUser = (): boolean => hasRole(["USER"]);

  return {
    hasRole,
    isAdmin,
    isSuperAdmin,
    isUser,
    roles: user?.roles || [],
  };
}
