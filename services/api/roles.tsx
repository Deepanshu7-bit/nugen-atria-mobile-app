import { apiRequest } from "./client";

export const getRolesByHotel = async (token, hotelId) => {
  if (!hotelId) return null;
  return apiRequest({
    endpoint: `/roles/hotel/${hotelId}`,
    token,
  });
};

export const getRoleModules = async (token) => {
  return apiRequest({
    endpoint: "/roles/modules/list",
    token,
  });
};

export const createRole = async (token, body) => {
  return apiRequest({
    endpoint: "/roles",
    method: "POST",
    token,
    body,
  });
};

export const updateRole = async (token, roleId, body) => {
  return apiRequest({
    endpoint: `/roles/${roleId}`,
    method: "PUT",
    token,
    body,
  });
};

export const patchRoleModuleActions = async (token, roleId, body) => {
  return apiRequest({
    endpoint: `/roles/${roleId}/modules/actions`,
    method: "PATCH",
    token,
    body,
  });
};

export const deleteRole = async (token, roleId) => {
  return apiRequest({
    endpoint: `/roles/${roleId}`,
    method: "DELETE",
    token,
    body: {},
  });
};
