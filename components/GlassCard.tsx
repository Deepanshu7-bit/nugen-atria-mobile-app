import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/GlassCard.styles";

type Props = { children?: React.ReactNode; style?: StyleProp<ViewStyle> };

export function GlassCard({ children, style }: Props) {
  const { colors } = useTheme();
  return <View style={[styles.base, { backgroundColor: colors.card, borderColor: colors.cardBorder }, style]}>{children}</View>;
}
