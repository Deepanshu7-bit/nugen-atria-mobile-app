import { apiRequest } from "./client";

export const getUsers = async (token, params = {}) => {
  return apiRequest({
    endpoint: "/users",
    token,
    params,
  });
};
