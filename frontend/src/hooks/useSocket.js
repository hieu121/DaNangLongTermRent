import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

export function useSocket() {
  const token = useAuthStore((s) => s.token);
  const [connected, setConnected] = useState(false);

  const socket = useMemo(() => {
    if (!token) {
      return null;
    }
    return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true
    });
  }, [token]);

  useEffect(() => {
    if (!socket) {
      setConnected(false);
      return undefined;
    }

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return { socket, connected };
}
