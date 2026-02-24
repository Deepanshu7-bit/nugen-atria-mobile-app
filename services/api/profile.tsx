import { apiRequest } from "./client";

export const getProfile = async (token) => {
  return apiRequest({
    endpoint: "/users/profile",
    token,
  });
};

export const updateProfile = async (token, body = {}) => {
  return apiRequest({
    endpoint: "/users/profile",
    token,
    method: "PUT",
    body,
  });
};
