import { apiRequest } from "./client";

export const getNotifications = async (token, params = {}) => {
  return apiRequest({
    endpoint: "/notifications",
    token,
    params,
  });
};

export const getUnreadCount = async (token) => {
  return apiRequest({
    endpoint: "/notifications/unread-count",
    token,
  });
};

export const markAllRead = async (token) => {
  return apiRequest({
    endpoint: "/notifications/mark-all-read",
    token,
    method: "PUT",
  });
};
