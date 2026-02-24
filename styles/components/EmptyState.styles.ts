import { StyleSheet } from "react-native";
import { RADIUS } from "../../constants/theme";

export const styles = StyleSheet.create({
  card: { alignItems: "center", paddingVertical: 24 },
  iconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700" },
  description: { marginTop: 8, textAlign: "center", fontSize: 12 },
  button: { marginTop: 16, borderRadius: RADIUS.lg, paddingHorizontal: 18, paddingVertical: 10 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
