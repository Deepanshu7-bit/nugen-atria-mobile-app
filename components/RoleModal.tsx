import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createRole, updateRole } from "../services/api/roles";
import { useTheme } from "../contexts/ThemeContext";
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

export function RoleModal({ visible, token, organizationId, hotelId, editingRole, readOnly, onClose, onSaved }: Props) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setName(String(editingRole?.name || ""));
    setDescription(String(editingRole?.description || ""));
    setError("");
  }, [visible, editingRole]);

  const save = async () => {
    if (!token || readOnly) return;
    if (!name.trim()) return setError("Role name is required.");
    if (!organizationId || !hotelId) return setError("Select organization and hotel first.");
    setSaving(true); setError("");
    try {
      if (editingRole?.roleId) {
        await updateRole(token, editingRole.roleId, { name: name.trim(), description: description.trim(), organizationId, hotelId, modules: [] });
      } else {
        await createRole(token, { name: name.trim(), description: description.trim(), organizationId, hotelId, modules: [] });
      }
      onSaved?.();
      onClose?.();
    } catch (err: any) {
      setError(err?.message || "Failed to save role.");
    } finally { setSaving(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>{editingRole ? "Edit Role" : "Create Role"}</Text>
          <TextInput editable={!readOnly} value={name} onChangeText={setName} placeholder="Role name" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />
          <TextInput editable={!readOnly} multiline value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor={colors.textMuted} style={[styles.input, styles.inputMultiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />
          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.surfaceMuted }]} onPress={onClose}><Text style={[styles.buttonText, { color: colors.text }]}>Close</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, opacity: saving || readOnly ? 0.55 : 1 }]} onPress={save} disabled={saving || !!readOnly}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={[styles.buttonText, { color: "#fff" }]}>Save</Text>}</TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
