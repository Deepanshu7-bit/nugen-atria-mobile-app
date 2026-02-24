import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HeaderBar } from "../components/HeaderBar";
import { RoleModal } from "../components/RoleModal";
import { EmptyState } from "../components/EmptyState";
import { SectionTitle } from "../components/SectionTitle";
import { useAuth } from "../contexts/AuthContext";
import { useHotel } from "../contexts/HotelContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { getRolesByHotel } from "../services/api/roles";
import { styles } from "../styles/app/AccessScreen.styles";

const extractRoles = (payload: any) => {
  const list = payload?.data?.data?.roles || payload?.data?.roles || payload?.roles || payload?.data || payload || [];
  return Array.isArray(list) ? list : [];
};

export default function AccessScreen() {
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const { organizationId, hotelId } = useHotel();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [readOnlyRole, setReadOnlyRole] = useState(false);

  const { data, refresh } = useAsync(
    () => (token && hotelId ? getRolesByHotel(token, hotelId) : null),
    [token, hotelId],
    { enabled: !!token && !!hotelId, cacheKey: token ? `roles:${token}:${hotelId || "none"}` : null, cacheTime: 0 },
  );

  const roles = useMemo(() => extractRoles(data), [data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((role: any) => {
      return String(role?.name || "").toLowerCase().includes(q) || String(role?.description || "").toLowerCase().includes(q);
    });
  }, [roles, query]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <HeaderBar title="Access Control" subtitle="Manage roles and permissions" avatarUri={user?.avatar} icon="vpn-key" />

      <View style={styles.section}>
        <View style={styles.row}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search roles"
            placeholderTextColor={colors.textMuted}
            style={[styles.search, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          />
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => { setEditingRole(null); setReadOnlyRole(false); setOpen(true); }}>
            <MaterialIcons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {!hotelId ? <EmptyState icon="hotel" title="Select a hotel" description="Choose a hotel to manage roles." /> : null}

        {hotelId ? <SectionTitle title="Roles" action={`${filtered.length} total`} /> : null}

        {hotelId && filtered.length ? (
          filtered.map((role: any) => {
            const normalized = { ...role, roleId: role?.roleId || role?._id };
            return (
              <View key={role?.roleId || role?._id || role?.name} style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
                <Text style={[styles.title, { color: colors.text }]}>{role?.name || "Role"}</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>{role?.description || "No description"}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.surfaceMuted }]}
                    onPress={() => {
                      setEditingRole(normalized);
                      setReadOnlyRole(true);
                      setOpen(true);
                    }}
                  >
                    <Text style={[styles.actionText, { color: colors.text }]}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setEditingRole(normalized);
                      setReadOnlyRole(false);
                      setOpen(true);
                    }}
                  >
                    <Text style={[styles.actionText, { color: "#fff" }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : null}

        {hotelId && !filtered.length ? <Text style={[styles.empty, { color: colors.textMuted }]}>No roles found.</Text> : null}
      </View>

      <RoleModal
        visible={open}
        token={token}
        organizationId={organizationId}
        hotelId={hotelId}
        editingRole={editingRole}
        readOnly={readOnlyRole}
        onClose={() => setOpen(false)}
        onSaved={() => refresh()}
      />
    </ScrollView>
  );
}
