import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  title: { fontSize: 18, fontWeight: "800" },
  input: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 12, height: 44, fontSize: 14 },
  inputMultiline: { minHeight: 84, paddingTop: 10, textAlignVertical: "top" },
  error: { fontSize: 12 },
  row: { flexDirection: "row", gap: SPACING.sm },
  button: { flex: 1, height: 44, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 13, fontWeight: "700" },
});
