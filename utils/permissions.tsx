type PermissionsByResource = Record<string, string[]>;

export const normalizePermissionKey = (value = "") => String(value).trim().toLowerCase();

export const normalizePermissions = (source: Record<string, unknown> = {}) => {
  const normalized: PermissionsByResource = {};
  Object.entries(source || {}).forEach(([resource, actions]) => {
    const list = Array.isArray(actions) ? actions : [];
    normalized[normalizePermissionKey(resource)] = list.map((action) => normalizePermissionKey(String(action)));
  });
  return normalized;
};

export const hasResourcePermission = (permissionsByResource: PermissionsByResource, resource?: string, action?: string) => {
  if (!resource || !action) return false;
  const actions = permissionsByResource?.[normalizePermissionKey(resource)] || [];
  return actions.includes(normalizePermissionKey(action));
};

export const hasPermission = (permissionsByResource: PermissionsByResource, requirement: any): boolean => {
  if (!requirement) return true;
  if (requirement.anyOf) return requirement.anyOf.some((req: any) => hasPermission(permissionsByResource, req));
  if (requirement.allOf) return requirement.allOf.every((req: any) => hasPermission(permissionsByResource, req));
  if (!requirement.resource || !requirement.action) return false;
  return hasResourcePermission(permissionsByResource, requirement.resource, requirement.action);
};
