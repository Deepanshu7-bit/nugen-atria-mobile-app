import { apiRequest } from "./client";

type LoginPayload = { email: string; password: string };
type LogoutPayload = { refreshToken?: string; accessToken?: string };

export const loginWithEmail = async ({ email, password }: LoginPayload) =>
  apiRequest({ endpoint: "/auth/login", method: "POST", body: { email, password } });

export const refreshAccessToken = async (refreshToken?: string | null) => {
  if (!refreshToken) throw new Error("Refresh token is required.");
  return apiRequest({ endpoint: "/auth/refresh", method: "POST", body: { refreshToken } });
};

export const logout = async ({ refreshToken, accessToken }: LogoutPayload = {}) => {
  const body: LogoutPayload = {};
  if (refreshToken) body.refreshToken = refreshToken;
  if (accessToken) body.accessToken = accessToken;
  return apiRequest({ endpoint: "/auth/logout", method: "POST", body });
};
