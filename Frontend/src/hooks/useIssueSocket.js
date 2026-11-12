
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

const SOCKET_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/api\/?$/, "");

export function useIssueSocket(token) {
      console.log("useIssueSocket is running");
  console.log("Token exists:", Boolean(token));

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    const refreshIssues = () => {
      queryClient.invalidateQueries({
        queryKey: ["issues"],
      });
    };

    socket.on("issue:created", refreshIssues);
    socket.on("issue:updated", refreshIssues);

    socket.on("connect", () => {
      console.log("PulseBoard Socket.IO connected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO error:", error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, queryClient]);
}
