import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/StatCard.styles";

type Props = { label?: string; value?: string; trend?: string; icon?: any; accent?: string };

export function StatCard({ label = "", value = "", trend = "", icon, accent }: Props) {
  const { colors } = useTheme();
  const trendColor = trend?.startsWith("-") ? colors.danger : colors.success;
  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
          {label}
        </Text>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: `${accent || colors.primary}14` }]}>
            <MaterialIcons name={icon} size={16} color={accent || colors.primary} />
          </View>
        ) : null}
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
          {value}
        </Text>
        {trend ? (
          <View style={[styles.trendPill, { backgroundColor: `${trendColor}18` }]}>
            <Text style={[styles.trend, { color: trendColor }]}>{trend}</Text>
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}
