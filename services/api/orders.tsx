import { apiRequest } from "./client";

export const getOrders = async (token, params = {}) => {
  return apiRequest({
    endpoint: "/orders",
    token,
    params,
  });
};

export const getFoodOrders = async (token, hotelId, params = {}) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: "/orders",
    token,
    params: { hotelId, ...params },
  });
};

export const getServiceOrders = async (token, hotelId, params = {}) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: `/orders/hotel/${hotelId}/services`,
    token,
    params,
  });
};

export const confirmOrder = async (token, orderId) => {
  return apiRequest({
    endpoint: `/orders/${orderId}/confirm`,
    method: "POST",
    token,
  });
};

export const startOrderProcessing = async (token, orderId) => {
  return apiRequest({
    endpoint: `/orders/${orderId}/start-processing`,
    method: "POST",
    token,
  });
};

export const completeOrder = async (token, orderId) => {
  return apiRequest({
    endpoint: `/orders/${orderId}/complete`,
    method: "POST",
    token,
  });
};

export const cancelOrder = async (token, orderId, reason = "") => {
  return apiRequest({
    endpoint: `/orders/${orderId}/cancel`,
    method: "POST",
    token,
    body: reason ? { reason } : {},
  });
};
