export const ACL_PERMISSION_KEYS = ["Full_Access", "Create", "Edit", "View", "Delete"] as const;
export const EMPTY_PERMISSIONS = { Full_Access: false, Create: false, Edit: false, View: false, Delete: false };

export const expandUserActions = (actions: string[] = []) =>
  Array.from(new Set(actions.flatMap((action) => {
    const [resource, verb] = String(action).split(":");
    if (!verb) return [action];
    if (resource === "user") return [action, `staff:${verb}`];
    if (resource === "staff") return [action, `user:${verb}`];
    return [action];
  })));

export const mapModulesToPermissions = (modules: any[] = []) => {
  const result: Record<string, any> = {};
  modules.forEach((module) => {
    const perms = { ...EMPTY_PERMISSIONS };
    (module?.actions || []).forEach((action: string) => {
      const verb = String(action).split(":")[1];
      if (verb === "create") perms.Create = true;
      if (verb === "read") perms.View = true;
      if (verb === "update") perms.Edit = true;
      if (verb === "delete") perms.Delete = true;
    });
    perms.Full_Access = perms.Create && perms.View && perms.Edit && perms.Delete;
    result[module?.moduleKey] = perms;
  });
  return result;
};

export const getPermissionActionsForModule = (module: any, permissionKey: string) => {
  if (!module) return [];
  if (permissionKey === "Full_Access") return module.actions || [];
  return (module.actions || []).filter((action: string) => {
    const verb = String(action).split(":")[1];
    if (permissionKey === "Create") return verb === "create";
    if (permissionKey === "View") return verb === "read";
    if (permissionKey === "Edit") return verb === "update";
    if (permissionKey === "Delete") return verb === "delete";
    return false;
  });
};

export const getEnabledVerbs = (module: any) => {
  const verbs = new Set((module?.actions || []).map((a: string) => String(a).split(":")[1]).filter(Boolean));
  return {
    canCreate: verbs.has("create"),
    canRead: verbs.has("read"),
    canUpdate: verbs.has("update"),
    canDelete: verbs.has("delete"),
    canFullAccess: ["create", "read", "update", "delete"].every((v) => verbs.has(v)),
  };
};

export const buildModulesPayloadFromPermissions = (modules: any[] = [], permissions: Record<string, any> = {}) =>
  modules.map((module) => {
    const modulePerms = permissions[module.key] || EMPTY_PERMISSIONS;
    const actions = (module.actions || []).filter((action: string) => {
      const verb = String(action).split(":")[1];
      if (modulePerms.Full_Access) return true;
      if (verb === "create") return modulePerms.Create;
      if (verb === "read") return modulePerms.View;
      if (verb === "update") return modulePerms.Edit;
      if (verb === "delete") return modulePerms.Delete;
      return false;
    });
    const expanded = module.key === "USERS" ? expandUserActions(actions) : actions;
    return { moduleKey: module.key, enabled: expanded.length > 0, actions: expanded };
  });
