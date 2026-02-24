import { StyleSheet } from "react-native";
import { RADIUS } from "../../constants/theme";

export const styles = StyleSheet.create({
  card: { padding: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrap: { position: "relative" },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  fallback: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  statusDot: {
    position: "absolute",
    right: 0,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    borderColor: "#fff",
  },
  initials: { fontSize: 15, fontWeight: "700" },
  info: { flex: 1 },
  name: { flex: 1, fontSize: 17, fontWeight: "700" },
  meta: { marginTop: 2, fontSize: 13, fontWeight: "500" },
  right: { alignItems: "center", gap: 6 },
  roleBadge: { borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 4 },
  roleText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
});
