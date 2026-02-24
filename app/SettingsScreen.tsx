import React from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { HeaderBar } from "../components/HeaderBar";
import { SectionTitle } from "../components/SectionTitle";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { getProfile } from "../services/api/profile";
import { styles } from "../styles/app/SettingsScreen.styles";

const extractProfile = (payload: any) => payload?.data?.data || payload?.data || payload || {};

export default function SettingsScreen() {
  const { token, user, signOut, loading } = useAuth();
  const { mode, setMode, colors } = useTheme();
  const { data } = useAsync(() => (token ? getProfile(token) : null), [token], { enabled: !!token, cacheKey: token ? `profile:${token}` : null });
  const profile = extractProfile(data);
  const name = `${profile?.firstName || user?.firstName || ""} ${profile?.lastName || user?.lastName || ""}`.trim() || "No Name";
  const email = profile?.email || user?.email || "No email";
  const role = String(profile?.role?.name || profile?.role || user?.role || "Unknown").toUpperCase();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <HeaderBar title="Settings" subtitle="Profile, preferences, and account" avatarUri={user?.avatar} icon="settings" showNotificationIcon={false} />

      <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
        <SectionTitle title="Profile" />
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{email}</Text>
        <Text style={[styles.meta, { color: colors.primary }]}>{role}</Text>
      </View>

      <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
        <SectionTitle title="Appearance" />
        <View style={styles.row}>
          <Text style={[styles.meta, { color: colors.text }]}>Dark mode</Text>
          <Switch value={mode === "dark"} onValueChange={(next) => setMode(next ? "dark" : "light")} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
        </View>
      </View>

      <TouchableOpacity style={[styles.logout, { backgroundColor: "rgba(239,68,68,0.14)", opacity: loading ? 0.6 : 1 }]} onPress={signOut} disabled={loading}>
        <Text style={[styles.logoutText, { color: colors.danger }]}>{loading ? "Logging out..." : "Log Out"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
