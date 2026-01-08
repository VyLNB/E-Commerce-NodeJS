import express from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError.js";
import { userRoute } from "./user/userRoute";
import { usersManagementRoute } from "./user/usersManagementRoute.js";
import { addressRoute } from "./address/addressRoute";
import { addressManagementRoute } from "./address/addressManagementRoute";
import { productRoute } from "./product/productRoute";
import { productManagementRoute } from "./product/productManagementRoute";
import { categoryRoute } from "./category/categoryRoute";
import { categoryManagementRoute } from "./category/categoryManagementRoute";
import { brandRoute } from "./brand/brandRoute";
import { brandManagementRoute } from "./brand/brandManagementRoute";
import { discountManagementRoute } from "./discount/discountManagementRoute.js";
import { discountRoute } from "./discount/discountRoute.js";
import { orderRoute } from "./order/orderRoute.js";
import { orderManagementRoute } from "./order/orderManagementRoute.js";
import { broadcastInventoryUpdate } from "../../providers/websocket.js";

const Router = express.Router();

Router.get("/health", function (req, res) {
  res.locals.message = "GearUp APIs V1 is healthy";
  res.status(StatusCodes.ACCEPTED).json({ apiVersion: "v1", status: "OK" });
});

Router.get("/error-simulation", function (req, res, next) {
  next(new ApiError(StatusCodes.ACCEPTED, "This is a simulated error"));
});

// User Routes
Router.use("/users", userRoute);
Router.use("/admin/users", usersManagementRoute);

// Address Routes
Router.use("/users", addressRoute);
Router.use("/admin/users", addressManagementRoute);

// Product Routes
Router.use("/products", productRoute);
Router.use("/admin/products", productManagementRoute);

// Category Routes
Router.use("/categories", categoryRoute);
Router.use("/admin/categories", categoryManagementRoute);

// Brand Routes
Router.use("/brands", brandRoute);
Router.use("/admin/brands", brandManagementRoute);

// Discount Routes
Router.use("/discounts", discountRoute);
Router.use("/admin/discounts", discountManagementRoute);

// Order Routes
Router.use("/orders", orderRoute);
Router.use("/admin/orders", orderManagementRoute);

// HACK: chỉ dùng để test
Router.post("/broadcast-test", (req, res) => {
  try {
    const { productId, newStock } = req.body;
    broadcastInventoryUpdate(productId, newStock);
    res
      .status(StatusCodes.OK)
      .json({ message: "Broadcast inventory update sent" });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to broadcast inventory update", error: err });
  }
});

module.exports = Router;
