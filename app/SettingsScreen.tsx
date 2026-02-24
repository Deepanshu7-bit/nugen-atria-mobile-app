import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { getProfile } from "../services/api/profile";
import { navigateBack, openTabScreen } from "../services/navigation/appNavigation";
import { styles } from "../styles/app/SettingsScreen.styles";

const extractProfile = (payload: any) =>
  payload?.data?.data ||
  payload?.data ||
  payload?.profile ||
  payload ||
  {};

const ACCOUNT_ITEMS = [
  { icon: "person", label: "Edit Profile Info" },
  { icon: "lock", label: "Password & Security" },
  { icon: "verified-user", label: "Two-Factor Auth", value: "ON" },
];

const PREF_ITEMS = [
  { icon: "notifications", label: "Notification Settings", tab: "notifications" },
  { icon: "language", label: "Language", value: "English (US)" },
];

const ORG_ITEMS = [
  { icon: "apartment", label: "Property Details", tab: "hotels" },
  { icon: "group", label: "Staff Management", tab: "staff" },
  { icon: "payments", label: "Billing & Subscription" },
];

export default function SettingsScreen() {
  const { token, user, signOut, loading } = useAuth();
  const { colors } = useTheme();
  const { data } = useAsync(() => (token ? getProfile(token) : null), [token], { enabled: !!token, cacheKey: token ? `profile:${token}` : null });
  const profile = extractProfile(data);
  const name = `${profile?.firstName || user?.firstName || ""} ${profile?.lastName || user?.lastName || ""}`.trim() || "John Doe";
  const email = profile?.email || user?.email || "john.doe@grandplaza.com";
  const role = String(profile?.role?.name || profile?.role || user?.role || "Owner").toUpperCase();
  const avatar = profile?.avatar || user?.avatar;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={navigateBack} style={[styles.iconBtn, { backgroundColor: colors.surfaceMuted }]}>
          <MaterialIcons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile & Settings</Text>
        <TouchableOpacity>
          <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.profileWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.avatarWrap}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.primarySoft }]}>
              <MaterialIcons name="person" size={44} color={colors.primary} />
            </View>
          )}
          <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="edit" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <View style={styles.roleRow}>
          <View style={[styles.roleBadge, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.roleText, { color: colors.primary }]}>{role}</Text>
          </View>
          <Text style={[styles.roleDot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.email, { color: colors.textMuted }]} numberOfLines={1}>{email}</Text>
        </View>
      </View>

      <Text style={[styles.groupLabel, { color: colors.textMuted }]}>Account Settings</Text>
      <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {ACCOUNT_ITEMS.map((item, index) => (
          <TouchableOpacity key={item.label} style={[styles.groupRow, index < ACCOUNT_ITEMS.length - 1 && [styles.rowBorder, { borderBottomColor: colors.border }]]}>
            <View style={styles.rowLeft}>
              <MaterialIcons name={item.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>{item.label}</Text>
            </View>
            {item.value ? <Text style={[styles.rowValue, { color: colors.success }]}>{item.value}</Text> : <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.groupLabel, { color: colors.textMuted }]}>Preferences</Text>
      <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {PREF_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.groupRow, index < PREF_ITEMS.length - 1 && [styles.rowBorder, { borderBottomColor: colors.border }]]}
            onPress={() => item.tab && openTabScreen(item.tab)}
          >
            <View style={styles.rowLeft}>
              <MaterialIcons name={item.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>{item.label}</Text>
            </View>
            {item.value ? <Text style={[styles.rowValue, { color: colors.textMuted }]}>{item.value}</Text> : <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.groupLabel, { color: colors.textMuted }]}>Organization</Text>
      <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {ORG_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.groupRow, index < ORG_ITEMS.length - 1 && [styles.rowBorder, { borderBottomColor: colors.border }]]}
            onPress={() => item.tab && openTabScreen(item.tab)}
          >
            <View style={styles.rowLeft}>
              <MaterialIcons name={item.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>{item.label}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.logout, { backgroundColor: "rgba(239,68,68,0.14)", opacity: loading ? 0.6 : 1 }]} onPress={signOut} disabled={loading}>
        <MaterialIcons name="logout" size={18} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>{loading ? "Logging out..." : "Log Out"}</Text>
      </TouchableOpacity>

      <Text style={[styles.footerCopy, { color: colors.textMuted }]}>HotelAdmin v2.4.0 • Built with trust</Text>
    </ScrollView>
  );
}
