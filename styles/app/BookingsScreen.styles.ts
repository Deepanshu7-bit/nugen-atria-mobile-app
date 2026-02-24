import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: 120, gap: SPACING.md },
  section: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  searchWrap: {
    minHeight: 48,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  search: { flex: 1, fontSize: 12, paddingVertical: 0 },
  chips: { gap: SPACING.sm, paddingRight: 8 },
  chip: { borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 11, fontWeight: "700" },
  card: { borderWidth: 1, borderRadius: RADIUS.xl, padding: 12, gap: 8 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 46, height: 46, borderRadius: RADIUS.pill, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 13, fontWeight: "700" },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700" },
  meta: { marginTop: 2, fontSize: 11, fontWeight: "600" },
  statusPill: { borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  bottomRow: { borderTopWidth: 1, paddingTop: 9, flexDirection: "row", justifyContent: "space-between", gap: 10 },
  metaItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5 },
  metaValue: { flex: 1, fontSize: 11, fontWeight: "600" },
  list: { gap: SPACING.sm, paddingBottom: 4 },
});
