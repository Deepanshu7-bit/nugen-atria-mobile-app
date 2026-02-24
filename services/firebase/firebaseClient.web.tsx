import { FIREBASE_CONFIG } from "../../constants/env";
import { getApps, initializeApp } from "firebase/app";
import { deleteToken, getMessaging, getToken, isSupported } from "firebase/messaging";

const hasRequiredConfig = Boolean(
  FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.authDomain &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.storageBucket &&
    FIREBASE_CONFIG.messagingSenderId &&
    FIREBASE_CONFIG.appId,
);

export const getFirebaseConfig = () => {
  return hasRequiredConfig ? FIREBASE_CONFIG : null;
};

export const getFirebaseApp = () => {
  const config = getFirebaseConfig();
  if (!config) return null;
  if (getApps().length) return getApps()[0];
  return initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId || undefined,
  });
};

export const initFirebaseApp = async () => {
  return getFirebaseApp();
};

const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (!supported) return null;

  const app = getFirebaseApp();
  if (!app) return null;

  return getMessaging(app);
};

export const getWebFcmToken = async () => {
  if (!hasRequiredConfig) return null;
  if (typeof Notification === "undefined") return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  const vapidKey = FIREBASE_CONFIG.vapidKey || undefined;
  const token = await getToken(messaging, vapidKey ? { vapidKey } : undefined);

  return token || null;
};

export const deleteWebFcmToken = async () => {
  const messaging = await getMessagingInstance();
  if (!messaging) return false;

  try {
    await deleteToken(messaging);
    return true;
  } catch {
    return false;
  }
};
