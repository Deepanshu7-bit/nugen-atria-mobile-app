import Constants from "expo-constants";
import { registerDevice, unregisterDevice } from "../api/devices";
import { tokenStorage } from "../auth/storage";
import { deleteWebFcmToken, getWebFcmToken } from "../firebase/firebaseClient";
import { getAppVersion, getDeviceName, getOrCreateDeviceId, getPlatformValue } from "./push.device";
import { attachNotificationLogging, deleteNativeFcmToken, getNativeFcmToken } from "./push.messaging";

const getFcmTokenForPlatform = async (platform) => {
  if (platform === "WEB") return getWebFcmToken();
  return getNativeFcmToken();
};

const deleteLocalFcmToken = async (platform) => {
  if (platform === "WEB") {
    return deleteWebFcmToken();
  }
  return deleteNativeFcmToken();
};

export const registerPushDevice = async (accessToken) => {
  if (!accessToken) return;
  await attachNotificationLogging();

  const platform = getPlatformValue();
  console.log("[Push] Register device started", {
    platform,
    appOwnership: Constants?.appOwnership || "unknown",
  });
  const token = await getFcmTokenForPlatform(platform);

  if (!token) {
    console.warn(
      "[Push] Real FCM token is unavailable. Device registration is skipped.",
    );
    return;
  }

  const deviceId = await getOrCreateDeviceId();
  if (!deviceId) return;

  const payload = {
    token,
    platform,
    deviceId,
    deviceName: await getDeviceName(),
    appVersion: getAppVersion(),
  };

  try {
    await registerDevice(accessToken, payload);
    console.log("[Push] Device registered", {
      platform,
      deviceId,
      tokenLength: token.length,
    });
  } catch (error) {
    console.warn("[Push] Device registration request failed", {
      message: error?.message,
      status: error?.status,
      payload: error?.payload,
    });
    throw error;
  }
};

export const unregisterPushDevice = async (accessToken) => {
  const deviceId = await tokenStorage.getDeviceId();
  const platform = getPlatformValue();

  if (!deviceId || !accessToken) {
    await deleteLocalFcmToken(platform).catch(() => false);
    await tokenStorage.clearDeviceId();
    return;
  }

  try {
    await unregisterDevice(accessToken, deviceId);
  } finally {
    await deleteLocalFcmToken(platform).catch(() => false);
    await tokenStorage.clearDeviceId();
  }
};
