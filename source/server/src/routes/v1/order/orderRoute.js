import express from "express";
import { orderController } from "~/controllers/orderController.js";
import { isAuthorized, optionalAuth } from "~/middlewares/authMiddleware.js";
import { orderValidation } from "~/validations/orderValidation.js";

const Router = express.Router();

// Tạo đơn hàng mới
Router.route("/").post(
  optionalAuth,
  orderValidation.createOrder,
  orderController.createOrder
);

// Lấy danh sách đơn hàng của tôi
Router.route("/").get(isAuthorized, orderController.getMyOrders);

// Lấy chi tiết đơn hàng
Router.route("/:id").get(isAuthorized, orderController.getOrderById);

export const orderRoute = Router;
