import { apiRequest } from "./client";

export const getOrganizations = async (token) => {
  return apiRequest({ endpoint: "/organizations", token });
};

export const createOrganization = async (token, body) => {
  return apiRequest({
    endpoint: "/organizations",
    method: "POST",
    token,
    body,
  });
};

export const getOrganizationTypes = async (token) => {
  return apiRequest({
    endpoint: "/organizations/types",
    token,
  });
};

export const getOrganizationByGstin = async (token, gstin) => {
  return apiRequest({
    endpoint: `/organizations/gstin/${gstin}`,
    token,
  });
};
