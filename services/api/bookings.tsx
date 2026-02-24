import { apiRequest } from "./client";

type CheckoutBody = { paymentStatus?: string; discountAmount?: number | string };

export const getBookingsByHotel = async (token: string, hotelId?: string | null, params: Record<string, unknown> = {}) =>
  hotelId ? apiRequest({ endpoint: `/bookings/hotel/${hotelId}`, token, params }) : null;

export const confirmBooking = async (token: string, bookingId: string) =>
  apiRequest({ endpoint: `/bookings/${bookingId}/confirm`, token, method: "POST" });

export const checkInBooking = async (token: string, bookingId: string) =>
  apiRequest({ endpoint: `/bookings/${bookingId}/checkin`, token, method: "POST" });

export const cancelBooking = async (token: string, bookingId: string, reason = "") =>
  apiRequest({ endpoint: `/bookings/${bookingId}/cancel`, token, method: "POST", body: reason ? { reason } : {} });

export const createWalkInBooking = async (token: string, body: Record<string, unknown>) =>
  apiRequest({ endpoint: "/bookings/walk-in", token, method: "POST", body });

export const getCheckoutPreview = async (token: string, bookingId?: string | null) =>
  bookingId ? apiRequest({ endpoint: `/bookings/${bookingId}/checkout-preview`, token }) : null;

export const checkoutBooking = async (token: string, bookingId?: string | null, payload: CheckoutBody = {}) => {
  if (!bookingId) return null;
  const body: CheckoutBody = {};
  if (payload.paymentStatus) body.paymentStatus = payload.paymentStatus;
  if (payload.discountAmount !== undefined && payload.discountAmount !== null) body.discountAmount = Number(payload.discountAmount) || 0;
  return apiRequest({ endpoint: `/bookings/${bookingId}/checkout`, token, method: "POST", body });
};
