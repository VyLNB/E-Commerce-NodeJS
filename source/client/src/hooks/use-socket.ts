"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/lib/hooks";

export const useSocket = () => {
  const { _id: userId } = useAppSelector((state) => state.user);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to the server
    // Adjust the URL if your API is on a different port/host in dev vs prod
    const socketUrl = process.env.NEXT_PUBLIC_SERVER_HOST
      ? `${process.env.NEXT_PUBLIC_SERVER_HOST}:${
          process.env.NEXT_PUBLIC_SERVER_PORT || 5000
        }`
      : "http://localhost:5000";

    socketRef.current = io(socketUrl, {
      query: { userId }, // Server expects userId here to join the room
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return socketRef.current;
};
