import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { tokenStorage } from "../auth/storage";

export const getPlatformValue = () =>
  Platform.OS === "ios" ? "IOS" : Platform.OS === "android" ? "ANDROID" : "WEB";

export const getAppVersion = () =>
  Platform.OS === "web"
    ? Constants.expoConfig?.version || undefined
    : Application.nativeApplicationVersion || undefined;

export const getDeviceName = async () => {
  if (Platform.OS === "web") return typeof navigator !== "undefined" ? navigator.userAgent : undefined;
  return Device.deviceName || Device.modelName || undefined;
};

const getNativeDeviceId = async () => {
  if (Platform.OS === "android") {
    try {
      return (await Application.getAndroidId()) || null;
    } catch {
      return null;
    }
  }
  if (Platform.OS !== "ios") return null;
  try {
    return (await Application.getIosIdForVendorAsync()) || null;
  } catch {
    return null;
  }
};

const createFallbackId = () => `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const getOrCreateDeviceId = async () => {
  const existing = await tokenStorage.getDeviceId();
  if (existing) return existing;
  const nextId = (await getNativeDeviceId()) || createFallbackId();
  await tokenStorage.setDeviceId(nextId);
  return nextId;
};
