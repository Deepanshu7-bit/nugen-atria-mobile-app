import { StyleSheet } from "react-native";
import { RADIUS, SPACING, softShadow } from "../../constants/theme";

export const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingBottom: 120, gap: SPACING.md },
  section: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  pickers: { gap: SPACING.sm, flexDirection: "row" },
  primaryMetric: {
    borderRadius: RADIUS.xl,
    padding: 16,
    minHeight: 128,
    justifyContent: "space-between",
    ...softShadow,
  },
  metricHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricLabel: { color: "#cfe0ff", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  metricValue: { color: "#fff", fontSize: 36, fontWeight: "800", letterSpacing: -0.8 },
  metricHint: { color: "#b8d1ff", fontSize: 12, fontWeight: "600" },
  metricRow: { flexDirection: "row", gap: SPACING.sm },
  secondaryMetric: {
    flex: 1,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: 14,
    minHeight: 118,
    justifyContent: "space-between",
    ...softShadow,
  },
  secondaryLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
  secondaryValue: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  secondaryHint: { fontSize: 12, fontWeight: "500" },
  progressTrack: { height: 6, borderRadius: RADIUS.pill, marginTop: 4 },
  progressBar: { height: 6, borderRadius: RADIUS.pill },
  list: { gap: SPACING.sm, paddingBottom: 4 },
  emptyHint: { fontSize: 12, marginTop: 4 },
});
