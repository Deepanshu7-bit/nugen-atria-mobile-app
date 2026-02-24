import { StyleSheet } from "react-native";
import { RADIUS, softShadow } from "../../constants/theme";

export const styles = StyleSheet.create({
  button: { borderRadius: RADIUS.pill, borderWidth: 1, alignItems: "center", justifyContent: "center", ...softShadow },
});
