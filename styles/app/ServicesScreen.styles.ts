import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: 120, gap: SPACING.md },
  section: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  row: { flexDirection: "row", gap: SPACING.sm },
  statusRow: { gap: SPACING.sm, paddingRight: 8 },
  typeChip: { flex: 1, minHeight: 38, borderWidth: 1, borderRadius: RADIUS.pill, alignItems: "center", justifyContent: "center" },
  typeChipText: { fontSize: 10, fontWeight: "700" },
  chip: { borderWidth: 1, borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 11, fontWeight: "700" },
  searchWrap: {
    minHeight: 48,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  search: { flex: 1, fontSize: 12, paddingVertical: 0 },
  pickers: { gap: SPACING.sm, flexDirection: "row" },
  list: { gap: SPACING.sm, paddingBottom: 4 },
});
