import { apiRequest } from "./client";

export const registerDevice = async (token, body) => {
  console.log("[Push] API request /notifications/devices", {
    hasAccessToken: Boolean(token),
    platform: body?.platform,
    deviceId: body?.deviceId,
    tokenLength: body?.token?.length || 0,
  });
  return apiRequest({
    endpoint: "/notifications/devices",
    method: "POST",
    token,
    body,
  });
};

export const unregisterDevice = async (token, deviceId) => {
  if (!deviceId) return null;
  console.log("[Push] API request DELETE /notifications/devices/:id", {
    hasAccessToken: Boolean(token),
    deviceId,
  });
  return apiRequest({
    endpoint: `/notifications/devices/${deviceId}`,
    method: "DELETE",
    token,
  });
};
