import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: 120, gap: SPACING.md },
  section: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  moreBtn: { width: 36, height: 36, borderRadius: RADIUS.pill, alignItems: "center", justifyContent: "center" },
  addButton: {
    minHeight: 50,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  addButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  search: { borderWidth: 1, borderRadius: RADIUS.xl, paddingHorizontal: 12, height: 48, fontSize: 14 },
  filterRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, marginTop: 2 },
  filterBtn: { paddingBottom: 10, marginRight: 18, borderBottomWidth: 2, borderBottomColor: "transparent" },
  filterBtnActive: { borderBottomWidth: 2 },
  filterText: { fontSize: 14, fontWeight: "700" },
  list: { gap: SPACING.sm, paddingTop: 4 },
  empty: { fontSize: 12 },
});
