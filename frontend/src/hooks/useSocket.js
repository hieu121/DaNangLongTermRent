import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

export function useSocket() {
  const token = useAuthStore((s) => s.token);

  const socket = useMemo(() => {
    if (!token) {
      return null;
    }
    return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token }
    });
  }, [token]);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return socket;
}
