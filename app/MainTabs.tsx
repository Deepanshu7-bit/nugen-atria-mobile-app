import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { ScreenBackground } from "../components/ScreenBackground";
import { TabBar } from "../components/TabBar";
import { CreateOrganizationModal } from "../components/CreateOrganizationModal";
import { useAuth } from "../contexts/AuthContext";
import { useHotel } from "../contexts/HotelContext";
import { usePermissions } from "../contexts/PermissionsContext";
import {
  registerGoBackHandler,
  registerOpenNotificationsHandler,
  registerOpenProfileHandler,
  registerOpenTabHandler,
} from "../services/navigation/appNavigation";
import DashboardScreen from "./DashboardScreen";
import HotelsScreen from "./HotelsScreen";
import ServicesScreen from "./ServicesScreen";
import AccessScreen from "./AccessScreen";
import StaffScreen from "./StaffScreen";
import SettingsScreen from "./SettingsScreen";
import NotificationsScreen from "./NotificationsScreen";
import { styles } from "../styles/app/MainTabs.styles";

type TabDef = { key: string; label: string; icon: any; component: React.ComponentType<any> };

const TAB_CONFIG: TabDef[] = [
  { key: "dashboard", label: "Home", icon: "dashboard", component: DashboardScreen },
  { key: "hotels", label: "Hotels", icon: "apartment", component: HotelsScreen },
  { key: "services", label: "Orders", icon: "room-service", component: ServicesScreen },
  { key: "access", label: "Access", icon: "vpn-key", component: AccessScreen },
  { key: "staff", label: "Users", icon: "people", component: StaffScreen },
  { key: "settings", label: "Settings", icon: "settings", component: SettingsScreen },
];

const EXTRA_SCREENS: Record<string, React.ComponentType<any>> = {
  notifications: NotificationsScreen,
};

const filterTabsByPermissions = (
  tabs: TabDef[],
  hasPermissions: boolean,
  can: (resourceOrRequirement: any, action?: string) => boolean,
) => {
  if (!hasPermissions) return tabs;
  return tabs.filter((tab) => {
    if (tab.key === "dashboard") return can("dashboard", "read");
    if (tab.key === "hotels") return can("hotel", "read");
    if (tab.key === "services") {
      return can({ anyOf: [{ resource: "order", action: "read" }, { resource: "orders", action: "read" }] });
    }
    if (tab.key === "access") {
      return can({ anyOf: [{ resource: "settings", action: "read" }, { resource: "system", action: "manage" }] });
    }
    if (tab.key === "staff") {
      return can({ anyOf: [{ resource: "user", action: "read" }, { resource: "staff", action: "read" }, { resource: "system", action: "manage" }] });
    }
    if (tab.key === "settings") return can({ anyOf: [{ resource: "settings", action: "read" }, { resource: "system", action: "manage" }] });
    return true;
  });
};

export default function MainTabs() {
  const { token } = useAuth();
  const { canCreateOrganization, setOrganizationId } = useHotel();
  const { can, hasPermissions } = usePermissions();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [previousTab, setPreviousTab] = useState("dashboard");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const tabs = useMemo(() => filterTabsByPermissions(TAB_CONFIG, hasPermissions, can), [hasPermissions, can]);

  useEffect(() => {
    const unregisterNotifications = registerOpenNotificationsHandler(() => {
      setPreviousTab((prev) => (EXTRA_SCREENS[activeTab] ? prev : activeTab));
      setActiveTab("notifications");
    });
    const unregisterProfile = registerOpenProfileHandler(() => {
      setPreviousTab((prev) => (EXTRA_SCREENS[activeTab] ? prev : activeTab));
      setActiveTab("settings");
    });
    const unregisterOpenTab = registerOpenTabHandler((tabKey) => {
      if (!tabKey) return;
      setPreviousTab((prev) => (EXTRA_SCREENS[activeTab] ? prev : activeTab));
      setActiveTab(String(tabKey));
    });
    const unregisterBack = registerGoBackHandler(() => {
      if (EXTRA_SCREENS[activeTab] || activeTab === "settings") {
        setActiveTab(previousTab || tabs[0]?.key || "dashboard");
      }
    });
    return () => {
      unregisterNotifications?.();
      unregisterProfile?.();
      unregisterOpenTab?.();
      unregisterBack?.();
    };
  }, [activeTab, previousTab, tabs]);

  useEffect(() => {
    if (!tabs.length) return;
    const isExtra = Boolean(EXTRA_SCREENS[activeTab]);
    if (!isExtra && !tabs.some((tab) => tab.key === activeTab)) setActiveTab(tabs[0].key);
  }, [tabs, activeTab]);

  const ActiveScreen = useMemo(() => {
    return tabs.find((tab) => tab.key === activeTab)?.component || EXTRA_SCREENS[activeTab] || tabs[0]?.component || DashboardScreen;
  }, [tabs, activeTab]);

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <ActiveScreen />
        <TabBar
          tabs={tabs}
          activeKey={activeTab}
          onTabPress={(key) => {
            if (!EXTRA_SCREENS[activeTab]) setPreviousTab(activeTab);
            setActiveTab(key);
          }}
          showAddButton={canCreateOrganization}
          onAddPress={() => setIsCreateOpen(true)}
        />
      </View>
      <CreateOrganizationModal
        visible={isCreateOpen}
        token={token}
        onClose={() => setIsCreateOpen(false)}
        onOrganizationCreated={(id) => id && setOrganizationId(String(id))}
      />
    </ScreenBackground>
  );
}
