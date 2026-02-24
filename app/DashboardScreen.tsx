import React, { useMemo, useState } from "react";
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
import { openHotelDetailScreen, openTabScreen } from "../services/navigation/appNavigation";
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
  const { organizations, hotels, organizationId, hotelId, setOrganizationId, setHotelId, loadingOrgs, loadingHotels, showOrganizationPicker, isAdmin, isOwner } = useHotel();
  const [chartWidth, setChartWidth] = useState(0);
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
  const canViewAllProperties = isAdmin || isOwner;
  const trendValues = useMemo(() => {
    const raw =
      overview?.weeklyRevenue ||
      overview?.revenueTrend ||
      overview?.trend ||
      overview?.revenueByDay ||
      [];
    if (!Array.isArray(raw) || !raw.length) return [12, 17, 21, 16, 25, 14, 22];
    const nums = raw
      .map((item: any) => (typeof item === "number" ? item : Number(item?.value ?? item?.amount ?? item)))
      .filter((item: number) => Number.isFinite(item));
    return nums.length >= 4 ? nums.slice(-7) : [12, 17, 21, 16, 25, 14, 22];
  }, [overview]);
  const points = useMemo(() => {
    if (!chartWidth) return [];
    const chartHeight = 86;
    const min = Math.min(...trendValues);
    const max = Math.max(...trendValues);
    const span = max - min || 1;
    const padding = 10;
    return trendValues.map((value, index) => {
      const x = padding + (index / Math.max(1, trendValues.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - ((value - min) / span) * (chartHeight - 16) - 8;
      return { x, y, value };
    });
  }, [trendValues, chartWidth]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <HeaderBar title="Portfolio Overview" subtitle={`Updated ${formatDateLabel()}`} avatarUri={user?.avatar} icon="analytics">
        <View style={[styles.selectorCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {canViewAllProperties ? (
            <>
              <TouchableOpacity
                style={[styles.selectorBtn, { backgroundColor: !hotelId ? colors.primary : "transparent" }]}
                onPress={() => setHotelId(null)}
              >
                <MaterialIcons name="hub" size={16} color={!hotelId ? "#fff" : colors.textMuted} />
                <Text style={[styles.selectorText, { color: !hotelId ? "#fff" : colors.textMuted }]}>All Properties</Text>
              </TouchableOpacity>
              <View style={[styles.selectorDivider, { backgroundColor: colors.border }]} />
            </>
          ) : null}
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
          <View style={[styles.chartArea, { backgroundColor: colors.surfaceMuted }]} onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}>
            {points.slice(0, -1).map((point, index) => {
              const next = points[index + 1];
              const dx = next.x - point.x;
              const dy = next.y - point.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);
              return (
                <View
                  key={`segment-${index}`}
                  style={[
                    styles.lineSegment,
                    {
                      left: (point.x + next.x) / 2 - length / 2,
                      top: (point.y + next.y) / 2 - 1,
                      width: length,
                      backgroundColor: colors.primary,
                      transform: [{ rotateZ: `${angle}rad` }],
                    },
                  ]}
                />
              );
            })}
            {points.map((point, index) => (
              <View key={`point-${index}`} style={[styles.point, { left: point.x - 3, top: point.y - 3, backgroundColor: colors.primary }]} />
            ))}
            <View style={[styles.peakTag, { backgroundColor: colors.text }]}>
              <Text style={styles.peakText}>Peak: {formatCurrency(Math.max(...trendValues) * 1000)}</Text>
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
        <SectionTitle
          title="Hotels Performance"
          action="View All"
          onActionPress={() => {
            if (hotels.length === 1) {
              const only = hotels[0];
              const onlyId = String(only?.hotelId || only?._id || "");
              if (onlyId) {
                openHotelDetailScreen(onlyId);
                return;
              }
            }
            openTabScreen("hotels");
          }}
        />
        <View style={styles.hotelList}>
          {hotels.length ? (
            hotels.slice(0, 8).map((hotel: any) => (
              <HotelCard
                key={hotel?._id || hotel?.hotelId}
                name={hotel?.name}
                location={hotel?.address?.city || hotel?.address?.state || "No location"}
                image={hotel?.coverImage}
                onPress={() => openHotelDetailScreen(String(hotel?.hotelId || hotel?._id || ""))}
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
