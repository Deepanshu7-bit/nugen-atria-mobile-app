import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1, width: "100%", alignSelf: "center" },
  grain: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
  },
  grainDot: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
  },
});
