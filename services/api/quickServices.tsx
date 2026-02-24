import { apiRequest } from "./client";

export const getQuickServices = async (token, hotelId, params = {}) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: `/hotels/${hotelId}/quick-services`,
    token,
    params,
  });
};
