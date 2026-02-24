import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createOrganization } from "../services/api/organizations";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/CreateOrganizationModal.styles";

type Props = {
  visible: boolean;
  token?: string | null;
  onClose?: () => void;
  onOrganizationCreated?: (organizationId?: string | null) => void;
};

const resolveId = (res: any) => res?.data?.organization?._id || res?.organization?._id || res?.data?._id || res?._id || null;

export function CreateOrganizationModal({ visible, token, onClose, onOrganizationCreated }: Props) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!visible) { setName(""); setGstin(""); setError(""); } }, [visible]);

  const handleSave = async () => {
    if (!token) return setError("You are not authenticated.");
    if (!name.trim()) return setError("Organization name is required.");
    setSaving(true); setError("");
    try {
      const res = await createOrganization(token, { name: name.trim(), gstin: gstin.trim().toUpperCase() || undefined });
      onOrganizationCreated?.(resolveId(res));
      onClose?.();
    } catch (err: any) {
      setError(err?.message || "Failed to create organization.");
    } finally { setSaving(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Create Organization</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Quick create form</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Organization name" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />
          <TextInput value={gstin} onChangeText={(v) => setGstin(v.toUpperCase().slice(0, 15))} placeholder="GSTIN (optional)" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />
          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.surfaceMuted }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={[styles.buttonText, { color: "#fff" }]}>Create</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
