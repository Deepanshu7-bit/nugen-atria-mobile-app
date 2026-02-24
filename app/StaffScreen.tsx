import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HeaderBar } from "../components/HeaderBar";
import { StaffCard } from "../components/StaffCard";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../contexts/AuthContext";
import { useHotel } from "../contexts/HotelContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { getUsers } from "../services/api/users";
import { styles } from "../styles/app/StaffScreen.styles";

const extractUsers = (payload: any) => {
  const list = payload?.data?.data?.users || payload?.data?.users || payload?.users || payload?.data || payload || [];
  return Array.isArray(list) ? list : [];
};

export default function StaffScreen() {
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const { hotelId, organizationId } = useHotel();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const { data } = useAsync(
    () => (token ? getUsers(token, { ...(hotelId ? { hotelId } : {}), ...(organizationId && !hotelId ? { organizationId } : {}) }) : null),
    [token, hotelId, organizationId],
    { enabled: !!token, cacheKey: token ? `staff:${token}:${hotelId || organizationId || "all"}` : null },
  );

  const staff = useMemo(() => extractUsers(data), [data]);
  const onlineStaff = useMemo(
    () => staff.filter((member: any) => !String(member?.status || "online").toLowerCase().includes("offline")),
    [staff],
  );
  const offlineStaff = useMemo(
    () => staff.filter((member: any) => String(member?.status || "").toLowerCase().includes("offline")),
    [staff],
  );
  const filterBase = useMemo(() => {
    if (filter === "online") return onlineStaff;
    if (filter === "offline") return offlineStaff;
    return staff;
  }, [filter, onlineStaff, offlineStaff, staff]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filterBase;
    return filterBase.filter((member: any) => {
      const name = `${member?.firstName || ""} ${member?.lastName || ""}`.toLowerCase();
      return name.includes(q) || String(member?.role || "").toLowerCase().includes(q);
    });
  }, [filterBase, query]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <HeaderBar
        title="Staff"
        subtitle="Team roster"
        avatarUri={user?.avatar}
        icon="group"
        rightSlot={
          <TouchableOpacity style={[styles.moreBtn, { backgroundColor: colors.surfaceMuted }]}>
            <MaterialIcons name="more-vert" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        }
      />

      <View style={styles.section}>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="person-add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add New Staff Member</Text>
        </TouchableOpacity>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or role"
          placeholderTextColor={colors.textMuted}
          style={[styles.search, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        />

        <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.filterBtn, filter === "all" && [styles.filterBtnActive, { borderBottomColor: colors.primary }]]} onPress={() => setFilter("all")}>
            <Text style={[styles.filterText, { color: filter === "all" ? colors.primary : colors.textMuted }]}>All Staff</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, filter === "online" && [styles.filterBtnActive, { borderBottomColor: colors.primary }]]} onPress={() => setFilter("online")}>
            <Text style={[styles.filterText, { color: filter === "online" ? colors.primary : colors.textMuted }]}>Online ({onlineStaff.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, filter === "offline" && [styles.filterBtnActive, { borderBottomColor: colors.primary }]]} onPress={() => setFilter("offline")}>
            <Text style={[styles.filterText, { color: filter === "offline" ? colors.primary : colors.textMuted }]}>Offline ({offlineStaff.length})</Text>
          </TouchableOpacity>
        </View>

        {filtered.length ? (
          <View style={styles.list}>
            {filtered.slice(0, 20).map((member: any) => (
              <StaffCard
                key={member?._id || member?.userId || member?.email}
                name={`${member?.firstName || ""} ${member?.lastName || ""}`.trim() || "User"}
                role={member?.role}
                email={member?.email}
                status={member?.status || "Online"}
                avatar={member?.avatar}
              />
            ))}
          </View>
        ) : (
          <EmptyState icon="group-off" title="No users found" description="Try a different search or hotel." />
        )}
      </View>
    </ScrollView>
  );
}
