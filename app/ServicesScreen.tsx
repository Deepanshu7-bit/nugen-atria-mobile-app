import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HeaderBar } from "../components/HeaderBar";
import { EmptyState } from "../components/EmptyState";
import { HotelPicker } from "../components/HotelPicker";
import { OrderCard } from "../components/OrderCard";
import { SectionTitle } from "../components/SectionTitle";
import { useAuth } from "../contexts/AuthContext";
import { useHotel } from "../contexts/HotelContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { getFoodOrders, getServiceOrders } from "../services/api/orders";
import { styles } from "../styles/app/ServicesScreen.styles";

const TYPES = [
  { key: "food", label: "All Orders" },
  { key: "service", label: "Service Only" },
];

const STATUS_FILTERS = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "preparing", label: "Preparing" },
  { key: "delivered", label: "Delivered" },
];

const extractOrders = (payload: any) => {
  const list =
    payload?.data?.data?.orders ||
    payload?.data?.orders ||
    payload?.orders ||
    payload?.data ||
    payload ||
    [];
  return Array.isArray(list) ? list : [];
};

export default function ServicesScreen() {
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const {
    organizations,
    hotels,
    organizationId,
    hotelId,
    setOrganizationId,
    setHotelId,
    loadingOrgs,
    loadingHotels,
    showOrganizationPicker,
  } = useHotel();

  const [type, setType] = useState("food");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const { data } = useAsync(
    () => (token && hotelId ? (type === "food" ? getFoodOrders(token, hotelId) : getServiceOrders(token, hotelId)) : null),
    [token, hotelId, type],
    { enabled: !!token && !!hotelId, cacheKey: token ? `orders:${token}:${hotelId || "none"}:${type}` : null, cacheTime: 0 },
  );

  const orders = useMemo(() => extractOrders(data), [data]);
  const withStatusFilter = useMemo(() => {
    if (status === "all") return orders;
    return orders.filter((order: any) => String(order?.status || "").toLowerCase().includes(status));
  }, [orders, status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return withStatusFilter;
    return withStatusFilter.filter((order: any) => {
      return [order?.orderId, order?._id, order?.roomNumber, order?.roomName, order?.guestName]
        .some((value) => String(value || "").toLowerCase().includes(q));
    });
  }, [withStatusFilter, query]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <HeaderBar title="Room Service" subtitle="Order operations" avatarUri={user?.avatar} icon="room-service">
        <View style={styles.pickers}>
          {showOrganizationPicker ? (
            <HotelPicker label="Organization" items={organizations} value={organizationId} onChange={setOrganizationId} loading={loadingOrgs} />
          ) : null}
          <HotelPicker label="Hotel" items={hotels} value={hotelId} onChange={setHotelId} loading={loadingHotels} />
        </View>
      </HeaderBar>

      <View style={styles.section}>
        <View style={styles.row}>
          {TYPES.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.typeChip, { borderColor: type === item.key ? colors.primary : colors.border, backgroundColor: type === item.key ? colors.primarySoft : colors.card }]}
              onPress={() => setType(item.key)}
            >
              <Text style={[styles.typeChipText, { color: type === item.key ? colors.primary : colors.textMuted }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.searchWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <MaterialIcons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search room number..."
            placeholderTextColor={colors.textMuted}
            style={[styles.search, { color: colors.text }]}
          />
          <MaterialIcons name="tune" size={18} color={colors.textMuted} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusRow}>
          {STATUS_FILTERS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.chip, { borderColor: status === item.key ? colors.primary : colors.border, backgroundColor: status === item.key ? colors.primary : colors.card }]}
              onPress={() => setStatus(item.key)}
            >
              <Text style={[styles.chipText, { color: status === item.key ? "#fff" : colors.textMuted }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionTitle title={`Active Orders (${filtered.length})`} action="Sorted by urgency" />

        {filtered.length ? (
          <View style={styles.list}>
            {filtered.slice(0, 24).map((order: any) => (
              <OrderCard
                key={order?.orderId || order?._id || `${order?.roomNumber || "r"}-${order?.createdAt || ""}`}
                title={order?.orderNumber || order?.orderId || "Order"}
                room={order?.roomNumber ? String(order.roomNumber) : order?.roomName || ""}
                price={Number(order?.pricing?.totalAmount || order?.totalAmount || 0)}
                status={order?.status || "pending"}
                time={order?.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ""}
                items={Array.isArray(order?.items) ? order.items.map((item: any) => `${item?.quantity || 1}x ${item?.name || "Item"}`).join(", ") : order?.description}
                elapsed={
                  order?.createdAt
                    ? `${Math.max(0, Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000))}m elapsed`
                    : null
                }
                primaryAction={{
                  label: String(order?.status || "").toLowerCase().includes("pending") ? "Start Preparing" : "Mark as Delivered",
                }}
                secondaryAction={{ label: "..." }}
              />
            ))}
          </View>
        ) : (
          <EmptyState icon="receipt-long" title="No orders" description="Orders will appear here once placed." />
        )}
      </View>
    </ScrollView>
  );
}
