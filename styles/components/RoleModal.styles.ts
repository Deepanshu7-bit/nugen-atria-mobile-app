import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
    maxHeight: "92%",
  },
  title: { fontSize: 14, fontWeight: "800" },
  input: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 12, height: 44, fontSize: 12 },
  inputMultiline: { minHeight: 84, paddingTop: 10, textAlignVertical: "top" },
  modulesWrap: { maxHeight: 340 },
  modulesContent: { gap: 8, paddingVertical: 4 },
  moduleCard: { borderWidth: 1, borderRadius: RADIUS.lg, padding: 10, gap: 6 },
  moduleTitle: { fontSize: 12, fontWeight: "700" },
  moduleDesc: { fontSize: 10, fontWeight: "500" },
  switchGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  switchCell: {
    minWidth: 86,
    minHeight: 58,
    borderRadius: RADIUS.md,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "space-between",
  },
  switchLabel: { fontSize: 10, fontWeight: "700" },
  error: { fontSize: 11 },
  row: { flexDirection: "row", gap: SPACING.sm },
  button: { flex: 1, height: 44, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 12, fontWeight: "700" },
});
