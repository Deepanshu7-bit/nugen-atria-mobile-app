import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../../constants/env";
import { tokenStorage } from "../auth/storage";

let socketInstance: any = null;

export const SOCKET_EVENTS = {
  ORDER_PLACED: "order:placed",
  ORDER_CONFIRMED: "order:confirmed",
  ORDER_PROCESSING: "order:processing",
  ORDER_COMPLETED: "order:completed",
  ORDER_CANCELLED: "order:cancelled",
  ORDER_CREATED: "order_created",
  ORDER_STATUS_UPDATED: "order_status_updated",
  ORDER_CANCELLED_LEGACY: "order_cancelled",
  BOOKING_CONFIRMED: "booking:confirmed",
  BOOKING_CANCELLED: "booking:cancelled",
  BOOKING_CHECKED_IN: "booking:checked-in",
  BOOKING_CHECKED_OUT: "booking:checked-out",
  BOOKING_WALK_IN: "booking:walk-in",
};

export const getSocket = () => socketInstance;

export const initSocket = async (token?: string | null) => {
  const nextToken = token || (await tokenStorage.getAccessToken()) || "";
  if (socketInstance?.connected && socketInstance?.auth?.token === nextToken) return socketInstance;
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
  }
  socketInstance = io(SOCKET_BASE_URL, {
    path: "/socket.io",
    transports: ["websocket"],
    auth: { token: nextToken || undefined },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
  });
  return socketInstance;
};

export const refreshSocketToken = async (token?: string | null) => {
  if (!socketInstance) return;
  const nextToken = token || (await tokenStorage.getAccessToken()) || "";
  socketInstance.auth = { token: nextToken || undefined };
  if (socketInstance.connected) {
    socketInstance.disconnect();
    socketInstance.connect();
  }
};

export const emitSocketEvent = (eventName: string, payload?: unknown) => {
  if (!socketInstance) return;
  socketInstance.emit(eventName, payload);
};

export const destroySocket = () => {
  if (!socketInstance) return;
  socketInstance.removeAllListeners();
  socketInstance.disconnect();
  socketInstance = null;
};
