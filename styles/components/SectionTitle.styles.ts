import { StyleSheet } from "react-native";
import { SPACING } from "../../constants/theme";

export const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.sm },
  title: { fontSize: 18, fontWeight: "700", letterSpacing: -0.2 },
  action: { fontSize: 13, fontWeight: "700" },
});
