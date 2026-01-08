"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useReviewSocket = (productId: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!productId) return;

    // 1. Xác định URL Server (giống logic của useSocket cũ)
    const socketUrl = process.env.NEXT_PUBLIC_SERVER_HOST
      ? `${process.env.NEXT_PUBLIC_SERVER_HOST}:${
          process.env.NEXT_PUBLIC_SERVER_PORT || 5000
        }`
      : "http://localhost:5000";

    // 2. Kết nối vào Namespace dành riêng cho Review
    // Server: io.of("/review-socket")
    socketRef.current = io(`${socketUrl}/review-socket`, {
      transports: ["websocket"],
    });

    // 3. Khi kết nối thành công, join vào room của ProductId
    socketRef.current.on("connect", () => {
      console.log(`Connected to review socket for product ${productId}`);
      socketRef.current?.emit("subscribeToProductReviews", { productId });
    });

    // 4. Cleanup khi unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("unsubscribeFromProductReviews", { productId });
        socketRef.current.disconnect();
      }
    };
  }, [productId]);

  return socketRef.current;
};
