import { Platform, StyleSheet } from "react-native";
import { RADIUS, softShadow } from "../../constants/theme";

export const ADD_BUTTON_SIZE = 56;
const CENTER_GAP = ADD_BUTTON_SIZE + 8;

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    ...softShadow,
  },
  containerWithAdd: { justifyContent: "space-between" },
  sideGroup: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  centerGap: { width: CENTER_GAP },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 1,
    minWidth: 40,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 1,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0,
    textAlign: "center",
    width: "100%",
  },
  labelActive: {
    fontWeight: "800",
  },
  addButton: {
    position: "absolute",
    left: "50%",
    marginLeft: -ADD_BUTTON_SIZE / 2,
    top: -18,
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.32,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
});
