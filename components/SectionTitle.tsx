import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/SectionTitle.styles";

type Props = { title: string; action?: string };

export function SectionTitle({ title, action }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {action ? <Text style={[styles.action, { color: colors.primary }]}>{action}</Text> : null}
    </View>
  );
}
