import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginWithEmail, logout as logoutApi } from "../services/api/auth";
import { tokenStorage } from "../services/auth/storage";
import { registerPushDevice, unregisterPushDevice } from "../services/notifications/push";

type AuthValue = {
  token: string | null;
  refreshToken: string | null;
  user: any;
  loading: boolean;
  error: unknown;
  isAuthed: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);
const parseLogin = (payload: any) => payload?.data?.data ?? payload?.data ?? payload ?? {};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => { void (async () => {
    const [t, r, u] = await Promise.all([tokenStorage.getAccessToken(), tokenStorage.getRefreshToken(), tokenStorage.getUser()]);
    if (!t) return;
    setToken(t); setRefreshToken(r || null); setUser(u || null);
    await registerPushDevice(t).catch(() => null);
  })(); }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true); setError(null);
    try {
      const data = parseLogin(await loginWithEmail({ email, password }));
      const access = data?.accessToken || null;
      if (!access) throw new Error("Invalid login response.");
      await tokenStorage.setTokens(access, data?.refreshToken || "");
      await tokenStorage.setUser(data?.user || null);
      setToken(access); setRefreshToken(data?.refreshToken || null); setUser(data?.user || null);
      await registerPushDevice(access).catch(() => null);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally { setLoading(false); }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    const [storedToken, storedRefresh] = await Promise.all([tokenStorage.getAccessToken(), tokenStorage.getRefreshToken()]);
    await unregisterPushDevice(token || storedToken).catch(() => null);
    await logoutApi({ refreshToken: refreshToken || storedRefresh || undefined, accessToken: token || storedToken || undefined }).catch(() => null);
    await tokenStorage.clearAll();
    setToken(null); setRefreshToken(null); setUser(null); setError(null); setLoading(false);
  }, [token, refreshToken]);

  const value = useMemo(() => ({ token, refreshToken, user, loading, error, signIn, signOut, isAuthed: !!token }), [token, refreshToken, user, loading, error, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
