import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { styles } from "../styles/components/TabBar.styles";

type Tab = { key: string; label: string; icon: any };
type Props = {
  tabs: Tab[];
  activeKey: string;
  onTabPress: (key: string) => void;
  badges?: Record<string, boolean>;
  showAddButton?: boolean;
  onAddPress?: () => void;
  addDisabled?: boolean;
};

export function TabBar({
  tabs,
  activeKey,
  onTabPress,
  badges = {},
  showAddButton = false,
  onAddPress,
  addDisabled = false,
}: Props) {
  const { colors } = useTheme();
  const middleIndex = Math.ceil((tabs?.length || 0) / 2);
  const leftTabs = showAddButton ? tabs.slice(0, middleIndex) : tabs;
  const rightTabs = showAddButton ? tabs.slice(middleIndex) : [];

  const renderTab = (tab: Tab) => {
    const isActive = tab.key === activeKey;
    const badge = badges[tab.key];
    return (
      <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)} accessibilityRole="button">
        <View style={styles.iconWrap}>
          <MaterialIcons name={tab.icon} size={22} color={isActive ? colors.primary : colors.textMuted} />
          {badge ? <View style={[styles.badge, { backgroundColor: colors.primary }]} /> : null}
        </View>
        <Text
          numberOfLines={1}
          ellipsizeMode="clip"
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          style={[styles.label, { color: isActive ? colors.primary : colors.textMuted }, isActive && styles.labelActive]}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }, showAddButton && styles.containerWithAdd]}>
      {showAddButton ? (
        <>
          <View style={styles.sideGroup}>{leftTabs.map((tab) => renderTab(tab))}</View>
          <View style={styles.centerGap} />
          <View style={styles.sideGroup}>{rightTabs.map((tab) => renderTab(tab))}</View>
        </>
      ) : (
        tabs.map((tab) => renderTab(tab))
      )}

      {showAddButton ? (
        <TouchableOpacity
          onPress={onAddPress}
          disabled={addDisabled}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.addButton, { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: addDisabled ? 0.45 : 1 }]}
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
