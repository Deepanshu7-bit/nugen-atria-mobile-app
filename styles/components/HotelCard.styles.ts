import { StyleSheet } from "react-native";
import { RADIUS } from "../../constants/theme";

export const styles = StyleSheet.create({
  card: { paddingVertical: 10, paddingHorizontal: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  image: { width: 50, height: 50, borderRadius: 12 },
  noImage: { width: 50, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 4 },
  noImageText: { fontSize: 11, fontWeight: "600" },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "700" },
  location: { fontSize: 12, fontWeight: "500" },
});
