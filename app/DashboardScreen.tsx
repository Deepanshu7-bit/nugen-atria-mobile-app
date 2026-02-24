import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { HeaderBar } from "../components/HeaderBar";
import { HotelPicker } from "../components/HotelPicker";
import { SectionTitle } from "../components/SectionTitle";
import { StatCard } from "../components/StatCard";
import { HotelCard } from "../components/HotelCard";
import { useAuth } from "../contexts/AuthContext";
import { useHotel } from "../contexts/HotelContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { getDashboard } from "../services/api/dashboard";
import { MaterialIcons } from "@expo/vector-icons";
import { formatCurrency, formatDateLabel } from "../utils/format";
import { styles } from "../styles/app/DashboardScreen.styles";

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatTrend = (value: unknown, fallback: number) => {
  const num = toNumber(value, fallback);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(1)}%`;
};

export default function DashboardScreen() {
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const { organizations, hotels, organizationId, hotelId, setOrganizationId, setHotelId, loadingOrgs, loadingHotels, showOrganizationPicker } = useHotel();
  const { data } = useAsync(() => (token ? getDashboard(token, hotelId ? { hotelId } : {}) : null), [token, hotelId], { enabled: !!token, cacheKey: token ? `dashboard:${token}:${hotelId || "all"}` : null });
  const overview = useMemo(() => data?.data?.overview || data?.overview || {}, [data]);
  const metric = useMemo(
    () => ({
      revenue: toNumber(overview?.revenue ?? overview?.totalRevenue),
      bookings: toNumber(overview?.newBookings ?? overview?.totalBookings),
      orders: toNumber(overview?.activeOrders ?? overview?.orders),
      occupancy: toNumber(overview?.occupancy ?? overview?.occupancyRate),
      revenueTrend: formatTrend(overview?.revenueGrowth ?? overview?.revenueChange, 12.5),
      bookingTrend: formatTrend(overview?.bookingGrowth ?? overview?.bookingChange, 5.2),
      orderTrend: formatTrend(overview?.orderGrowth ?? overview?.orderChange, 8.1),
      occupancyTrend: formatTrend(overview?.occupancyGrowth ?? overview?.occupancyChange, -2.4),
    }),
    [overview],
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <HeaderBar title="Portfolio Overview" subtitle={`Updated ${formatDateLabel()}`} avatarUri={user?.avatar} icon="analytics">
        <View style={[styles.selectorCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={[styles.selectorBtn, { backgroundColor: !hotelId ? colors.primary : "transparent" }]}
            onPress={() => setHotelId(null)}
          >
            <MaterialIcons name="hub" size={16} color={!hotelId ? "#fff" : colors.textMuted} />
            <Text style={[styles.selectorText, { color: !hotelId ? "#fff" : colors.textMuted }]}>All Properties</Text>
          </TouchableOpacity>
          <View style={[styles.selectorDivider, { backgroundColor: colors.border }]} />
          <View style={styles.selectorPicker}>
            {showOrganizationPicker ? (
              <HotelPicker
                label="Organization"
                items={organizations}
                value={organizationId}
                onChange={setOrganizationId}
                loading={loadingOrgs}
              />
            ) : (
              <HotelPicker label="Specific Hotel" items={hotels} value={hotelId} onChange={setHotelId} loading={loadingHotels} />
            )}
          </View>
        </View>
      </HeaderBar>

      <View style={styles.section}>
        <SectionTitle title="Key Metrics" action={hotelId ? "Single hotel" : "All hotels"} />
        <View style={styles.stats}>
          <StatCard label="Total Revenue" value={formatCurrency(metric.revenue)} trend={metric.revenueTrend} icon="payments" accent={colors.primary} />
          <StatCard label="Total Bookings" value={String(metric.bookings)} trend={metric.bookingTrend} icon="calendar-month" accent={colors.primary} />
        </View>
        <View style={styles.stats}>
          <StatCard label="Active Orders" value={String(metric.orders)} trend={metric.orderTrend} icon="shopping-cart" accent={colors.primary} />
          <StatCard label="Occupancy" value={`${Math.round(metric.occupancy || 88)}%`} trend={metric.occupancyTrend} icon="hotel" accent={colors.primary} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.trendCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.trendHeader}>
            <Text style={[styles.trendTitle, { color: colors.text }]}>Revenue Trends</Text>
            <View style={[styles.rangePill, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.rangeText, { color: colors.textMuted }]}>7D</Text>
              <Text style={[styles.rangeText, { color: colors.textMuted }]}>1M</Text>
              <Text style={[styles.rangeText, { color: colors.textMuted }]}>1Y</Text>
            </View>
          </View>
          <View style={[styles.chartArea, { backgroundColor: colors.surfaceMuted }]}>
            <View style={[styles.curveOne, { backgroundColor: colors.primary }]} />
            <View style={[styles.curveTwo, { backgroundColor: colors.primary }]} />
            <View style={[styles.curveThree, { backgroundColor: colors.primary }]} />
            <View style={[styles.curveFour, { backgroundColor: colors.primary }]} />
            <View style={[styles.curveFive, { backgroundColor: colors.primary }]} />
            <View style={[styles.peakTag, { backgroundColor: colors.text }]}>
              <Text style={styles.peakText}>Peak: {formatCurrency(metric.revenue * 0.15 || 18400)}</Text>
            </View>
          </View>
          <View style={styles.weekRow}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <Text key={day} style={[styles.weekLabel, { color: day === "Thu" ? colors.primary : colors.textMuted }]}>
                {day}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle title="Hotels Performance" action="View All" />
        <View style={styles.hotelList}>
          {hotels.length ? (
            hotels.slice(0, 8).map((hotel: any) => (
              <HotelCard
                key={hotel?._id || hotel?.hotelId}
                name={hotel?.name}
                location={hotel?.address?.city || hotel?.address?.state || "No location"}
                image={hotel?.coverImage}
              />
            ))
          ) : (
            <Text style={[styles.empty, { color: colors.textMuted }]}>No hotels available.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
