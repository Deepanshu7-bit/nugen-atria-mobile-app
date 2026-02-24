import React from "react";
import { Platform, SafeAreaView, StatusBar, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants/theme";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/ScreenBackground.styles";

export const PRIMARY_COLOR = COLORS.primary;

const GRAIN_POINTS = Array.from({ length: 40 }, (_, index) => ({
  top: (index * 13) % 100,
  left: (index * 29) % 100,
}));

export function ScreenBackground({ children }: { children: React.ReactNode }) {
  const { isDark, colors } = useTheme();
  const { width } = useWindowDimensions();
  const gradientColors: [string, string] = isDark ? ["#151b28", "#111621"] : ["#f6f6f8", "#eef2f7"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar translucent={Platform.OS === "android"} backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={styles.grain}>
        {GRAIN_POINTS.map((point, index) => (
          <View
            key={index}
            style={[
              styles.grainDot,
              { top: `${point.top}%` as any, left: `${point.left}%` as any, backgroundColor: isDark ? "#334155" : "#cbd5e1" },
            ]}
          />
        ))}
      </View>
      <SafeAreaView style={styles.safe}><View style={[styles.content, { maxWidth: Math.min(width, 520) }]}>{children}</View></SafeAreaView>
    </View>
  );
}
