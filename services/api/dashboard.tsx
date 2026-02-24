import { apiRequest } from "./client";

export const getDashboard = async (token, params) => {
  return apiRequest({
    endpoint: "/analytics/dashboard",
    token,
    params,
  });
};
