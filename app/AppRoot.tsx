import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { HotelProvider } from "../contexts/HotelContext";
import { PermissionsProvider } from "../contexts/PermissionsContext";
import { SocketProvider } from "../contexts/SocketContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { useHotelNotifications } from "../hooks/useHotelNotifications";
import { useNotificationPermissionPrompt } from "../hooks/useNotificationPermissionPrompt";
import LoginScreen from "./LoginScreen";
import MainTabs from "./MainTabs";
import { initFirebaseApp } from "../services/firebase/firebaseClient";
import "../services/notifications/notificationHandler";

function HotelNotificationsGate() {
  useHotelNotifications();
  return null;
}

function NotificationPermissionGate() {
  useNotificationPermissionPrompt();
  return null;
}

function AuthedApp() {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <LoginScreen />;
  return (
    <HotelProvider>
      <HotelNotificationsGate />
      <NotificationPermissionGate />
      <MainTabs />
    </HotelProvider>
  );
}

export default function AppRoot() {
  useEffect(() => {
    initFirebaseApp().catch(() => null);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <PermissionsProvider>
            <AuthedApp />
          </PermissionsProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
