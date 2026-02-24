import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HeaderBar } from "../components/HeaderBar";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../contexts/AuthContext";
import { useHotel } from "../contexts/HotelContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { getBookingsByHotel } from "../services/api/bookings";
import { getInitials } from "../utils/format";
import { styles } from "../styles/app/BookingsScreen.styles";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "checked-in", label: "Checked-in" },
  { key: "checked-out", label: "Checked-out" },
];

const fmtDateRange = (booking: any) => {
  const inDate = booking?.checkInDate || booking?.dateFrom;
  const outDate = booking?.checkOutDate || booking?.dateTo;
  if (!inDate || !outDate) return "Date unavailable";
  const format = (value: string) =>
    new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  return `${format(String(inDate))} - ${format(String(outDate))}`;
};

export default function BookingsScreen() {
  const { token, user } = useAuth();
  const { hotelId } = useHotel();
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const { data } = useAsync(() => (token && hotelId ? getBookingsByHotel(token, hotelId) : null), [token, hotelId], { enabled: !!token && !!hotelId, cacheKey: token ? `bookings:${token}:${hotelId || "none"}` : null });
  const bookings = useMemo(() => {
    const list = data?.data?.bookings || data?.bookings || data?.data || data || [];
    return Array.isArray(list) ? list : [];
  }, [data]);
  const filtered = useMemo(() => bookings.filter((booking: any) => {
    const q = query.trim().toLowerCase();
    const guest = `${booking?.guestDetails?.firstName || ""} ${booking?.guestDetails?.lastName || ""}`.toLowerCase();
    const bookingId = String(booking?.bookingId || booking?._id || "").toLowerCase();
    const currentStatus = String(booking?.status || "").toLowerCase();
    const normalizedStatus = currentStatus.replace(/[^a-z]/g, "");
    const normalizedTarget = status.replace(/[^a-z]/g, "");
    if (status !== "all" && !normalizedStatus.includes(normalizedTarget)) return false;
    if (!q) return true;
    return guest.includes(q) || bookingId.includes(q);
  }), [bookings, query, status]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <HeaderBar title="Bookings" subtitle="Guest reservations" avatarUri={user?.avatar} icon="hotel-class" />
      <View style={styles.section}>
        <View style={[styles.searchWrap, { backgroundColor: colors.surfaceMuted }]}>
          <MaterialIcons name="search" size={19} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search guest names or booking ID"
            placeholderTextColor={colors.textMuted}
            style={[styles.search, { color: colors.text }]}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.chip, { backgroundColor: status === item.key ? colors.primary : colors.surfaceMuted }]}
              onPress={() => setStatus(item.key)}
            >
              <Text style={[styles.chipText, { color: status === item.key ? "#fff" : colors.textMuted }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {!hotelId ? <EmptyState icon="hotel" title="Select a hotel" description="Choose a hotel to view bookings." /> : null}
        {hotelId && filtered.length ? (
          <View style={styles.list}>
            {filtered.slice(0, 20).map((booking: any) => {
              const id = booking?.bookingId || booking?._id;
              const guest = `${booking?.guestDetails?.firstName || ""} ${booking?.guestDetails?.lastName || ""}`.trim() || "Guest";
              const bookingStatus = String(booking?.status || "pending");
              const normalized = bookingStatus.toLowerCase();
              const tone = normalized.includes("checkedin")
                ? colors.success
                : normalized.includes("checkedout")
                  ? colors.textMuted
                  : colors.warning;
              return (
                <View key={id} style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
                  <View style={styles.topRow}>
                    <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                      <Text style={[styles.avatarText, { color: colors.primary }]}>{getInitials(guest)}</Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.title, { color: colors.text }]}>{guest}</Text>
                      <Text style={[styles.meta, { color: colors.textMuted }]}>ID: #{String(id || "N/A").slice(-6).toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: `${tone}1a` }]}>
                      <Text style={[styles.statusText, { color: tone }]}>{bookingStatus.replace(/_/g, "-")}</Text>
                    </View>
                  </View>
                  <View style={[styles.bottomRow, { borderTopColor: colors.border }]}>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="calendar-month" size={14} color={colors.textMuted} />
                      <Text style={[styles.metaValue, { color: colors.textMuted }]}>{fmtDateRange(booking)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="hotel" size={14} color={colors.textMuted} />
                      <Text style={[styles.metaValue, { color: colors.textMuted }]} numberOfLines={1}>
                        {booking?.roomType || booking?.roomDetails?.type || "Standard Room"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
        {hotelId && !filtered.length ? <EmptyState icon="event-busy" title="No bookings" description="No records found for this hotel." /> : null}
      </View>
    </ScrollView>
  );
}
