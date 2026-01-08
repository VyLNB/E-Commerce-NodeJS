import mongoose from "mongoose";
import { orderSchema } from "./schemas.js";

const Order = mongoose.model("Order", orderSchema);

// Tạo đơn hàng mới
const createOrder = async (orderData) => {
  const order = new Order(orderData);
  return await order.save();
};

// Lấy đơn hàng theo ID
const getOrderById = async (orderId) =>
  await Order.findById(orderId)
    .populate("items.productId", "name images") // Populate thông tin sản phẩm
    .exec();

// Lấy danh sách đơn hàng của user
const getOrdersByUserId = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("items.productId", "name images")
    .exec();
  const total = await Order.countDocuments({ userId });
  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// Lấy tất cả đơn hàng (cho admin)
const getAllOrders = async (page = 1, limit = 10, status) => {
  const skip = (page - 1) * limit;
  const query = status ? { status } : {};
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "fullName email")
    .populate("items.productId", "name images")
    .exec();
  const total = await Order.countDocuments(query);
  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (orderId, status) =>
  await Order.findByIdAndUpdate(orderId, { status }, { new: true }).exec();

// Cập nhật thông tin thanh toán
const updatePaymentStatus = async (orderId, paymentDetails) =>
  await Order.findByIdAndUpdate(
    orderId,
    { paymentDetails },
    { new: true }
  ).exec();

export const orderModel = {
  createOrder,
  getOrderById,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  Order,
};
