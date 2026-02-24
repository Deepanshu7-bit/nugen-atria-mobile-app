import Constants from "expo-constants";
import { Platform } from "react-native";

let messagingFactoryPromise: Promise<any> | null = null;
const isExpoGo = Constants?.appOwnership === "expo";

const getMessagingFactory = async () => {
  if (Platform.OS === "web" || isExpoGo) return null;
  if (!messagingFactoryPromise) {
    messagingFactoryPromise = import("@react-native-firebase/messaging")
      .then((mod) => (typeof mod.default === "function" ? mod.default : mod))
      .catch(() => null);
  }
  return messagingFactoryPromise;
};

const getMessaging = async () => {
  const factory = await getMessagingFactory();
  if (!factory || typeof factory !== "function") return null;
  try {
    return { factory, instance: factory() };
  } catch {
    return null;
  }
};

export const attachNotificationLogging = async () => {
  const payload = await getMessaging();
  if (!payload) return;
  payload.instance.onMessage((message: any) => console.log("[Push] Foreground", message));
};

export const getNativeFcmToken = async () => {
  const payload = await getMessaging();
  if (!payload) return null;
  if (Platform.OS !== "android") {
    const status = await payload.instance.requestPermission();
    const ok = status === payload.factory.AuthorizationStatus.AUTHORIZED || status === payload.factory.AuthorizationStatus.PROVISIONAL;
    if (!ok) return null;
  }
  await payload.instance.registerDeviceForRemoteMessages();
  return (await payload.instance.getToken()) || null;
};

export const deleteNativeFcmToken = async () => {
  const payload = await getMessaging();
  if (!payload || typeof payload.instance.deleteToken !== "function") return false;
  try {
    await payload.instance.deleteToken();
    return true;
  } catch {
    return false;
  }
};
