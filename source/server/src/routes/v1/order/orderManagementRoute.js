import express from "express";
import { orderController } from "~/controllers/orderController.js";
import { isAuthorized, isAdmin } from "~/middlewares/authMiddleware.js";
import { orderValidation } from "~/validations/orderValidation.js";

const Router = express.Router();

// Lấy tất cả đơn hàng (Admin)
Router.route("/").get(isAuthorized, isAdmin, orderController.getAllOrders);

// Cập nhật trạng thái đơn hàng (Admin)
Router.route("/:id/status").put(
  isAuthorized,
  isAdmin,
  orderValidation.updateStatus,
  orderController.updateOrderStatus
);

export const orderManagementRoute = Router;
