import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import { tokenStorage } from "../services/auth/storage";

export const useNotificationPermissionPrompt = () => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (Platform.OS === "web") return;

    let cancelled = false;

    const run = async () => {
      const alreadyShown = await tokenStorage.getNotificationPromptShown();
      if (cancelled || alreadyShown) return;

      const permission = await Notifications.getPermissionsAsync();
      const granted =
        permission.granted || permission.status === "granted";

      if (granted) {
        await tokenStorage.setNotificationPromptShown();
        return;
      }

      Alert.alert(
        "Enable notifications?",
        "You might miss important notifications like order updates and booking events.",
        [
          {
            text: "Not now",
            style: "cancel",
            onPress: () => {
              tokenStorage.setNotificationPromptShown().catch(() => null);
            },
          },
          {
            text: "Enable",
            onPress: () => {
              tokenStorage.setNotificationPromptShown().catch(() => null);
              Notifications.requestPermissionsAsync().catch(() => null);
            },
          },
        ],
      );
    };

    run().catch(() => null);

    return () => {
      cancelled = true;
    };
  }, []);
};
