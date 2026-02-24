import React from "react";
import { Image, TouchableOpacity, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/HotelCard.styles";

type Props = { name?: string; location?: string; image?: string; onPress?: () => void };

export function HotelCard({ name, location, image, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={!onPress}>
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
    </TouchableOpacity>
  );
}
