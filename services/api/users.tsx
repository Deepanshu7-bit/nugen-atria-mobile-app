import { apiRequest } from "./client";

export const getUsers = async (token, params = {}) => {
  return apiRequest({
    endpoint: "/users",
    token,
    params,
  });
};

export const getUserById = async (token, userId) => {
  if (!userId) return null;
  return apiRequest({
    endpoint: `/users/${userId}`,
    token,
  });
};

export const createUser = async (token, body = {}) => {
  return apiRequest({
    endpoint: "/users",
    token,
    method: "POST",
    body,
  });
};

export const updateUser = async (token, userId, body = {}, method = "PATCH") => {
  if (!userId) return null;
  return apiRequest({
    endpoint: `/users/${userId}`,
    token,
    method,
    body,
  });
};
