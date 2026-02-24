import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: 120, gap: SPACING.md },
  title: { fontSize: 24, fontWeight: "800" },
  card: { borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm },
  name: { fontSize: 18, fontWeight: "700" },
  meta: { fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logout: { height: 44, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  logoutText: { fontSize: 13, fontWeight: "700" },
});
