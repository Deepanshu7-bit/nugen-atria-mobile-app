import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { formatCurrency } from "../utils/format";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/OrderCard.styles";

type Action = { label: string; disabled?: boolean; onPress?: () => void };
type Props = {
  title?: string;
  room?: string;
  price?: number;
  status?: string;
  time?: string;
  items?: string;
  elapsed?: string | null;
  primaryAction?: Action | null;
  secondaryAction?: Action | null;
};

export function OrderCard({ title = "Order", room, price = 0, status = "pending", time = "", items, elapsed, primaryAction, secondaryAction }: Props) {
  const { colors } = useTheme();
  const normalized = String(status).toLowerCase();
  const tone = normalized.includes("cancel")
    ? colors.danger
    : normalized.includes("complete")
      ? colors.success
      : normalized.includes("process")
        ? colors.warning
        : normalized.includes("pending")
          ? colors.textMuted
          : colors.primary;
  const displayId = String(room || title).match(/\d+/)?.[0] || title;
  const meta = [title, time].filter(Boolean).join(" • ");
  const hasFooter = price > 0 || elapsed;

  return (
    <GlassCard style={[styles.card, elapsed?.includes("22m") && { borderColor: `${colors.danger}40` }]}>
      <View style={styles.top}>
        <View>
          <Text style={[styles.title, { color: colors.primary }]}>{displayId}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{meta || room || "Order in progress"}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${tone}18` }]}>
          <Text style={[styles.badgeText, { color: tone }]}>{String(status).toUpperCase()}</Text>
        </View>
      </View>
      {items ? (
        <View style={[styles.items, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.itemsText, { color: colors.textMuted }]} numberOfLines={2}>{items}</Text>
        </View>
      ) : null}
      {hasFooter ? (
        <View style={styles.footer}>
          {price > 0 ? <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(price)}</Text> : <View />}
          {elapsed ? (
            <View style={styles.elapsedWrap}>
              <MaterialIcons name="schedule" size={12} color={tone} />
              <Text style={[styles.elapsed, { color: tone }]}>{elapsed}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      {primaryAction || secondaryAction ? (
        <View style={styles.actions}>
          {primaryAction ? (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: primaryAction.disabled ? 0.55 : 1 }]}
              onPress={primaryAction.onPress}
              disabled={primaryAction.disabled}
            >
              <Text style={[styles.buttonText, { color: "#fff" }]}>{primaryAction.label}</Text>
            </TouchableOpacity>
          ) : null}
          {secondaryAction ? (
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.surfaceMuted, opacity: secondaryAction.disabled ? 0.55 : 1 }]}
              onPress={secondaryAction.onPress}
              disabled={secondaryAction.disabled}
            >
              {secondaryAction.label === "..." ? (
                <MaterialIcons name="more-horiz" size={20} color={colors.textMuted} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.textMuted }]}>{secondaryAction.label}</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </GlassCard>
  );
}
