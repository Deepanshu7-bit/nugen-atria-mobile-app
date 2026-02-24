import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { EmptyState } from "../components/EmptyState";
import { NotificationCard } from "../components/NotificationCard";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAsync } from "../hooks/useAsync";
import { getNotifications, markAllRead } from "../services/api/notifications";
import { navigateBack } from "../services/navigation/appNavigation";
import { styles } from "../styles/app/NotificationsScreen.styles";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "orders", label: "Orders" },
  { key: "cancel", label: "Cancellations" },
];

const extractNotifications = (payload: any) => {
  const list =
    payload?.data?.data?.notifications ||
    payload?.data?.notifications ||
    payload?.notifications ||
    payload?.data ||
    payload ||
    [];
  return Array.isArray(list) ? list : [];
};

export default function NotificationsScreen() {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [filter, setFilter] = useState("all");

  const { data, refresh } = useAsync(
    () => (token ? getNotifications(token, { limit: 20, offset: 0 }) : null),
    [token],
    { enabled: !!token, cacheKey: token ? `notifications:${token}:20:0` : null, cacheTime: 0 },
  );

  const list = useMemo(() => extractNotifications(data), [data]);
  const filtered = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((item: any) => {
      const type = String(item?.type || item?.priority || "").toLowerCase();
      return filter === "orders" ? type.includes("order") : type.includes("cancel");
    });
  }, [list, filter]);
  const recent = useMemo(() => filtered.slice(0, 2), [filtered]);
  const older = useMemo(() => filtered.slice(2), [filtered]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.top}>
          <View style={styles.leftGroup}>
            <TouchableOpacity onPress={navigateBack} style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}>
              <MaterialIcons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          </View>
          <View style={styles.topRight}>
            <ThemeToggle size={34} />
            <TouchableOpacity
              onPress={async () => {
                if (!token) return;
                await markAllRead(token).catch(() => null);
                await refresh();
              }}
            >
              <Text style={[styles.markAll, { color: colors.primary }]}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.chip, { backgroundColor: filter === item.key ? colors.primary : colors.surface, borderColor: filter === item.key ? colors.primary : colors.border }]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.chipText, { color: filter === item.key ? "#fff" : colors.textMuted }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length ? <Text style={[styles.groupLabel, { color: colors.textMuted }]}>Recent</Text> : null}

        {recent.length ? (
          <View style={styles.list}>
            {recent.map((item: any, index: number) => (
              <NotificationCard
                key={item?._id || `${item?.createdAt || "n"}-${index}`}
                title={item?.title || item?.content?.title || "Notification"}
                message={item?.message || item?.content?.body || ""}
                time={item?.createdAt ? "Just now" : "2m ago"}
                priority={item?.priority || item?.type || "order"}
              />
            ))}
          </View>
        ) : null}

        {older.length ? <Text style={[styles.groupLabel, { color: colors.textMuted }]}>Yesterday</Text> : null}

        {older.length ? (
          <View style={styles.list}>
            {older.map((item: any, index: number) => (
              <NotificationCard
                key={item?._id || `${item?.createdAt || "o"}-${index}`}
                title={item?.title || item?.content?.title || "Notification"}
                message={item?.message || item?.content?.body || ""}
                time="Yesterday"
                priority={item?.priority || item?.type}
              />
            ))}
          </View>
        ) : null}

        {!filtered.length ? (
          <EmptyState icon="notifications-none" title="All caught up" description="No notifications to review right now." />
        ) : null}
      </View>
    </ScrollView>
  );
}
