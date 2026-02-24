import { StyleSheet } from "react-native";
import { RADIUS } from "../../constants/theme";

export const styles = StyleSheet.create({
  card: { padding: 14 },
  top: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  title: { fontSize: 34, fontWeight: "900", letterSpacing: -0.8, lineHeight: 36 },
  meta: { marginTop: 2, fontSize: 12, fontWeight: "600" },
  badge: { borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  badgeText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  items: { marginTop: 10, borderRadius: RADIUS.md, padding: 10 },
  itemsText: { fontSize: 12, fontWeight: "600" },
  footer: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 14, fontWeight: "700" },
  elapsedWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  elapsed: { fontSize: 11, fontWeight: "700" },
  actions: { marginTop: 12, flexDirection: "row", gap: 8 },
  primaryButton: { flex: 1, minHeight: 40, borderRadius: RADIUS.pill, alignItems: "center", justifyContent: "center" },
  secondaryButton: { width: 40, minHeight: 40, borderRadius: RADIUS.pill, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 12, fontWeight: "700" },
});
