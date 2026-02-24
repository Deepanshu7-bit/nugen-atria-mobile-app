import { StyleSheet } from "react-native";
import { RADIUS } from "../../constants/theme";

export const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 150 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  label: { fontSize: 10, fontWeight: "700" },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  value: { flex: 1, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  trendPill: { borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2 },
  trend: { fontSize: 10, fontWeight: "700" },
});
