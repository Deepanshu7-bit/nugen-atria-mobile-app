import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: 120, gap: SPACING.md },
  header: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  leftGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  backBtn: { width: 34, height: 34, borderRadius: RADIUS.pill, alignItems: "center", justifyContent: "center" },
  topRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  section: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  row: { flexDirection: "row", gap: SPACING.sm },
  chip: { borderWidth: 1, borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 11, fontWeight: "700" },
  markAll: { fontSize: 12, fontWeight: "700" },
  groupLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 8 },
  list: { gap: SPACING.sm },
});
