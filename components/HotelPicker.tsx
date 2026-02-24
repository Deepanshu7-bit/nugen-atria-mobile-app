import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/HotelPicker.styles";

type Item = { _id?: string; hotelId?: string; organizationId?: string; name?: string };
type Props = { label: string; items?: Item[]; value?: string | null; onChange?: (id: string) => void; loading?: boolean };
const pickId = (item: Item) => String(item?.hotelId || item?._id || item?.organizationId || "");

export function HotelPicker({ label, items = [], value, onChange, loading = false }: Props) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const active = useMemo(() => items.find((i) => pickId(i) === String(value || "")) || items[0], [items, value]);

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => !loading && setOpen(true)}
      >
        <View style={styles.textWrap}>
          <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
            {label}
          </Text>
          <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
            {loading ? "Loading..." : active?.name || "Not set"}
          </Text>
        </View>
        <MaterialIcons name="expand-more" size={20} color={colors.textMuted} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.title, { color: colors.text }]}>{label}</Text>
            <ScrollView>
              {items.map((item) => {
                const id = pickId(item);
                const selected = id && id === String(value || "");
                return (
                  <Pressable
                    key={id}
                    style={[styles.option, { backgroundColor: selected ? colors.primarySoft : "transparent" }]}
                    onPress={() => {
                      onChange?.(id);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, { color: colors.text }]} numberOfLines={1}>{item?.name || "Unnamed"}</Text>
                    {selected ? <MaterialIcons name="check" size={18} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
