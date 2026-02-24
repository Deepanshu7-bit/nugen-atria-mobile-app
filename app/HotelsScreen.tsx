import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HeaderBar } from "../components/HeaderBar";
import { EmptyState } from "../components/EmptyState";
import { HotelPicker } from "../components/HotelPicker";
import { HotelCard } from "../components/HotelCard";
import { SectionTitle } from "../components/SectionTitle";
import { useAuth } from "../contexts/AuthContext";
import { useHotel } from "../contexts/HotelContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { getDashboard } from "../services/api/dashboard";
import { getHotelsForListing } from "../services/api/hotels";
import { formatCurrency } from "../utils/format";
import { styles } from "../styles/app/HotelsScreen.styles";

const extractHotels = (payload: any) => {
  const list =
    payload?.data?.data?.hotels ||
    payload?.data?.hotels ||
    payload?.hotels ||
    payload?.data ||
    payload ||
    [];
  return Array.isArray(list) ? list : [];
};

export default function HotelsScreen() {
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const {
    organizations,
    organizationId,
    setOrganizationId,
    loadingOrgs,
    hotels,
    hotelId,
    setHotelId,
    loadingHotels,
    showOrganizationPicker,
  } = useHotel();

  const { data } = useAsync(
    () => (token ? getHotelsForListing(token, organizationId, { page: 1, limit: 20 }) : null),
    [token, organizationId],
    { enabled: !!token, cacheKey: token ? `hotels:${token}:${organizationId || "all"}` : null },
  );

  const listing = useMemo(() => {
    const fromApi = extractHotels(data);
    return fromApi.length ? fromApi : hotels;
  }, [data, hotels]);
  const { data: metricsData } = useAsync(
    () => (token && hotelId ? getDashboard(token, { hotelId }) : null),
    [token, hotelId],
    { enabled: !!token && !!hotelId, cacheKey: token ? `hotel-panel:${token}:${hotelId || "none"}` : null },
  );
  const overview = useMemo(() => metricsData?.data?.overview || metricsData?.overview || {}, [metricsData]);
  const activeHotel = useMemo(
    () => listing.find((hotel: any) => String(hotel?._id || hotel?.hotelId) === String(hotelId || "")) || listing[0],
    [hotelId, listing],
  );
  const revenue = Number(overview?.revenue ?? overview?.totalRevenue ?? 42850);
  const occupancy = Number(overview?.occupancy ?? overview?.occupancyRate ?? 88.2);
  const activeBookings = Number(overview?.activeBookings ?? overview?.newBookings ?? 156);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <HeaderBar
        title={activeHotel?.name || "Hotel Panel"}
        subtitle={`Status: ${activeHotel?.status || "Open"}`}
        avatarUri={user?.avatar}
        icon="apartment"
      >
        <View style={styles.pickers}>
          {showOrganizationPicker ? (
            <HotelPicker
              label="Organization"
              items={organizations}
              value={organizationId}
              onChange={setOrganizationId}
              loading={loadingOrgs}
            />
          ) : null}
          <HotelPicker label="Hotel" items={hotels} value={hotelId} onChange={setHotelId} loading={loadingHotels} />
        </View>
      </HeaderBar>

      <View style={styles.section}>
        <View style={[styles.primaryMetric, { backgroundColor: colors.primary }]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>TOTAL REVENUE</Text>
            <MaterialIcons name="payments" size={16} color="#fff" />
          </View>
          <Text style={styles.metricValue}>{formatCurrency(revenue)}</Text>
          <Text style={styles.metricHint}>↗ 12.5% vs last week</Text>
        </View>

        <View style={styles.metricRow}>
          <View style={[styles.secondaryMetric, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.metricHeader}>
              <Text style={[styles.secondaryLabel, { color: colors.textMuted }]}>OCCUPANCY RATE</Text>
              <MaterialIcons name="hotel" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.secondaryValue, { color: colors.text }]}>{occupancy.toFixed(1)}%</Text>
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
              <View style={[styles.progressBar, { backgroundColor: colors.primary, width: `${Math.max(8, Math.min(100, occupancy))}%` }]} />
            </View>
          </View>
          <View style={[styles.secondaryMetric, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.metricHeader}>
              <Text style={[styles.secondaryLabel, { color: colors.textMuted }]}>ACTIVE BOOKINGS</Text>
              <MaterialIcons name="event-available" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.secondaryValue, { color: colors.text }]}>{activeBookings}</Text>
            <Text style={[styles.secondaryHint, { color: colors.textMuted }]}>12 check-ins today</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle title="Hotels Listing" action={`${listing.length} total`} />
        {listing.length ? (
          <View style={styles.list}>
            {listing.slice(0, 24).map((hotel: any) => (
              <HotelCard
                key={hotel?._id || hotel?.hotelId || hotel?.name}
                name={hotel?.name || hotel?.hotelName || "Hotel"}
                location={hotel?.address?.city || hotel?.address?.state || hotel?.address?.country || ""}
                image={hotel?.coverImage || hotel?.images?.[0]}
              />
            ))}
          </View>
        ) : (
          <EmptyState icon="hotel" title="No hotels found" description="Create a hotel from the admin panel to see it here." />
        )}
        {!listing.length && !loadingHotels ? (
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Try switching organization or checking API filters.</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
