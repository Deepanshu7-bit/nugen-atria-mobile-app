import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useAsync } from "../hooks/useAsync";
import { getPermissions } from "../services/api/permissions";
import {
  hasPermission,
  hasResourcePermission,
  normalizePermissions,
} from "../utils/permissions";
import { useAuth } from "./AuthContext";

const PermissionsContext = createContext(null);

export function PermissionsProvider({ children }) {
  const { token, user: authUser } = useAuth();

  const { data, loading, error } = useAsync(
    () => (token ? getPermissions(token) : null),
    [token],
    {
      enabled: !!token,
      cacheKey: token ? `permissions:${token}` : null,
    },
  );

  const fallbackPermissionsByResource = useMemo(() => {
    const entries = {};
    (authUser?.permissions || []).forEach((item) => {
      if (!item?.resource || !item?.action) return;
      const key = item.resource.trim().toLowerCase();
      entries[key] = entries[key] || [];
      if (!entries[key].includes(item.action.trim().toLowerCase())) {
        entries[key].push(item.action.trim().toLowerCase());
      }
    });
    return entries;
  }, [authUser?.permissions]);

  const permissionsByResource = useMemo(() => {
    const source = data?.data?.permissionsByResource ?? fallbackPermissionsByResource;
    return normalizePermissions(source);
  }, [data, fallbackPermissionsByResource]);

  const canResource = useCallback(
    (resource, action) =>
      hasResourcePermission(permissionsByResource, resource, action),
    [permissionsByResource],
  );

  const can = useCallback(
    (resourceOrRequirement, action) => {
      if (!resourceOrRequirement) return true;
      if (typeof resourceOrRequirement === "string") {
        return canResource(resourceOrRequirement, action || "");
      }
      return hasPermission(permissionsByResource, resourceOrRequirement);
    },
    [canResource, permissionsByResource],
  );

  const user = data?.data?.user || authUser || null;
  const effectiveRole = data?.data?.effectiveRole || authUser?.role || null;
  const permissions = data?.data?.permissions ?? authUser?.permissions ?? [];

  return (
    <PermissionsContext.Provider
      value={{
        loading,
        error,
        permissions,
        permissionsByResource,
        user,
        effectiveRole,
        hasPermissions: Object.keys(permissionsByResource).length > 0,
        can,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return context;
};
