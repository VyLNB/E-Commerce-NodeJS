import express from "express";
import { addressController } from "~/controllers/addressController.js";
import { isAuthorized, isOwner } from "~/middlewares/authMiddleware.js";
import { userValidation } from "~/validations/userValidation";

const Router = express.Router();

// API thêm địa chỉ cho user
Router.route("/:userId/addresses").post(
  isAuthorized,
  isOwner,
  userValidation.address,
  addressController.addAddress
);

// API Lấy tất cả địa chỉ cho user
Router.route("/:userId/addresses").get(
  isAuthorized,
  isOwner,
  addressController.getAddresses
);

// API cập nhật thông tin địa chỉ cho user
Router.route("/:userId/addresses/:addressId").put(
  isAuthorized,
  isOwner,
  userValidation.address,
  addressController.updateAddress
);

// API xóa địa chỉ cho user
Router.route("/:userId/addresses/:addressId").delete(
  isAuthorized,
  isOwner,
  addressController.deleteAddress
);

export const addressRoute = Router;
