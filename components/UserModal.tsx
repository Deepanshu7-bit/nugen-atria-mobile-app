import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { createUser } from "../services/api/users";
import { styles } from "../styles/components/UserModal.styles";

type Props = {
  visible: boolean;
  token?: string | null;
  hotelId?: string | null;
  roles?: any[];
  mode?: "create" | "view";
  userData?: any;
  onClose?: () => void;
  onSaved?: () => void;
};

const mapRoleName = (role: any) => String(role?.name || role?.role || role || "");

export function UserModal({
  visible,
  token,
  hotelId,
  roles = [],
  mode = "create",
  userData,
  onClose,
  onSaved,
}: Props) {
  const { colors } = useTheme();
  const readOnly = mode === "view";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const roleOptions = useMemo(
    () => roles.map((item) => mapRoleName(item)).filter(Boolean),
    [roles],
  );

  useEffect(() => {
    if (!visible) return;
    setFirstName(String(userData?.firstName || ""));
    setLastName(String(userData?.lastName || ""));
    setEmail(String(userData?.email || ""));
    setPhone(String(userData?.phone || ""));
    setRole(mapRoleName(userData?.role));
    setAvatar(String(userData?.avatar || ""));
    setPassword("");
    setConfirmPassword("");
    setNotes(String(userData?.metadata?.notes || userData?.notes || ""));
    setIsActive(!String(userData?.status || "ACTIVE").toLowerCase().includes("inactive"));
    setError("");
  }, [visible, userData]);

  const save = async () => {
    if (!token || readOnly) return;
    if (!hotelId) return setError("Select a hotel first.");
    if (!firstName.trim() || !lastName.trim()) return setError("First and last name are required.");
    if (!email.trim()) return setError("Email is required.");
    if (!phone.trim()) return setError("Phone is required.");
    if (!role.trim()) return setError("Role is required.");
    if (!password || password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    const payload: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role.trim().toUpperCase(),
      hotelId,
      notes: notes.trim(),
      accountStatus: isActive,
      password,
    };
    if (avatar.trim()) payload.avatar = avatar.trim();
    setSaving(true);
    setError("");
    try {
      await createUser(token, payload);
      onSaved?.();
      onClose?.();
    } catch (err: any) {
      setError(err?.message || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>
              {readOnly ? "View User" : "Add User"}
            </Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceMuted }]}>
              <MaterialIcons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.avatarRow}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: colors.primarySoft }]}>
                  <MaterialIcons name="person" size={26} color={colors.primary} />
                </View>
              )}
            </View>

            {!readOnly ? (
              <TextInput
                value={avatar}
                onChangeText={setAvatar}
                placeholder="Avatar image URL (optional)"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              />
            ) : null}

            <View style={styles.grid}>
              <TextInput
                editable={!readOnly}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.half, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              />
              <TextInput
                editable={!readOnly}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.half, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              />
            </View>

            <TextInput
              editable={!readOnly}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            />

            <TextInput
              editable={!readOnly}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone number"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Role</Text>
            <View style={styles.roleWrap}>
              {roleOptions.length ? (
                roleOptions.map((item) => {
                  const selected = role.toLowerCase() === item.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={item}
                      disabled={readOnly}
                      onPress={() => setRole(item)}
                      style={[styles.roleChip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primarySoft : colors.surface }]}
                    >
                      <Text style={[styles.roleChipText, { color: selected ? colors.primary : colors.textMuted }]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <TextInput
                  editable={!readOnly}
                  value={role}
                  onChangeText={setRole}
                  placeholder="Role"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />
              )}
            </View>

            {!readOnly ? (
              <View style={styles.grid}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.half, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm password"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.half, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />
              </View>
            ) : null}

            <TextInput
              editable={!readOnly}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Notes"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.inputMultiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            />

            <View style={[styles.statusRow, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statusText, { color: colors.text }]}>Account Active</Text>
              <Switch
                value={isActive}
                onValueChange={(value) => !readOnly && setIsActive(value)}
                disabled={readOnly}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.surfaceMuted }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
            {!readOnly ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
                onPress={save}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={[styles.buttonText, { color: "#fff" }]}>Save User</Text>}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
