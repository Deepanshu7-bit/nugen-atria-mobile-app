import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { destroySocket, getSocket, initSocket, refreshSocketToken } from "../services/socket/socketClient";

type SocketValue = { socket: any; isConnected: boolean; reconnect: () => Promise<void> };
const SocketContext = createContext<SocketValue>({ socket: null, isConnected: false, reconnect: async () => {} });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthed, token } = useAuth();
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthed || !token) {
      destroySocket();
      setSocket(null);
      setIsConnected(false);
      return;
    }
    let active = true;
    initSocket(token).then((instance) => {
      if (!active) return;
      setSocket(instance);
      setIsConnected(Boolean(instance?.connected));
      instance?.on("connect", () => setIsConnected(true));
      instance?.on("disconnect", () => setIsConnected(false));
    }).catch(() => null);
    return () => { active = false; };
  }, [isAuthed, token]);

  useEffect(() => { if (isAuthed && token) void refreshSocketToken(token); }, [isAuthed, token]);

  const value = useMemo(() => ({
    socket,
    isConnected,
    reconnect: async () => {
      if (!token) return;
      const instance = await initSocket(token);
      setSocket(instance);
      setIsConnected(Boolean(instance?.connected));
    },
  }), [socket, isConnected, token]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
