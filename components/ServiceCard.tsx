import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/ServiceCard.styles";

type Props = { title?: string; subtitle?: string; image?: string; onPress?: () => void };

export function ServiceCard({ title = "Service", subtitle = "", image, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, pressed && styles.cardPressed]} onPress={onPress}>
      <View style={[styles.thumbWrap, { backgroundColor: colors.primarySoft }]}>{image ? <Image source={{ uri: image }} style={styles.thumb} /> : <View style={styles.thumbFallback}><MaterialIcons name="image-not-supported" size={16} color={colors.textMuted} /><Text style={[styles.thumbFallbackText, { color: colors.textMuted }]}>No image</Text></View>}</View>
      <View style={styles.content}><Text style={[styles.title, { color: colors.text }]}>{title}</Text><Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text></View>
      <View style={[styles.arrowWrap, { backgroundColor: colors.primarySoft }]}><MaterialIcons name="chevron-right" size={18} color={colors.primary} /></View>
    </Pressable>
  );
}
