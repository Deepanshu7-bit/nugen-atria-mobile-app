import React from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/NotificationCard.styles";

type Props = { title?: string; message?: string; time?: string; priority?: string };

export function NotificationCard({ title = "Notification", message = "", time, priority }: Props) {
  const { colors } = useTheme();
  const value = String(priority || "").toLowerCase();
  const isCancel = value.includes("cancel");
  const isRefund = value.includes("refund");
  const isOrder = value.includes("order");
  const tone = isCancel ? colors.danger : isRefund ? colors.success : colors.primary;
  const icon = isCancel ? "cancel" : isRefund ? "account-balance-wallet" : isOrder ? "shopping-bag" : "notifications";
  const iconBg = `${tone}18`;

  return (
    <GlassCard style={[styles.card, { backgroundColor: isOrder ? `${colors.primary}0a` : colors.card }]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon as any} size={19} color={tone} />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
            {time ? <Text style={[styles.time, { color: isOrder ? colors.primary : colors.textMuted }]}>{time}</Text> : null}
          </View>
          <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
        </View>
      </View>
    </GlassCard>
  );
}
