import { apiRequest } from "./client";

export const getPermissions = async (token) => {
  return apiRequest({
    endpoint: "/auth/me/permissions",
    token,
  });
};
