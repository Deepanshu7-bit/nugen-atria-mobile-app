import React from "react";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/ThemeToggle.styles";

type Props = { style?: StyleProp<ViewStyle>; size?: number };

export function ThemeToggle({ style, size = 36 }: Props) {
  const { isDark, colors, toggleTheme } = useTheme();
  return (
    <TouchableOpacity onPress={toggleTheme} style={[styles.button, { width: size, height: size, backgroundColor: colors.surfaceMuted, borderColor: colors.border }, style]} accessibilityRole="button" accessibilityLabel="Toggle theme">
      <MaterialIcons name={isDark ? "light-mode" : "dark-mode"} size={18} color={isDark ? colors.textMuted : colors.text} />
    </TouchableOpacity>
  );
}
