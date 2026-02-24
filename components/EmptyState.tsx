import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/EmptyState.styles";

type Props = { icon?: any; title: string; description: string; actionLabel?: string; onAction?: () => void };

export function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  const { colors } = useTheme();
  return (
    <GlassCard style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}><MaterialIcons name={icon || "inbox"} size={44} color={colors.primary} /></View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      {actionLabel ? <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onAction}><Text style={styles.buttonText}>{actionLabel}</Text></TouchableOpacity> : null}
    </GlassCard>
  );
}
