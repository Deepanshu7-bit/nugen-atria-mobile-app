import { apiRequest } from "./client";

export const getQuickServices = async (token, hotelId, params = {}) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: `/hotels/${hotelId}/quick-services`,
    token,
    params,
  });
};

export const createQuickService = async (token, hotelId, body = {}) => {
  if (!hotelId) return null;
  try {
    return await apiRequest({
      endpoint: `/hotels/${hotelId}/quick-services`,
      token,
      method: "POST",
      body,
    });
  } catch (error: any) {
    if (error?.status === 404) {
      return apiRequest({
        endpoint: `/quick-services/hotel/${hotelId}`,
        token,
        method: "POST",
        body,
      });
    }
    throw error;
  }
};

export const updateQuickServicesBulkStatus = async (
  token,
  hotelId,
  body = {},
) => {
  if (!hotelId) return null;
  try {
    return await apiRequest({
      endpoint: `/hotels/${hotelId}/quick-services/bulk-status`,
      token,
      method: "PATCH",
      body,
    });
  } catch (error: any) {
    if (error?.status === 404) {
      return apiRequest({
        endpoint: `/quick-services/hotel/${hotelId}/bulk-status`,
        token,
        method: "PATCH",
        body,
      });
    }
    throw error;
  }
};
