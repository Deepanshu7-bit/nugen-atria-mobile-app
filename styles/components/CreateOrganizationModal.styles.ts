import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  title: { fontSize: 14, fontWeight: "800" },
  subtitle: { fontSize: 11 },
  input: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 12, height: 44, fontSize: 12 },
  error: { fontSize: 11 },
  row: { flexDirection: "row", gap: SPACING.sm },
  button: { flex: 1, height: 44, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 12, fontWeight: "700" },
});
