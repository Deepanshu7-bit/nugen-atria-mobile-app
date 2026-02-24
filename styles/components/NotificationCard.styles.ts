import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  card: { padding: SPACING.md },
  row: { flexDirection: "row", gap: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  content: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  title: { flex: 1, fontSize: 17, fontWeight: "700", letterSpacing: -0.2 },
  badge: { borderWidth: 1, borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 9, fontWeight: "700" },
  message: { marginTop: 4, fontSize: 14, lineHeight: 20 },
  time: { fontSize: 11, fontWeight: "600" },
});
