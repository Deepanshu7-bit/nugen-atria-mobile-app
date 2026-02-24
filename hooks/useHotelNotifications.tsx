import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useHotel } from "../contexts/HotelContext";
import { useSocket } from "../contexts/SocketContext";
import { shouldShowPopup } from "../services/notifications/popupDedupe";
import { scheduleLocalNotification } from "./useHotelNotifications.helpers";

const EVENTS = [
  "notification",
  "order:placed",
  "order:confirmed",
  "order:processing",
  "order:completed",
  "order:cancelled",
  "booking:confirmed",
  "booking:cancelled",
  "booking:checked-in",
  "booking:checked-out",
];

const getHotelId = (payload: any) =>
  payload?.hotelId || payload?.data?.hotelId || payload?.meta?.hotelId || null;

export const useHotelNotifications = () => {
  const { isAuthed } = useAuth();
  const { hotelId } = useHotel();
  const { socket } = useSocket();

  useEffect(() => {
    if (!isAuthed || !socket) return;
    const selectedHotel = hotelId ? String(hotelId) : null;
    const onEvent = (payload: any) => {
      const payloadHotel = getHotelId(payload);
      if (selectedHotel && payloadHotel && String(payloadHotel) !== selectedHotel) return;
      const dedupeKey = `${payload?.type || payload?.eventType || "generic"}:${payload?._id || payload?.id || payload?.timestamp || Date.now()}`;
      if (!shouldShowPopup(dedupeKey)) return;
      void scheduleLocalNotification(payload?.title || "Notification", payload?.message || payload?.body || "", payload?.data || payload || {});
    };

    if (selectedHotel) socket.emit("join-hotel", { hotelId: selectedHotel });
    EVENTS.forEach((event) => socket.on(event, onEvent));
    return () => {
      EVENTS.forEach((event) => socket.off(event, onEvent));
      if (selectedHotel) socket.emit("leave-hotel", { hotelId: selectedHotel });
    };
  }, [isAuthed, socket, hotelId]);
};
