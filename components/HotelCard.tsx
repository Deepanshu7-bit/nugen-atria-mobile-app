import React from "react";
import { Image, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/HotelCard.styles";

type Props = { name?: string; location?: string; image?: string };

export function HotelCard({ name, location, image }: Props) {
  const { colors } = useTheme();
  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.noImage, { backgroundColor: colors.surfaceMuted }]}>
            <MaterialIcons name="apartment" size={18} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {name || "No data"}
          </Text>
          <Text style={[styles.location, { color: colors.textMuted }]} numberOfLines={1}>
            {location || "Address not available"}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </GlassCard>
  );
}
