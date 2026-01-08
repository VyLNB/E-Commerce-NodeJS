import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError.js";
import { orderModel } from "~/models/orderModel.js";
import { orderQueue } from "../queues/orderQueue.js";
import { cartModel } from "~/models/cartModel.js";

const createOrder = async (userId, orderData) => {
  // Add to queue
  const job = await orderQueue.add("createOrder", {
    userId,
    orderData,
  });

  // Clear cart immediately to prevent "ghost items"
  await cartModel.clearCart(userId);

  return {
    message: "Order is being processed",
    jobId: job.id,
    orderNumber: "PENDING", // Client can poll status or wait for socket
  };
};

const getOrderById = async (userId, orderId) => {
  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
  // Check ownership
  if (order.userId.toString() !== userId.toString()) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to view this order"
    );
  }
  return order;
};

const getMyOrders = async (userId, page, limit) =>
  await orderModel.getOrdersByUserId(userId, page, limit);

// Admin services
const getAllOrders = async (page, limit, status) =>
  await orderModel.getAllOrders(page, limit, status);

const updateOrderStatus = async (orderId, status) => {
  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
  return await orderModel.updateOrderStatus(orderId, status);
};

export const orderService = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
