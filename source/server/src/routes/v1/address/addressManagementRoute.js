import express from "express";
import { addressController } from "~/controllers/addressController.js";
import { isAdmin, isAuthorized } from "~/middlewares/authMiddleware.js";
import { userValidation } from "~/validations/userValidation";

const Router = express.Router();

// API thêm địa chỉ cho user bởi admin
Router.route("/:userId/addresses").post(
  isAuthorized,
  isAdmin,
  userValidation.address,
  addressController.addAddress
);

// API Lấy tất cả địa chỉ cho user bởi admin
Router.route("/:userId/addresses").get(
  isAuthorized,
  isAdmin,
  addressController.getAddresses
);

// API cập nhật thông tin địa chỉ cho user bởi admin
Router.route("/:userId/addresses/:addressId").put(
  isAuthorized,
  isAdmin,
  userValidation.address,
  addressController.updateAddress
);

// API xóa địa chỉ cho user bởi admin
Router.route("/:userId/addresses/:addressId").delete(
  isAuthorized,
  isAdmin,
  addressController.deleteAddress
);

export const addressManagementRoute = Router;
