import { apiRequest } from "./client";

export const getFoodCategoriesForHotel = async (token, hotelId) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: `/food-categories/hotel/${hotelId}`,
    token,
  });
};

export const getFoodItemTypes = async (token) => {
  return apiRequest({
    endpoint: "/food-items/types",
    token,
  });
};

export const getFoodItemsByHotel = async (token, hotelId, params = {}) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: `/food-items/hotel/${hotelId}`,
    token,
    params,
  });
};

export const createFoodItem = async (token, hotelId, body) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: `/food-items/hotel/${hotelId}`,
    token,
    method: "POST",
    body,
  });
};
