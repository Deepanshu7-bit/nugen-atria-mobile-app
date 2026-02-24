import { StyleSheet } from "react-native";
import { RADIUS, softShadow } from "../../constants/theme";

export const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", minHeight: 96, borderRadius: RADIUS.lg, borderWidth: 1, overflow: "hidden", ...softShadow },
  cardPressed: { transform: [{ scale: 0.985 }] },
  thumbWrap: { width: 96, height: 96, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  thumb: { width: "100%", height: "100%" },
  thumbFallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", gap: 4 },
  thumbFallbackText: { fontSize: 11, fontWeight: "600" },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 10 },
  title: { fontSize: 17, fontWeight: "800" },
  subtitle: { marginTop: 3, fontSize: 12 },
  arrowWrap: { width: 32, height: 32, borderRadius: RADIUS.pill, marginRight: 14, alignItems: "center", justifyContent: "center" },
});
