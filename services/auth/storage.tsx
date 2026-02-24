import { Platform } from "react-native";

const KEYS = {
  ACCESS_TOKEN: "atria_admin_access_token",
  REFRESH_TOKEN: "atria_admin_refresh_token",
  USER: "atria_admin_user",
  DEVICE_ID: "atria_admin_device_id",
  NOTIFICATION_PROMPT_SHOWN: "atria_admin_notification_prompt_shown",
};

const memoryStore = {};

const isWeb = Platform.OS === "web";

const getItem = async (key) => {
  if (isWeb && typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return memoryStore[key] || null;
};

const setItem = async (key, value) => {
  if (isWeb && typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(key, value);
    return;
  }
  memoryStore[key] = value;
};

const removeItem = async (key) => {
  if (isWeb && typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(key);
    return;
  }
  delete memoryStore[key];
};

const clearAllKeys = async () => {
  await Promise.all(Object.values(KEYS).map((key) => removeItem(key)));
};

export const tokenStorage = {
  getAccessToken: () => getItem(KEYS.ACCESS_TOKEN),
  getRefreshToken: () => getItem(KEYS.REFRESH_TOKEN),
  setTokens: async (accessToken, refreshToken) => {
    await setItem(KEYS.ACCESS_TOKEN, accessToken || "");
    await setItem(KEYS.REFRESH_TOKEN, refreshToken || "");
  },
  clearTokens: async () => {
    await Promise.all([
      removeItem(KEYS.ACCESS_TOKEN),
      removeItem(KEYS.REFRESH_TOKEN),
    ]);
  },

  getUser: async () => {
    const raw = await getItem(KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: async (user) => {
    await setItem(KEYS.USER, JSON.stringify(user || null));
  },
  clearUser: () => removeItem(KEYS.USER),

  getDeviceId: () => getItem(KEYS.DEVICE_ID),
  setDeviceId: (deviceId) => setItem(KEYS.DEVICE_ID, deviceId || ""),
  clearDeviceId: () => removeItem(KEYS.DEVICE_ID),

  getNotificationPromptShown: async () => {
    const value = await getItem(KEYS.NOTIFICATION_PROMPT_SHOWN);
    return value === "1";
  },
  setNotificationPromptShown: () =>
    setItem(KEYS.NOTIFICATION_PROMPT_SHOWN, "1"),

  clearAll: async () => {
    await clearAllKeys();
  },
};
