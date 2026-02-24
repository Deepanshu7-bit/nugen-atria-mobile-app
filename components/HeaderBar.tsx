import React, { useMemo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { getUnreadCount } from "../services/api/notifications";
import { openNotificationsScreen, openProfileScreen } from "../services/navigation/appNavigation";
import { styles } from "../styles/components/HeaderBar.styles";

type Props = {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  avatarUri?: string | null;
  children?: React.ReactNode;
  icon?: any;
  showThemeToggle?: boolean;
  showNotificationIcon?: boolean;
};

export function HeaderBar({
  title,
  subtitle,
  rightSlot,
  avatarUri,
  children,
  icon,
  showThemeToggle = true,
  showNotificationIcon = true,
}: Props) {
  const { colors } = useTheme();
  const { token } = useAuth();
  const { data: unreadData } = useAsync(
    () => (token ? getUnreadCount(token) : null),
    [token],
    { enabled: !!token, cacheKey: token ? `notifications-unread:${token}` : null, cacheTime: 0 },
  );

  const unreadCount = useMemo(() => {
    const raw = unreadData?.data?.count ?? unreadData?.count ?? unreadData?.data?.unreadCount ?? unreadData?.unreadCount ?? 0;
    const count = Number(raw);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  }, [unreadData]);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
            <MaterialIcons name={icon} size={18} color="#fff" />
          </View>
        ) : null}

        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.right}>
          {rightSlot}
          {showNotificationIcon ? (
            <TouchableOpacity
              onPress={openNotificationsScreen}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceMuted }]}
            >
              <MaterialIcons name="notifications" size={18} color={colors.text} />
              {unreadCount > 0 ? <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]} /> : null}
            </TouchableOpacity>
          ) : null}
          {showThemeToggle ? <ThemeToggle size={34} /> : null}
          {avatarUri !== null ? (
            <TouchableOpacity onPress={openProfileScreen} style={styles.avatarTap}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={[styles.avatar, { borderColor: colors.primarySoft }]} />
              ) : (
                <View style={[styles.avatarFallback, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
                  <MaterialIcons name="person" size={18} color={colors.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {children ? <View style={styles.filters}>{children}</View> : null}
    </View>
  );
}
