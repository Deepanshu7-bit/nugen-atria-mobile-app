import { apiRequest } from "./client";

export const getHotelsForDropdown = async (token, organizationId, params = {}) => {
  const baseParams = organizationId ? { isAll: 1, organizationId } : { page: 1, limit: 20 };

  return apiRequest({
    endpoint: "/hotels",
    token,
    params: { ...baseParams, ...params },
  });
};

export const getHotelsForListing = async (token, organizationId, params = {}) => {
  const baseParams = organizationId
    ? { organizationId }
    : { page: 1, limit: 20 };

  return apiRequest({
    endpoint: "/hotels",
    token,
    params: { ...baseParams, ...params },
  });
};

export const getHotels = getHotelsForListing;

export const getHotelById = async (token, hotelId) => {
  return apiRequest({ endpoint: `/hotels/${hotelId}`, token });
};

export const getHotelAmenities = async (
  token,
  hotelId,
  params = { includeInactive: true },
) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: `/hotels/${hotelId}/all-amenities`,
    token,
    params,
  });
};

export const toggleHotelAmenity = async (
  token,
  hotelId,
  amenityId,
  enable,
) => {
  if (!hotelId || !amenityId) return null;
  const body = {
    amenityId,
    enable: Boolean(enable),
  };

  try {
    return await apiRequest({
      endpoint: `/hotels/${hotelId}/amenities/${amenityId}/toggle`,
      token,
      method: "PATCH",
      body,
    });
  } catch (error) {
    if (error?.status === 404) {
      return apiRequest({
        endpoint: `/hotel/${hotelId}/amenities/${amenityId}/toggle`,
        token,
        method: "PATCH",
        body,
      });
    }
    throw error;
  }
};
