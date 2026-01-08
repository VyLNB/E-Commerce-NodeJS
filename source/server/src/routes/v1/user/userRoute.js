import express from "express";
import { userController } from "~/controllers/userController";
import { cartController } from "~/controllers/cartController";
import { isAuthorized } from "~/middlewares/authMiddleware.js";
import {
  configureUpload,
  imageFileFilter,
} from "~/providers/uploadFileProvider.js";
import { userValidation } from "~/validations/userValidation";
import { cartValidation } from "~/validations/cartValidation";
import passport from "passport";

const Router = express.Router();

// API đăng ký tài khoản.
Router.route("/register").post(
  userValidation.createNew,
  userController.register
);

// API đăng nhập.
Router.route("/login").post(userValidation.login, userController.login);
Router.route("/login/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"], // Yêu cầu lấy thông tin profile và email
    session: false,
  })
);
Router.get(
  "/login/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/v1/users/login/google/failed", // Chuyển hướng nếu thất bại
    session: false,
  }),
  userController.googleLogin
);
Router.get("/login/google/failed", userController.googleLoginFailed);

// API đăng xuất.
Router.route("/logout").delete(userController.logout);

// API Refresh Token - Cấp lại Access Token mới.
Router.route("/refresh_token").put(userController.refreshToken);

// API lấy thông tin user hiện tại.
Router.route("/me").get(isAuthorized, userController.getCurrentUserInfo);

// API cập nhật thông tin user hiện tại.
Router.route("/me").put(
  isAuthorized,
  userValidation.update,
  userController.updateCurrentUser
);

// API đổi mật khẩu cho user hiện tại.
Router.route("/change-password").put(
  isAuthorized,
  userValidation.changePassword,
  userController.changePassword
);

// API yêu cầu lấy lại mật khẩu (gửi email chứa link reset password)
Router.route("/password-recovery").post(
  userValidation.passwordRecovery,
  userController.passwordRecovery
);

// API reset mật khẩu (thông qua link gửi trong email)
Router.route("/reset-password").put(
  userValidation.resetPassword,
  userController.resetPassword
);

// API xóa tài khoản user hiện tại.
Router.route("/me").delete(isAuthorized, userController.deleteCurrentUser);

// API upload avatar cho user hiện tại
Router.route("/me/avatar").put(
  isAuthorized,
  configureUpload("avatars", imageFileFilter()).any(),
  userValidation.avatarUpload,
  userController.uploadAvatarForCurrentUser
);

// API Giỏ hàng
Router.route("/me/cart")
  .get(isAuthorized, cartController.getCart)
  .post(isAuthorized, cartValidation.addToCart, cartController.addToCart)
  .put(
    isAuthorized,
    cartValidation.updateCartItem,
    cartController.updateCartItem
  )
  .delete(
    isAuthorized,
    cartValidation.removeCartItem,
    cartController.removeCartItem
  );

export const userRoute = Router;
