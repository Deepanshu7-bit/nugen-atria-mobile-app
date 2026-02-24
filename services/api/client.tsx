import { API_BASE_URL } from "../../constants/env";

type QueryParams = Record<string, unknown>;
type RequestHeaders = Record<string, string>;

type RequestOptions = {
  endpoint: string;
  method?: string;
  token?: string | null;
  body?: unknown;
  params?: QueryParams;
  headers?: RequestHeaders;
};

type ApiRequestError = Error & { status?: number; payload?: unknown };

const normalizeBase = () => String(API_BASE_URL || "").replace(/\/$/, "");

export const buildUrl = (endpoint = "", params?: QueryParams) => {
  const path = endpoint.startsWith("http")
    ? endpoint
    : `${normalizeBase()}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  if (!params || Object.keys(params).length === 0) return path;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    search.append(k, String(v));
  });
  return `${path}?${search.toString()}`;
};

const safeJsonParse = (value = "") => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export async function apiRequest({
  endpoint,
  method = "GET",
  token,
  body,
  params,
  headers,
}: RequestOptions) {
  const response = await fetch(buildUrl(endpoint, params), {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;
  if (response.ok) return payload;
  const message = payload?.message || payload?.error?.message || "Request failed.";
  const error = new Error(String(message)) as ApiRequestError;
  error.status = response.status;
  error.payload = payload;
  throw error;
}
