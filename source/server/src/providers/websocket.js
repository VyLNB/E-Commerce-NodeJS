import { Server } from "socket.io";
import { Redis } from "ioredis";
import { myLogger } from "../loggers/mylogger.log.js";
import { corsOptions } from "~/config/cors";
import { env } from "~/config/environment.js";

// Lưu trữ instance Socket.IO
let ioInstance = null;
let inventoryNS = null;
let reviewNS = null;

// Redis Subscriber for Order Notifications
const redisSubscriber = new Redis({
  host: env.DEFAULT_REDIS_HOST,
  port: env.DEFAULT_REDIS_PORT,
  password: env.DEFAULT_REDIS_PASSWORD,
});

redisSubscriber.subscribe("order_notifications", (err, count) => {
  if (err) {
    myLogger.error(
      "Failed to subscribe to order_notifications: %s",
      err.message
    );
  } else {
    myLogger.info(`Subscribed to order_notifications. Count: ${count}`);
  }
});

redisSubscriber.on("message", (channel, message) => {
  if (channel === "order_notifications") {
    try {
      const data = JSON.parse(message);
      const { userId } = data;

      if (ioInstance && userId) {
        // Check if anyone is in the room
        const roomSize =
          ioInstance.sockets.adapter.rooms.get(userId)?.size || 0;
        myLogger.info(
          `Preparing to emit to room '${userId}'. Active sockets in room: ${roomSize}`
        );

        // Emit to the user's room
        ioInstance.to(userId).emit("order_notification", data);
        myLogger.info(`Emitted order_notification to user ${userId}`);
      }
    } catch (error) {
      myLogger.error("Error processing Redis message:", error);
    }
  }
});

// Khởi tạo và trả về instance Socket.IO gắn với HTTP server hiện có
export function initWebsocket(httpServer, opts = {}) {
  const io = new Server(httpServer, {
    cors: corsOptions,
    ...opts,
  });

  ioInstance = io;
  inventoryNS = io.of("/inventory-socket");
  reviewNS = io.of("/review-socket");

  // Global connection handler
  io.on("connection", (socket) => {
    myLogger.info(`New socket client connected: ${socket.id}`);
    myLogger.info(`Handshake query: ${JSON.stringify(socket.handshake.query)}`);

    // User joins their own room based on userId passed in query
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId);
      myLogger.info(`Socket ${socket.id} joined user room: '${userId}'`);
    } else {
      myLogger.warn(`Socket ${socket.id} connected without userId in query`);
    }

    socket.on("disconnect", (reason) => {
      myLogger.info(`Socket disconnected ${socket.id}: ${reason}`);
    });
  });

  // Namespace-specific handlers
  inventoryNS.on("connection", (socket) => {
    myLogger.info(
      `New client connected to /inventory-socket namespace: ${socket.id}`
    );

    // Cho client đăng ký nhận cập nhật giỏ hàng cho các sản phẩm cụ thể
    socket.on("subscribeToProducts", (payload) => {
      myLogger.info(
        `Received subscribeToProducts with payload: ${JSON.stringify(payload)}`
      );
      const productIds = Array.isArray(payload) ? payload : payload.productIds;

      if (Array.isArray(productIds)) {
        socket.join(productIds);
        myLogger.info(
          `Socket ${socket.id} subscribed to product rooms: ${productIds.join(
            ", "
          )}`
        );
      }
    });
  });

  reviewNS.on("connection", (socket) => {
    myLogger.info(
      `New client connected to /review-socket namespace: ${socket.id}`
    );

    socket.on("subscribeToProductReviews", (payload) => {
      // Handle both string and object payload { productId: "..." }
      const productId =
        typeof payload === "object" ? payload.productId : payload;

      if (!productId) return;
      const room = String(productId);
      socket.join(room);
      myLogger.info(
        `Socket ${socket.id} subscribed to reviews for product: ${room}`
      );
    });

    socket.on("unsubscribeFromProductReviews", (payload) => {
      const productId =
        typeof payload === "object" ? payload.productId : payload;

      if (!productId) return;
      const room = String(productId);
      socket.leave(room);
      myLogger.info(
        `Socket ${socket.id} unsubscribed from reviews for product: ${room}`
      );
    });
  });

  return io;
}

// Lấy instance Socket.IO đã khởi tạo
export function getIO() {
  if (!ioInstance) {
    throw new Error(
      "Socket.IO has not been initialized. Call initWebsocket(server) first."
    );
  }
  return ioInstance;
}

export function getInventoryNamespace() {
  if (!inventoryNS) {
    throw new Error("/inventory-socket namespace is not initialized");
  }
  return inventoryNS;
}

export function getReviewNamespace() {
  if (!reviewNS) throw new Error("/review-socket namespace is not initialized");
  return reviewNS;
}

// Kiểm tra xem Socket.IO đã được khởi tạo chưa
export function hasIO() {
  return !!ioInstance;
}

// Hàm phát sóng thông báo khi có thay đổi review cho các client đã đăng ký trong namespace /review-socket
export function broadcastReviewUpdate(productId, data) {
  if (!reviewNS) {
    myLogger.error("WebSocket /review-socket namespace is not initialized");
    return false;
  }

  try {
    reviewNS.to(String(productId)).emit("reviewUpdate", data);
    return true;
  } catch (err) {
    myLogger.error("Failed to broadcast reviewUpdate:", err);
    return false;
  }
}

// Hàm phát sóng thông báo khi có thay đổi về sản phẩm (giá, tồn kho...) cho các client đã đăng ký trong namespace /cart
export function broadcastProductChange(productId, data) {
  if (!inventoryNS) {
    myLogger.error("WebSocket /inventory-socket namespace is not initialized");
    return false;
  }

  try {
    myLogger.info(
      `Broadcasting productUpdate to room ${productId}: ${JSON.stringify(data)}`
    );
    inventoryNS.to(String(productId)).emit("productUpdate", data);
    return true;
  } catch (err) {
    myLogger.error("Failed to broadcast productUpdate:", err);
    return false;
  }
}
