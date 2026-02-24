import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/SectionTitle.styles";

type Props = { title: string; action?: string; onActionPress?: () => void };

export function SectionTitle({ title, action, onActionPress }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {action ? (
        onActionPress ? (
          <TouchableOpacity onPress={onActionPress} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={[styles.action, { color: colors.primary }]}>{action}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.action, { color: colors.primary }]}>{action}</Text>
        )
      ) : null}
    </View>
  );
}
