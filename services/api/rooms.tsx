import { apiRequest } from "./client";

export const getRoomsForDropdown = async (token, hotelId, params = {}) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: "/rooms",
    token,
    params: {
      isAll: 1,
      hotelId,
      ...params,
    },
  });
};

export const getRoomsForListing = async (token, hotelId, params = {}) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: "/rooms",
    token,
    params: {
      hotelId,
      ...params,
    },
  });
};

export const getRooms = getRoomsForListing;

export const getRoomById = async (token, roomId) => {
  if (!roomId) return null;
  return apiRequest({
    endpoint: `/rooms/${roomId}`,
    token,
  });
};

export const getRoomAmenities = async (token, hotelId, params = {}) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: `/hotels/${hotelId}/room-amenities`,
    token,
    params,
  });
};

export const updateRoom = async (token, roomId, body) => {
  if (!roomId) return null;
  return apiRequest({
    endpoint: `/rooms/${roomId}`,
    token,
    method: "PUT",
    body,
  });
};
