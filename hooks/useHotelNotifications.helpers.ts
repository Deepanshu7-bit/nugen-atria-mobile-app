import * as Notifications from "expo-notifications";
import { SOCKET_EVENTS } from "../services/socket/socketClient";

export const getPayloadData = (payload) =>
  payload?.data || payload?.metadata || payload || {};

export const getPayloadHotelId = (payload) => {
  const data = getPayloadData(payload);
  return data?.hotelId || data?.hotelID || payload?.hotelId || null;
};

export const getOrderId = (payload) => {
  const data = getPayloadData(payload);
  return data?.orderId || data?.orderID || data?.order_id || payload?.orderId || payload?.id || null;
};

export const getBookingId = (payload) => {
  const data = getPayloadData(payload);
  return data?.bookingId || data?.bookingID || data?.booking_id || payload?.bookingId || payload?.id || null;
};

export const getPaymentId = (payload) => {
  const data = getPayloadData(payload);
  return data?.paymentId || data?.paymentID || data?.payment_id || data?.orderId || data?.bookingId || payload?.id || null;
};

export const scheduleLocalNotification = async (title, body, data) => {
  if (!title && !body) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: title || "Notification", body: body || "", data: data || {} },
    trigger: null,
  }).catch(() => null);
};

export const getOrderEventFromStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (!normalized) return "order:updated";
  if (["placed", "pending"].includes(normalized)) return "order:placed";
  if (["confirmed", "accepted", "approved"].includes(normalized)) return "order:confirmed";
  if (["processing", "preparing", "in_progress"].includes(normalized)) return "order:processing";
  if (["completed", "delivered", "ready"].includes(normalized)) return "order:completed";
  if (["cancelled", "canceled"].includes(normalized)) return "order:cancelled";
  return "order:updated";
};

export const createSocketEventHandlers = ({
  handleOrderEvent,
  handleBookingEvent,
  handlePaymentEvent,
  handleGenericNotification,
}) => ({
  [SOCKET_EVENTS.ORDER_PLACED]: (payload) => handleOrderEvent("order:placed", payload),
  [SOCKET_EVENTS.ORDER_CONFIRMED]: (payload) => handleOrderEvent("order:confirmed", payload),
  [SOCKET_EVENTS.ORDER_PROCESSING]: (payload) => handleOrderEvent("order:processing", payload),
  [SOCKET_EVENTS.ORDER_COMPLETED]: (payload) => handleOrderEvent("order:completed", payload),
  [SOCKET_EVENTS.ORDER_CANCELLED]: (payload) => handleOrderEvent("order:cancelled", payload),
  [SOCKET_EVENTS.ORDER_CREATED]: (payload) => handleOrderEvent("order:placed", payload),
  [SOCKET_EVENTS.ORDER_CANCELLED_LEGACY]: (payload) => handleOrderEvent("order:cancelled", payload),
  [SOCKET_EVENTS.ORDER_STATUS_UPDATED]: (payload) => {
    const data = getPayloadData(payload);
    const eventType = getOrderEventFromStatus(data?.status || data?.orderStatus || payload?.status);
    handleOrderEvent(eventType, payload);
  },
  [SOCKET_EVENTS.BOOKING_CONFIRMED]: (payload) => handleBookingEvent("booking:confirmed", payload),
  [SOCKET_EVENTS.BOOKING_CANCELLED]: (payload) => handleBookingEvent("booking:cancelled", payload),
  [SOCKET_EVENTS.BOOKING_CHECKED_IN]: (payload) => handleBookingEvent("booking:checked-in", payload),
  [SOCKET_EVENTS.BOOKING_CHECKED_OUT]: (payload) => handleBookingEvent("booking:checked-out", payload),
  [SOCKET_EVENTS.BOOKING_WALK_IN]: (payload) => handleBookingEvent("booking:walk-in", payload),
  "payment:received": (payload) => handlePaymentEvent("payment:received", payload),
  "payment:failed": (payload) => handlePaymentEvent("payment:failed", payload),
  "payment:refunded": (payload) => handlePaymentEvent("payment:refunded", payload),
  notification: handleGenericNotification,
});
