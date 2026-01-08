import express from "express";
import { userController } from "~/controllers/userController";
import { isAuthorized, isAdmin } from "~/middlewares/authMiddleware.js";
import { userValidation } from "~/validations/userValidation";
import {
  configureUpload,
  imageFileFilter,
} from "~/providers/uploadFileProvider.js";

const Router = express.Router();

// API lấy tất cả users
Router.route("/").get(isAuthorized, isAdmin, userController.getAllUsers);

// API lấy thông tin user theo ID
Router.route("/:id").get(isAuthorized, isAdmin, userController.getUserById);

// API cập nhật thông tin user theo ID
Router.route("/:id").put(
  isAuthorized,
  isAdmin,
  userValidation.update,
  userController.updateUserById
);

// API cập nhật trạng thái user theo ID
Router.route("/:id/status").put(
  isAuthorized,
  isAdmin,
  userValidation.updateStatus,
  userController.updateUserStatus
);

// API xóa user theo ID
Router.route("/:id").delete(
  isAuthorized,
  isAdmin,
  userController.deleteUserById
);

// API upload avatar cho user
Router.route("/:id/avatar").put(
  isAuthorized,
  configureUpload("avatars", imageFileFilter()).any(),
  userValidation.avatarUpload,
  userController.uploadUserAvatar
);

export const usersManagementRoute = Router;
