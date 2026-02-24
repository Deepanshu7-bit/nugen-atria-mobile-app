import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HeaderBar } from "../components/HeaderBar";
import { EmptyState } from "../components/EmptyState";
import { HotelPicker } from "../components/HotelPicker";
import { HotelCard } from "../components/HotelCard";
import { SectionTitle } from "../components/SectionTitle";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useHotel } from "../contexts/HotelContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { getBookingsByHotel } from "../services/api/bookings";
import { getDashboard } from "../services/api/dashboard";
import {
  createFoodItem,
  getDietaryPreferencesForHotel,
  getFoodCategoriesForHotel,
  getFoodItemTypes,
  getFoodItemsByHotel,
} from "../services/api/foodItems";
import { getHotelAmenities, toggleHotelAmenity } from "../services/api/hotels";
import { createQuickService, getQuickServices } from "../services/api/quickServices";
import { getRoomById, getRoomsForListing } from "../services/api/rooms";
import { consumePendingHotelDetailId } from "../services/navigation/appNavigation";
import { formatCurrency } from "../utils/format";
import { styles } from "../styles/app/HotelsScreen.styles";

type ViewMode = "list" | "hotel" | "room";
type HotelTab = "services" | "food" | "rooms" | "amenities";
type RoomTab = "overview" | "bookings";

const HOTEL_TABS: { key: HotelTab; label: string }[] = [
  { key: "services", label: "Services" },
  { key: "food", label: "Food Items" },
  { key: "rooms", label: "Rooms" },
  { key: "amenities", label: "Amenities" },
];

const ROOM_TABS: { key: RoomTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "bookings", label: "Bookings" },
];

const SERVICE_STATUS = ["available", "busy", "unavailable"];
const PREP_UNITS = ["min", "hour"];

const arrayFrom = (...candidates: any[]) =>
  candidates.find((item) => Array.isArray(item)) || [];
const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};
const pickHotelId = (hotel: any) => String(hotel?.hotelId || hotel?._id || "");
const pickRoomId = (room: any) => String(room?.roomId || room?._id || "");
const pickRoomNumber = (room: any) => String(room?.roomNumber || room?.number || "");
const pickAmenityId = (amenity: any) => String(amenity?._id || amenity?.amenityId || amenity?.code || amenity?.name || "");

const extractRooms = (payload: any) =>
  arrayFrom(payload?.data?.data?.rooms, payload?.data?.rooms, payload?.rooms, payload?.data, payload);
const extractRoomDetail = (payload: any) =>
  payload?.data?.data?.room || payload?.data?.room || payload?.room || payload?.data || payload || null;
const extractFoodItems = (payload: any) =>
  arrayFrom(payload?.data?.data?.foodItems, payload?.data?.foodItems, payload?.foodItems, payload?.data, payload);
const extractQuickServices = (payload: any) =>
  arrayFrom(payload?.data?.data?.quickServices, payload?.data?.quickServices, payload?.quickServices, payload?.data, payload);
const extractBookings = (payload: any) =>
  arrayFrom(payload?.data?.data?.bookings, payload?.data?.bookings, payload?.bookings, payload?.data, payload);
const extractAmenities = (payload: any) =>
  arrayFrom(payload?.data?.data, payload?.data?.amenities, payload?.amenities, payload?.data, payload);
const extractCategories = (payload: any) =>
  arrayFrom(payload?.data?.data, payload?.data?.categories, payload?.categories, payload?.data, payload);
const extractDietaryPreferences = (payload: any) =>
  arrayFrom(payload?.data?.data, payload?.data?.dietaryPreferences, payload?.dietaryPreferences, payload?.data, payload);
const extractFoodTypes = (payload: any) =>
  arrayFrom(payload?.data?.data, payload?.data?.types, payload?.types, payload?.data, payload);

const parseTags = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const amenityIconName = (name: string) => {
  const normalized = String(name || "").toLowerCase();
  if (normalized.includes("wifi")) return "wifi";
  if (normalized.includes("pool")) return "pool";
  if (normalized.includes("gym")) return "fitness-center";
  if (normalized.includes("parking")) return "local-parking";
  if (normalized.includes("restaurant") || normalized.includes("food")) return "restaurant";
  if (normalized.includes("spa")) return "spa";
  return "check-circle";
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
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [hotelTab, setHotelTab] = useState<HotelTab>("services");
  const [roomTab, setRoomTab] = useState<RoomTab>("overview");
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [showFoodForm, setShowFoodForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [savingFood, setSavingFood] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [foodError, setFoodError] = useState("");
  const [serviceError, setServiceError] = useState("");
  const [amenityLoadingId, setAmenityLoadingId] = useState("");
  const [amenityStates, setAmenityStates] = useState<Record<string, boolean>>({});

  const [foodForm, setFoodForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    prepTimeValue: "",
    prepTimeUnit: "min",
    description: "",
    image: "",
    available: true,
    popular: false,
    dietaryTags: "",
    foodItemType: "",
  });
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "",
    description: "",
    avgTime: "",
    status: "available",
    chargeable: false,
    price: "",
    image: "",
    serviceType: "",
  });

  const listing = useMemo(() => hotels || [], [hotels]);
  const activeHotel = useMemo(() => {
    const id = String(selectedHotelId || hotelId || "");
    return listing.find((hotel: any) => pickHotelId(hotel) === id) || listing[0] || null;
  }, [listing, selectedHotelId, hotelId]);
  const activeHotelId = useMemo(() => (activeHotel ? pickHotelId(activeHotel) : null), [activeHotel]);

  const handleOpenHotel = useCallback(
    (hotelOrId: any) => {
      const id = typeof hotelOrId === "string" ? String(hotelOrId) : pickHotelId(hotelOrId);
      if (!id) return;
      setSelectedHotelId(id);
      setHotelId(id);
      setSelectedRoom(null);
      setSelectedRoomId(null);
      setViewMode("hotel");
      setHotelTab("services");
    },
    [setHotelId],
  );

  useEffect(() => {
    const pendingHotelId = consumePendingHotelDetailId();
    if (pendingHotelId) handleOpenHotel(pendingHotelId);
  }, [handleOpenHotel]);

  const { data: metricsData } = useAsync(
    () => (token && activeHotelId ? getDashboard(token, { hotelId: activeHotelId }) : null),
    [token, activeHotelId],
    {
      enabled: !!token && !!activeHotelId,
      cacheKey: token ? `hotel-panel:${token}:${activeHotelId || "none"}` : null,
    },
  );
  const overview = useMemo(() => metricsData?.data?.overview || metricsData?.overview || {}, [metricsData]);
  const revenue = toNumber(overview?.revenue ?? overview?.totalRevenue, 42850);
  const occupancy = toNumber(overview?.occupancy ?? overview?.occupancyRate, 88.2);

  const { data: roomsData } = useAsync(
    () => (token && activeHotelId ? getRoomsForListing(token, activeHotelId, { page: 1, limit: 50 }) : null),
    [token, activeHotelId],
    {
      enabled: !!token && !!activeHotelId && viewMode !== "list",
      cacheKey: token ? `rooms:${token}:${activeHotelId || "none"}` : null,
    },
  );
  const rooms = useMemo(() => extractRooms(roomsData), [roomsData]);

  const { data: roomDetailData } = useAsync(
    () => (token && selectedRoomId ? getRoomById(token, selectedRoomId) : null),
    [token, selectedRoomId],
    {
      enabled: !!token && !!selectedRoomId && viewMode === "room",
      cacheKey: token ? `room:${token}:${selectedRoomId || "none"}` : null,
    },
  );
  const roomDetail = useMemo(() => extractRoomDetail(roomDetailData), [roomDetailData]);
  const activeRoom = useMemo(() => roomDetail || selectedRoom || null, [roomDetail, selectedRoom]);

  const { data: quickServicesData, refresh: refreshQuickServices } = useAsync(
    () => (token && activeHotelId ? getQuickServices(token, activeHotelId, { includeInactive: true }) : null),
    [token, activeHotelId],
    {
      enabled: !!token && !!activeHotelId && viewMode === "hotel",
      cacheKey: token ? `quick-services:${token}:${activeHotelId || "none"}` : null,
      cacheTime: 0,
    },
  );
  const quickServices = useMemo(() => extractQuickServices(quickServicesData), [quickServicesData]);

  const { data: foodItemsData, refresh: refreshFoodItems } = useAsync(
    () => (token && activeHotelId ? getFoodItemsByHotel(token, activeHotelId, { page: 1, limit: 50 }) : null),
    [token, activeHotelId],
    {
      enabled: !!token && !!activeHotelId && viewMode === "hotel",
      cacheKey: token ? `food-items:${token}:${activeHotelId || "none"}` : null,
      cacheTime: 0,
    },
  );
  const foodItems = useMemo(() => extractFoodItems(foodItemsData), [foodItemsData]);

  const { data: categoriesData } = useAsync(
    () => (token && activeHotelId ? getFoodCategoriesForHotel(token, activeHotelId) : null),
    [token, activeHotelId],
    {
      enabled: !!token && !!activeHotelId && viewMode === "hotel",
      cacheKey: token ? `food-categories:${token}:${activeHotelId || "none"}` : null,
    },
  );
  const categories = useMemo(() => extractCategories(categoriesData), [categoriesData]);

  const { data: dietaryData } = useAsync(
    () => (token && activeHotelId ? getDietaryPreferencesForHotel(token, activeHotelId) : null),
    [token, activeHotelId],
    {
      enabled: !!token && !!activeHotelId && viewMode === "hotel",
      cacheKey: token ? `dietary:${token}:${activeHotelId || "none"}` : null,
    },
  );
  const dietaryPreferences = useMemo(() => extractDietaryPreferences(dietaryData), [dietaryData]);

  const { data: foodTypesData } = useAsync(
    () => (token ? getFoodItemTypes(token) : null),
    [token],
    { enabled: !!token && viewMode === "hotel", cacheKey: token ? `food-types:${token}` : null },
  );
  const foodTypes = useMemo(() => extractFoodTypes(foodTypesData), [foodTypesData]);

  const { data: amenitiesData, refresh: refreshAmenities } = useAsync(
    () => (token && activeHotelId ? getHotelAmenities(token, activeHotelId, { includeInactive: true }) : null),
    [token, activeHotelId],
    {
      enabled: !!token && !!activeHotelId && viewMode === "hotel",
      cacheKey: token ? `amenities:${token}:${activeHotelId || "none"}` : null,
      cacheTime: 0,
    },
  );
  const amenities = useMemo(() => extractAmenities(amenitiesData), [amenitiesData]);

  const { data: bookingData } = useAsync(
    () => (token && activeHotelId ? getBookingsByHotel(token, activeHotelId) : null),
    [token, activeHotelId],
    {
      enabled: !!token && !!activeHotelId && viewMode === "room",
      cacheKey: token ? `bookings:${token}:${activeHotelId || "none"}` : null,
    },
  );
  const roomBookings = useMemo(() => {
    const all = extractBookings(bookingData);
    if (!activeRoom) return all;
    const roomId = pickRoomId(activeRoom);
    const roomNumber = pickRoomNumber(activeRoom);
    return all.filter((booking: any) => {
      const bookingRoomId = String(booking?.roomId || booking?.roomDetails?._id || booking?.room?._id || "");
      const bookingRoomNumber = String(booking?.roomNumber || booking?.roomDetails?.roomNumber || booking?.room?.roomNumber || "");
      if (roomId && bookingRoomId && roomId === bookingRoomId) return true;
      if (roomNumber && bookingRoomNumber && roomNumber === bookingRoomNumber) return true;
      return false;
    });
  }, [bookingData, activeRoom]);

  useEffect(() => {
    if (!amenities.length) {
      setAmenityStates({});
      return;
    }
    const next: Record<string, boolean> = {};
    amenities.forEach((item: any) => {
      const key = pickAmenityId(item);
      next[key] = Boolean(item?.isEnabled ?? item?.enabled ?? item?.isActive);
    });
    setAmenityStates(next);
  }, [amenities]);

  const groupedAmenities = useMemo(() => {
    const groupMap: Record<string, any[]> = {};
    amenities.forEach((item: any) => {
      const category = String(item?.category || "Other");
      if (!groupMap[category]) groupMap[category] = [];
      groupMap[category].push(item);
    });
    return Object.entries(groupMap).map(([category, items]) => ({ category, items }));
  }, [amenities]);

  const handleToggleAmenity = async (amenity: any) => {
    if (!token || !activeHotelId) return;
    const amenityId = String(amenity?._id || amenity?.amenityId || "");
    if (!amenityId) return;
    const key = pickAmenityId(amenity);
    const current = amenityStates[key] ?? false;
    const next = !current;
    setAmenityStates((prev) => ({ ...prev, [key]: next }));
    setAmenityLoadingId(key);
    try {
      await toggleHotelAmenity(token, activeHotelId, amenityId, next);
      await refreshAmenities();
    } catch {
      setAmenityStates((prev) => ({ ...prev, [key]: current }));
    } finally {
      setAmenityLoadingId("");
    }
  };

  const handleOpenRoom = (room: any) => {
    setSelectedRoom(room);
    setSelectedRoomId(pickRoomId(room) || null);
    setRoomTab("overview");
    setViewMode("room");
  };

  const resetFoodForm = () =>
    setFoodForm({
      name: "",
      categoryId: "",
      price: "",
      prepTimeValue: "",
      prepTimeUnit: "min",
      description: "",
      image: "",
      available: true,
      popular: false,
      dietaryTags: "",
      foodItemType: "",
    });

  const handleAddFoodItem = async () => {
    if (!token || !activeHotelId) return;
    if (!foodForm.name.trim()) return setFoodError("Food item name is required.");
    if (!foodForm.categoryId) return setFoodError("Choose a category.");
    const price = Number(foodForm.price);
    if (!Number.isFinite(price) || price <= 0) return setFoodError("Enter a valid price.");
    const prepTime = Number(foodForm.prepTimeValue);
    if (!Number.isFinite(prepTime) || prepTime <= 0) return setFoodError("Enter preparation time.");
    const preparationTime = foodForm.prepTimeUnit === "hour" ? prepTime * 60 : prepTime;
    const payload: any = {
      categoryId: foodForm.categoryId,
      name: foodForm.name.trim(),
      description: foodForm.description.trim(),
      price,
      currency: "INR",
      image: foodForm.image.trim(),
      foodType: foodForm.foodItemType || undefined,
      dietaryTags: parseTags(foodForm.dietaryTags),
      preparationTime,
      isPopular: foodForm.popular,
      isAvailable: foodForm.available,
      displayOrder: foodItems.length,
    };
    setSavingFood(true);
    setFoodError("");
    try {
      await createFoodItem(token, activeHotelId, payload);
      resetFoodForm();
      setShowFoodForm(false);
      await refreshFoodItems();
    } catch (error: any) {
      setFoodError(error?.message || "Failed to add food item.");
    } finally {
      setSavingFood(false);
    }
  };

  const resetServiceForm = () =>
    setServiceForm({
      name: "",
      category: "",
      description: "",
      avgTime: "",
      status: "available",
      chargeable: false,
      price: "",
      image: "",
      serviceType: "",
    });

  const handleAddService = async () => {
    if (!token || !activeHotelId) return;
    if (!serviceForm.name.trim()) return setServiceError("Service name is required.");
    if (!serviceForm.category.trim()) return setServiceError("Category is required.");
    if (!serviceForm.description.trim()) return setServiceError("Description is required.");
    const avgTime = Number(serviceForm.avgTime);
    if (!Number.isFinite(avgTime) || avgTime <= 0) return setServiceError("Average time must be a valid number.");
    const price = Number(serviceForm.price);
    if (serviceForm.chargeable && (!Number.isFinite(price) || price <= 0)) {
      return setServiceError("Enter a valid service price.");
    }
    const payload = {
      name: serviceForm.name.trim(),
      category: serviceForm.category.trim(),
      description: serviceForm.description.trim(),
      timeTaken: avgTime,
      status: serviceForm.status,
      serviceType: serviceForm.serviceType.trim() || serviceForm.category.trim(),
      chargeable: serviceForm.chargeable,
      price: serviceForm.chargeable ? price : 0,
      image: serviceForm.image.trim(),
      isActive: serviceForm.status !== "unavailable",
    };
    setSavingService(true);
    setServiceError("");
    try {
      await createQuickService(token, activeHotelId, payload);
      resetServiceForm();
      setShowServiceForm(false);
      await refreshQuickServices();
    } catch (error: any) {
      setServiceError(error?.message || "Failed to add service.");
    } finally {
      setSavingService(false);
    }
  };

  const roomImage = useMemo(() => {
    const images = arrayFrom(activeRoom?.images, activeRoom?.photos);
    const first = images.find((item: any) => (typeof item === "string" ? item : item?.url));
    if (!first) return activeHotel?.coverImage || activeHotel?.images?.[0] || "";
    return typeof first === "string" ? first : first?.url || "";
  }, [activeRoom, activeHotel]);

  if (viewMode === "hotel") {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setViewMode("list")} style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}>
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.detailTitleWrap}>
            <Text style={[styles.detailTitle, { color: colors.text }]} numberOfLines={1}>
              {activeHotel?.name || "Hotel Detail"}
            </Text>
            <Text style={[styles.detailSub, { color: colors.textMuted }]} numberOfLines={1}>
              {activeHotel?.address?.city || activeHotel?.address?.state || "Address not available"}
            </Text>
          </View>
          <ThemeToggle size={34} />
        </View>

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
              <Text style={[styles.secondaryLabel, { color: colors.textMuted }]}>OCCUPANCY</Text>
              <Text style={[styles.secondaryValue, { color: colors.text }]}>{occupancy.toFixed(1)}%</Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
                <View style={[styles.progressBar, { backgroundColor: colors.primary, width: `${Math.max(8, Math.min(100, occupancy))}%` }]} />
              </View>
            </View>
            <View style={[styles.secondaryMetric, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.secondaryLabel, { color: colors.textMuted }]}>TOTAL ROOMS</Text>
              <Text style={[styles.secondaryValue, { color: colors.text }]}>{rooms.length || 0}</Text>
              <Text style={[styles.secondaryHint, { color: colors.textMuted }]}>Room inventory</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.detailTabs, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            {HOTEL_TABS.map((item) => {
              const active = hotelTab === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.detailTabBtn, active && [styles.detailTabBtnActive, { backgroundColor: colors.primary }]]}
                  onPress={() => setHotelTab(item.key)}
                >
                  <Text style={[styles.detailTabText, { color: active ? "#fff" : colors.textMuted }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {hotelTab === "services" ? (
          <View style={styles.section}>
            <View style={styles.toolbarRow}>
              <SectionTitle title="Quick Services" action={`${quickServices.length} items`} />
              <TouchableOpacity style={[styles.addMiniBtn, { backgroundColor: colors.primary }]} onPress={() => setShowServiceForm((prev) => !prev)}>
                <MaterialIcons name={showServiceForm ? "close" : "add"} size={16} color="#fff" />
                <Text style={styles.addMiniText}>{showServiceForm ? "Close" : "Add"}</Text>
              </TouchableOpacity>
            </View>

            {showServiceForm ? (
              <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <TextInput
                  value={serviceForm.name}
                  onChangeText={(value) => setServiceForm((prev) => ({ ...prev, name: value }))}
                  placeholder="Service name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />
                <View style={styles.rowSplit}>
                  <TextInput
                    value={serviceForm.category}
                    onChangeText={(value) => setServiceForm((prev) => ({ ...prev, category: value }))}
                    placeholder="Category"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, styles.halfInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  />
                  <TextInput
                    value={serviceForm.avgTime}
                    onChangeText={(value) => setServiceForm((prev) => ({ ...prev, avgTime: value }))}
                    placeholder="Average time (min)"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, styles.halfInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  />
                </View>
                <TextInput
                  value={serviceForm.serviceType}
                  onChangeText={(value) => setServiceForm((prev) => ({ ...prev, serviceType: value }))}
                  placeholder="Service type (optional)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />
                <TextInput
                  value={serviceForm.image}
                  onChangeText={(value) => setServiceForm((prev) => ({ ...prev, image: value }))}
                  placeholder="Image URL (optional)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />
                <TextInput
                  value={serviceForm.description}
                  onChangeText={(value) => setServiceForm((prev) => ({ ...prev, description: value }))}
                  multiline
                  placeholder="Description"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.inputMultiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />

                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Service Status</Text>
                <View style={styles.chipWrap}>
                  {SERVICE_STATUS.map((item) => {
                    const active = serviceForm.status === item;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[styles.chip, active && [styles.chipActive, { backgroundColor: colors.primary, borderColor: colors.primary }], { borderColor: colors.border, backgroundColor: colors.surface }]}
                        onPress={() => setServiceForm((prev) => ({ ...prev, status: item }))}
                      >
                        <Text style={[styles.chipText, { color: active ? "#fff" : colors.textMuted }]}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={[styles.switchRow, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Chargeable Service</Text>
                  <Switch
                    value={serviceForm.chargeable}
                    onValueChange={(value) => setServiceForm((prev) => ({ ...prev, chargeable: value }))}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>

                {serviceForm.chargeable ? (
                  <TextInput
                    value={serviceForm.price}
                    onChangeText={(value) => setServiceForm((prev) => ({ ...prev, price: value }))}
                    keyboardType="numeric"
                    placeholder="Price"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  />
                ) : null}

                {serviceError ? <Text style={[styles.errorText, { color: colors.danger }]}>{serviceError}</Text> : null}
                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: savingService ? 0.6 : 1 }]} onPress={handleAddService} disabled={savingService}>
                  {savingService ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save Service</Text>}
                </TouchableOpacity>
              </View>
            ) : null}

            {quickServices.length ? (
              <View style={styles.serviceGrid}>
                {quickServices.slice(0, 30).map((item: any, index: number) => {
                  const imageUri = String(item?.image || item?.icon || "");
                  const active = item?.isActive !== false && !String(item?.status || "").toLowerCase().includes("inactive");
                  return (
                    <View key={`${item?._id || item?.serviceId || index}`} style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                      {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.serviceImage} />
                      ) : (
                        <View style={[styles.serviceFallback, { backgroundColor: colors.primarySoft }]}>
                          <MaterialIcons name="room-service" size={18} color={colors.primary} />
                        </View>
                      )}
                      <View style={styles.serviceBody}>
                        <Text style={[styles.serviceTitle, { color: colors.text }]} numberOfLines={1}>
                          {item?.name || "Service"}
                        </Text>
                        <Text style={[styles.serviceMeta, { color: colors.textMuted }]} numberOfLines={1}>
                          {item?.timeTaken ? `${item.timeTaken} min` : "No ETA"} • {item?.price ? formatCurrency(Number(item.price)) : "Free"}
                        </Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: active ? "rgba(16,185,129,0.16)" : colors.surfaceMuted }]}>
                        <Text style={[styles.statusText, { color: active ? colors.success : colors.textMuted }]}>{active ? "Active" : "Inactive"}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <EmptyState icon="room-service" title="No quick services" description="No quick services found for this hotel." />
            )}
          </View>
        ) : null}

        {hotelTab === "food" ? (
          <View style={styles.section}>
            <View style={styles.toolbarRow}>
              <SectionTitle title="Food Items" action={`${foodItems.length} items`} />
              <TouchableOpacity style={[styles.addMiniBtn, { backgroundColor: colors.primary }]} onPress={() => setShowFoodForm((prev) => !prev)}>
                <MaterialIcons name={showFoodForm ? "close" : "add"} size={16} color="#fff" />
                <Text style={styles.addMiniText}>{showFoodForm ? "Close" : "Add"}</Text>
              </TouchableOpacity>
            </View>

            {showFoodForm ? (
              <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <TextInput
                  value={foodForm.name}
                  onChangeText={(value) => setFoodForm((prev) => ({ ...prev, name: value }))}
                  placeholder="Item name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />
                <View style={styles.rowSplit}>
                  <TextInput
                    value={foodForm.price}
                    onChangeText={(value) => setFoodForm((prev) => ({ ...prev, price: value }))}
                    keyboardType="numeric"
                    placeholder="Price"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, styles.halfInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  />
                  <TextInput
                    value={foodForm.prepTimeValue}
                    onChangeText={(value) => setFoodForm((prev) => ({ ...prev, prepTimeValue: value }))}
                    keyboardType="numeric"
                    placeholder="Prep time"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, styles.halfInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  />
                </View>

                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Prep Unit</Text>
                <View style={styles.chipWrap}>
                  {PREP_UNITS.map((unit) => {
                    const active = foodForm.prepTimeUnit === unit;
                    return (
                      <TouchableOpacity
                        key={unit}
                        style={[styles.chip, active && [styles.chipActive, { backgroundColor: colors.primary, borderColor: colors.primary }], { borderColor: colors.border, backgroundColor: colors.surface }]}
                        onPress={() => setFoodForm((prev) => ({ ...prev, prepTimeUnit: unit }))}
                      >
                        <Text style={[styles.chipText, { color: active ? "#fff" : colors.textMuted }]}>{unit}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Category</Text>
                <View style={styles.chipWrap}>
                  {categories.length ? (
                    categories.slice(0, 20).map((category: any) => {
                      const categoryId = String(category?._id || category?.categoryId || category?.id || "");
                      const active = foodForm.categoryId === categoryId;
                      return (
                        <TouchableOpacity
                          key={categoryId || category?.name}
                          style={[styles.chip, active && [styles.chipActive, { backgroundColor: colors.primary, borderColor: colors.primary }], { borderColor: colors.border, backgroundColor: colors.surface }]}
                          onPress={() => setFoodForm((prev) => ({ ...prev, categoryId }))}
                        >
                          <Text style={[styles.chipText, { color: active ? "#fff" : colors.textMuted }]}>{category?.name || "Category"}</Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={[styles.inlineHint, { color: colors.textMuted }]}>No categories found for this hotel.</Text>
                  )}
                </View>

                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Food Type</Text>
                <View style={styles.chipWrap}>
                  {foodTypes.length ? (
                    foodTypes.slice(0, 10).map((type: any) => {
                      const value = String(type?.value || type?.code || "");
                      const active = foodForm.foodItemType === value;
                      return (
                        <TouchableOpacity
                          key={value || type?.label}
                          style={[styles.chip, active && [styles.chipActive, { backgroundColor: colors.primary, borderColor: colors.primary }], { borderColor: colors.border, backgroundColor: colors.surface }]}
                          onPress={() => setFoodForm((prev) => ({ ...prev, foodItemType: value }))}
                        >
                          <Text style={[styles.chipText, { color: active ? "#fff" : colors.textMuted }]}>{type?.label || value}</Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={[styles.inlineHint, { color: colors.textMuted }]}>Food types unavailable.</Text>
                  )}
                </View>

                <TextInput
                  value={foodForm.dietaryTags}
                  onChangeText={(value) => setFoodForm((prev) => ({ ...prev, dietaryTags: value }))}
                  placeholder={`Dietary tags (comma separated). ${dietaryPreferences.length ? `Eg: ${String(dietaryPreferences[0]?.name || "")}` : ""}`}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />
                <TextInput
                  value={foodForm.image}
                  onChangeText={(value) => setFoodForm((prev) => ({ ...prev, image: value }))}
                  placeholder="Image URL (optional)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />
                <TextInput
                  value={foodForm.description}
                  onChangeText={(value) => setFoodForm((prev) => ({ ...prev, description: value }))}
                  multiline
                  placeholder="Description"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.inputMultiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />

                <View style={[styles.switchRow, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Available</Text>
                  <Switch
                    value={foodForm.available}
                    onValueChange={(value) => setFoodForm((prev) => ({ ...prev, available: value }))}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
                <View style={[styles.switchRow, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Popular</Text>
                  <Switch
                    value={foodForm.popular}
                    onValueChange={(value) => setFoodForm((prev) => ({ ...prev, popular: value }))}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>

                {foodError ? <Text style={[styles.errorText, { color: colors.danger }]}>{foodError}</Text> : null}
                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: savingFood ? 0.6 : 1 }]} onPress={handleAddFoodItem} disabled={savingFood}>
                  {savingFood ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save Food Item</Text>}
                </TouchableOpacity>
              </View>
            ) : null}

            {foodItems.length ? (
              <View style={styles.foodList}>
                {foodItems.slice(0, 40).map((item: any, index: number) => (
                  <View key={`${item?._id || item?.foodItemId || index}`} style={[styles.foodCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.foodHead}>
                      <View style={[styles.foodIconWrap, { backgroundColor: colors.primarySoft }]}>
                        <MaterialIcons name="restaurant-menu" size={16} color={colors.primary} />
                      </View>
                      <View style={styles.foodBody}>
                        <Text style={[styles.foodTitle, { color: colors.text }]} numberOfLines={1}>
                          {item?.name || "Food Item"}
                        </Text>
                        <Text style={[styles.foodMeta, { color: colors.textMuted }]} numberOfLines={1}>
                          {(item?.categoryId?.name || item?.categoryName || "Category")} • {formatCurrency(Number(item?.price || 0))}
                        </Text>
                      </View>
                      {item?.isAvailable === false ? (
                        <View style={[styles.statusPill, { backgroundColor: colors.surfaceMuted }]}>
                          <Text style={[styles.statusText, { color: colors.textMuted }]}>Inactive</Text>
                        </View>
                      ) : null}
                    </View>
                    {(item?.foodType || item?.dietaryTags?.length) ? (
                      <Text style={[styles.foodMeta, { color: colors.textMuted }]}>
                        {item?.foodType || "Food"} {item?.dietaryTags?.length ? `• ${item.dietaryTags.join(", ")}` : ""}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState icon="restaurant" title="No food items" description="Add your first food item for this hotel." />
            )}
          </View>
        ) : null}

        {hotelTab === "rooms" ? (
          <View style={styles.section}>
            <SectionTitle title="Rooms" action={`${rooms.length} total`} />
            {rooms.length ? (
              <View style={styles.list}>
                {rooms.slice(0, 40).map((room: any) => (
                  <TouchableOpacity
                    key={pickRoomId(room) || room?.roomNumber || room?.name}
                    style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => handleOpenRoom(room)}
                  >
                    <View>
                      <Text style={[styles.infoTitle, { color: colors.text }]}>Room {room?.roomNumber || room?.number || "-"}</Text>
                      <Text style={[styles.infoSub, { color: colors.textMuted }]}>
                        {room?.roomType || room?.type || "Standard"} • {room?.status || room?.roomStatus || "Available"}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <EmptyState icon="hotel" title="No rooms found" description="Room list will appear once available." />
            )}
          </View>
        ) : null}

        {hotelTab === "amenities" ? (
          <View style={styles.section}>
            <SectionTitle title="Amenities" action={`${amenities.length} total`} />
            {groupedAmenities.length ? (
              <View style={styles.list}>
                {groupedAmenities.map((group) => (
                  <View key={group.category} style={[styles.amenityGroup, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.amenityGroupTitle, { color: colors.textMuted }]}>{String(group.category).replace(/_/g, " ")}</Text>
                    {group.items.map((amenity: any) => {
                      const key = pickAmenityId(amenity);
                      const checked = amenityStates[key] ?? false;
                      const loading = amenityLoadingId === key;
                      return (
                        <View key={key} style={[styles.amenityRow, { borderBottomColor: colors.border }]}>
                          <View style={styles.amenityInfo}>
                            <MaterialIcons name={amenityIconName(amenity?.name) as any} size={16} color={colors.primary} />
                            <Text style={[styles.amenityName, { color: colors.text }]}>{amenity?.name || "Amenity"}</Text>
                          </View>
                          {loading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                          ) : (
                            <Switch
                              value={checked}
                              onValueChange={() => handleToggleAmenity(amenity)}
                              trackColor={{ false: colors.border, true: colors.primary }}
                              thumbColor="#fff"
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState icon="checklist" title="No amenities" description="Amenities were not found for this hotel." />
            )}
          </View>
        ) : null}
      </ScrollView>
    );
  }

  if (viewMode === "room") {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setViewMode("hotel")} style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}>
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.detailTitleWrap}>
            <Text style={[styles.detailTitle, { color: colors.text }]} numberOfLines={1}>
              Room {activeRoom?.roomNumber || activeRoom?.number || "-"}
            </Text>
            <Text style={[styles.detailSub, { color: colors.textMuted }]} numberOfLines={1}>
              {activeRoom?.roomType || activeRoom?.type || "Room Detail"}
            </Text>
          </View>
          <ThemeToggle size={34} />
        </View>

        <View style={styles.section}>
          <View style={[styles.roomHero, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {roomImage ? (
              <Image source={{ uri: roomImage }} style={styles.roomHeroImage} />
            ) : (
              <View style={[styles.roomHeroFallback, { backgroundColor: colors.surfaceMuted }]}>
                <MaterialIcons name="meeting-room" size={28} color={colors.textMuted} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.detailTabs, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            {ROOM_TABS.map((item) => {
              const active = roomTab === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.detailTabBtn, active && [styles.detailTabBtnActive, { backgroundColor: colors.primary }]]}
                  onPress={() => setRoomTab(item.key)}
                >
                  <Text style={[styles.detailTabText, { color: active ? "#fff" : colors.textMuted }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {roomTab === "overview" ? (
          <View style={styles.section}>
            <View style={styles.roomFacts}>
              <View style={[styles.roomFactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.roomFactLabel, { color: colors.textMuted }]}>Status</Text>
                <Text style={[styles.roomFactValue, { color: colors.text }]}>{activeRoom?.status || activeRoom?.roomStatus || "Available"}</Text>
              </View>
              <View style={[styles.roomFactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.roomFactLabel, { color: colors.textMuted }]}>Type</Text>
                <Text style={[styles.roomFactValue, { color: colors.text }]}>{activeRoom?.roomType || activeRoom?.type || "Standard"}</Text>
              </View>
            </View>
            <View style={styles.roomFacts}>
              <View style={[styles.roomFactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.roomFactLabel, { color: colors.textMuted }]}>Occupancy</Text>
                <Text style={[styles.roomFactValue, { color: colors.text }]}>{toNumber(activeRoom?.maxOccupancy || activeRoom?.adultCapacity || activeRoom?.capacity, 2)}</Text>
              </View>
              <View style={[styles.roomFactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.roomFactLabel, { color: colors.textMuted }]}>Base Price</Text>
                <Text style={[styles.roomFactValue, { color: colors.text }]}>
                  {formatCurrency(toNumber(activeRoom?.pricing?.basePrice || activeRoom?.basePrice, 0))}
                </Text>
              </View>
            </View>
            <View style={[styles.secondaryMetric, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.secondaryLabel, { color: colors.textMuted }]}>ROOM NOTES</Text>
              <Text style={[styles.secondaryHint, { color: colors.textMuted }]}>
                {activeRoom?.description || "No room description available."}
              </Text>
              <Text style={[styles.secondaryHint, { color: colors.textMuted }]}>
                Amenities: {arrayFrom(activeRoom?.amenities).map((item: any) => item?.name || item?.code || item).filter(Boolean).join(", ") || "Not listed"}
              </Text>
            </View>
          </View>
        ) : null}

        {roomTab === "bookings" ? (
          <View style={styles.section}>
            <SectionTitle title="Bookings" action={`${roomBookings.length} total`} />
            {roomBookings.length ? (
              <View style={styles.list}>
                {roomBookings.slice(0, 40).map((booking: any, index: number) => (
                  <View key={`${booking?._id || booking?.bookingId || index}`} style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.infoTitle, { color: colors.text }]} numberOfLines={1}>
                      {`${booking?.guestDetails?.firstName || ""} ${booking?.guestDetails?.lastName || ""}`.trim() || "Guest"}
                    </Text>
                    <Text style={[styles.infoSub, { color: colors.textMuted }]}>
                      {booking?.bookingId || booking?._id || "Booking"} • {booking?.status || "pending"}
                    </Text>
                    <Text style={[styles.infoSub, { color: colors.textMuted }]}>
                      Check-in: {booking?.checkInDate ? String(booking.checkInDate).slice(0, 10) : "N/A"}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState icon="event-busy" title="No room bookings" description="No bookings found for this room." />
            )}
          </View>
        ) : null}
      </ScrollView>
    );
  }

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
              <Text style={[styles.secondaryLabel, { color: colors.textMuted }]}>TOTAL ROOMS</Text>
              <MaterialIcons name="meeting-room" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.secondaryValue, { color: colors.text }]}>{rooms.length || 0}</Text>
            <Text style={[styles.secondaryHint, { color: colors.textMuted }]}>Tap a hotel to view details</Text>
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
                onPress={() => handleOpenHotel(hotel)}
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
