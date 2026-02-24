import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createRole, getRoleModules, updateRole } from "../services/api/roles";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { styles } from "../styles/components/RoleModal.styles";

type Props = {
  visible: boolean;
  token?: string | null;
  organizationId?: string | null;
  hotelId?: string | null;
  editingRole?: any;
  readOnly?: boolean;
  onClose?: () => void;
  onSaved?: () => void;
};

type ModulePermState = {
  fullAccess: boolean;
  create: boolean;
  view: boolean;
  edit: boolean;
  remove: boolean;
};

const EMPTY_PERM: ModulePermState = {
  fullAccess: false,
  create: false,
  view: false,
  edit: false,
  remove: false,
};

const extractModules = (payload: any) => {
  const modulesMap = payload?.data?.data?.modules || payload?.data?.modules || payload?.modules || null;
  if (modulesMap && !Array.isArray(modulesMap) && typeof modulesMap === "object") {
    return Object.values(modulesMap);
  }
  const list = payload?.data?.data || payload?.data || payload || [];
  return Array.isArray(list) ? list : [];
};

const readVerb = (action: string) => String(action || "").split(":")[1] || "";

const mapActionsToPerms = (actions: string[] = []): ModulePermState => {
  const has = (verb: string) => actions.some((action) => readVerb(action).toLowerCase() === verb);
  const create = has("create");
  const view = has("read");
  const edit = has("update");
  const remove = has("delete");
  return { fullAccess: create && view && edit && remove, create, view, edit, remove };
};

export function RoleModal({
  visible,
  token,
  organizationId,
  hotelId,
  editingRole,
  readOnly,
  onClose,
  onSaved,
}: Props) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modulePerms, setModulePerms] = useState<Record<string, ModulePermState>>({});

  const { data: modulesData } = useAsync(
    () => (token && visible ? getRoleModules(token) : null),
    [token, visible],
    { enabled: !!token && visible, cacheKey: token ? `role-modules:${token}` : null },
  );
  const modules = useMemo(() => extractModules(modulesData), [modulesData]);

  useEffect(() => {
    if (!visible) return;
    setName(String(editingRole?.name || ""));
    setDescription(String(editingRole?.description || ""));
    setError("");
  }, [visible, editingRole]);

  useEffect(() => {
    if (!visible || !modules.length) return;
    const next: Record<string, ModulePermState> = {};
    modules.forEach((module: any) => {
      const key = String(module?.key || module?.moduleKey || "");
      next[key] = { ...EMPTY_PERM };
    });
    const roleModules = Array.isArray(editingRole?.modules) ? editingRole.modules : [];
    roleModules.forEach((module: any) => {
      const key = String(module?.moduleKey || module?.key || "");
      if (!key) return;
      next[key] = mapActionsToPerms(Array.isArray(module?.actions) ? module.actions : []);
    });
    setModulePerms(next);
  }, [visible, modules, editingRole]);

  const togglePerm = (moduleKey: string, field: keyof ModulePermState, value: boolean) => {
    if (readOnly) return;
    setModulePerms((prev) => {
      const current = prev[moduleKey] || { ...EMPTY_PERM };
      const next = { ...current, [field]: value };
      if (field === "fullAccess") {
        next.create = value;
        next.view = value;
        next.edit = value;
        next.remove = value;
      }
      next.fullAccess = next.create && next.view && next.edit && next.remove;
      return { ...prev, [moduleKey]: next };
    });
  };

  const buildModulesPayload = () => {
    return modules.map((module: any) => {
      const moduleKey = String(module?.key || module?.moduleKey || "");
      const availableActions = Array.isArray(module?.actions) ? module.actions : [];
      const perms = modulePerms[moduleKey] || EMPTY_PERM;
      const selectedActions = availableActions.filter((action: string) => {
        const verb = readVerb(action).toLowerCase();
        if (perms.fullAccess) return true;
        if (verb === "create") return perms.create;
        if (verb === "read") return perms.view;
        if (verb === "update") return perms.edit;
        if (verb === "delete") return perms.remove;
        return false;
      });
      return {
        moduleKey,
        enabled: selectedActions.length > 0,
        actions: selectedActions,
      };
    });
  };

  const save = async () => {
    if (!token || readOnly) return;
    if (!name.trim()) return setError("Role name is required.");
    if (!organizationId || !hotelId) return setError("Select organization and hotel first.");
    const payload = {
      name: name.trim(),
      description: description.trim(),
      organizationId,
      hotelId,
      modules: buildModulesPayload(),
    };
    setSaving(true);
    setError("");
    try {
      if (editingRole?.roleId) {
        await updateRole(token, editingRole.roleId, payload);
      } else {
        await createRole(token, payload);
      }
      onSaved?.();
      onClose?.();
    } catch (err: any) {
      setError(err?.message || "Failed to save role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {readOnly ? "View Role" : editingRole ? "Edit Role" : "Create Role"}
          </Text>

          <TextInput
            editable={!readOnly}
            value={name}
            onChangeText={setName}
            placeholder="Role name"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          />
          <TextInput
            editable={!readOnly}
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.inputMultiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          />

          <ScrollView style={styles.modulesWrap} contentContainerStyle={styles.modulesContent}>
            {modules.map((module: any) => {
              const moduleKey = String(module?.key || module?.moduleKey || "");
              const perms = modulePerms[moduleKey] || EMPTY_PERM;
              return (
                <View key={moduleKey} style={[styles.moduleCard, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
                  <Text style={[styles.moduleTitle, { color: colors.text }]}>{module?.label || module?.name || moduleKey}</Text>
                  {module?.description ? (
                    <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>{module.description}</Text>
                  ) : null}

                  <View style={styles.switchGrid}>
                    <View style={styles.switchCell}>
                      <Text style={[styles.switchLabel, { color: colors.textMuted }]}>Full</Text>
                      <Switch
                        value={perms.fullAccess}
                        disabled={!!readOnly}
                        onValueChange={(value) => togglePerm(moduleKey, "fullAccess", value)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#fff"
                      />
                    </View>
                    <View style={styles.switchCell}>
                      <Text style={[styles.switchLabel, { color: colors.textMuted }]}>Create</Text>
                      <Switch
                        value={perms.create}
                        disabled={!!readOnly}
                        onValueChange={(value) => togglePerm(moduleKey, "create", value)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#fff"
                      />
                    </View>
                    <View style={styles.switchCell}>
                      <Text style={[styles.switchLabel, { color: colors.textMuted }]}>View</Text>
                      <Switch
                        value={perms.view}
                        disabled={!!readOnly}
                        onValueChange={(value) => togglePerm(moduleKey, "view", value)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#fff"
                      />
                    </View>
                    <View style={styles.switchCell}>
                      <Text style={[styles.switchLabel, { color: colors.textMuted }]}>Edit</Text>
                      <Switch
                        value={perms.edit}
                        disabled={!!readOnly}
                        onValueChange={(value) => togglePerm(moduleKey, "edit", value)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#fff"
                      />
                    </View>
                    <View style={styles.switchCell}>
                      <Text style={[styles.switchLabel, { color: colors.textMuted }]}>Delete</Text>
                      <Switch
                        value={perms.remove}
                        disabled={!!readOnly}
                        onValueChange={(value) => togglePerm(moduleKey, "remove", value)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#fff"
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.surfaceMuted }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
            {!readOnly ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary, opacity: saving ? 0.55 : 1 }]}
                onPress={save}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={[styles.buttonText, { color: "#fff" }]}>Save</Text>}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
