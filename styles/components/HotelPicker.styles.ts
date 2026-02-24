import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  textWrap: { flex: 1, marginRight: 8 },
  label: { fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "700" },
  value: { marginTop: 2, fontSize: 12, fontWeight: "700" },
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "center", paddingHorizontal: SPACING.md },
  sheet: { borderRadius: RADIUS.xl, maxHeight: "65%", padding: SPACING.md },
  title: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  option: {
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: { fontSize: 14, fontWeight: "600", flex: 1, marginRight: 8 },
});
