import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { getInitials } from "../utils/format";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/StaffCard.styles";

type Props = { name?: string; role?: string; email?: string; status?: string; avatar?: string; onPress?: () => void };

export function StaffCard({ name = "User", role, email, status, avatar, onPress }: Props) {
  const { colors } = useTheme();
  const normalized = String(status || "").toLowerCase();
  const isOffline = normalized.includes("offline") || normalized.includes("inactive");
  const tone = isOffline ? colors.textMuted : colors.success;
  const label = isOffline ? "OFFLINE" : "ONLINE";

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={!onPress}>
      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.fallback, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.initials, { color: colors.primary }]}>{getInitials(name) || "U"}</Text>
              </View>
            )}
            <View style={[styles.statusDot, { backgroundColor: tone }]} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>{role || email || "Team Member"}</Text>
          </View>
          <View style={styles.right}>
            <View style={[styles.roleBadge, { backgroundColor: `${tone}1a` }]}>
              <Text style={[styles.roleText, { color: tone }]}>{label}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}
