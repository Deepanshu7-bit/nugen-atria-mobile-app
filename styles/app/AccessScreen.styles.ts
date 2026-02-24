import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: 120 },
  section: { marginTop: SPACING.md, paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  row: { flexDirection: "row", gap: SPACING.sm },
  search: { flex: 1, borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 12, height: 44, fontSize: 14 },
  addButton: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  card: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 12, gap: 4 },
  title: { fontSize: 16, fontWeight: "700" },
  meta: { fontSize: 12 },
  empty: { fontSize: 12 },
});
