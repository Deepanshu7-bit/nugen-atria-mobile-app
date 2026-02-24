import { StyleSheet } from "react-native";
import { RADIUS, softShadow } from "../../constants/theme";

export const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.xl,
    padding: 12,
    borderWidth: 1,
    ...softShadow,
  },
});
