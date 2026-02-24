import { FIREBASE_CONFIG } from "../../constants/env";

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
  return null;
};

export const initFirebaseApp = async () => {
  return getFirebaseConfig();
};

export const getWebFcmToken = async () => {
  return null;
};

export const deleteWebFcmToken = async () => {
  return false;
};
