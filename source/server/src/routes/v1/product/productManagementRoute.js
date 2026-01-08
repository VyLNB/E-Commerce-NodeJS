import express from "express";
import { productController } from "~/controllers/productController.js";
import { isAuthorized, isAdmin } from "~/middlewares/authMiddleware.js";
import { transformProductData } from "~/middlewares/transformProductDataMiddleware";
import {
  configureUpload,
  imageFileFilter,
} from "~/providers/uploadFileProvider";
import { productValidation } from "~/validations/productValidation";

const Router = express.Router();

// Admin tạo sản phẩm mới
Router.route("/")
  .post(
    isAuthorized,
    isAdmin,
    configureUpload("products", imageFileFilter()).any(),
    transformProductData,
    productValidation.createNew,
    productController.create
  )
  .get(isAuthorized, isAdmin, productController.find);

// Admin cập nhật sản phẩm
Router.route("/:id").put(
  isAuthorized,
  isAdmin,
  productValidation.validateId,
  configureUpload("products", imageFileFilter()).any(),
  transformProductData,
  productValidation.update,
  productController.update
);

// Admin xóa sản phẩm
Router.route("/:id").delete(
  isAuthorized,
  isAdmin,
  productValidation.validateId,
  productController.remove
);

// Admin xem chi tiết sản phẩm
Router.route("/:id").get(
  isAuthorized,
  isAdmin,
  productValidation.validateId,
  productController.findById
);

// Admin thêm một biến thể mới cho sản phẩm :id
Router.route("/:id/variants").post(
  isAuthorized,
  isAdmin,
  productValidation.validateId,
  productValidation.validateVariantData,
  productController.addVariant
);

// Admin cập nhật một biến thể :variantId của sản phẩm :id
Router.route("/:id/variants/:variantId").put(
  isAuthorized,
  isAdmin,
  productValidation.validateVariantId,
  productValidation.validateVariantData, // Dùng lại validation (cho phép cập nhật 1 phần)
  productController.updateVariant
);

// Admin xóa một biến thể :variantId của sản phẩm :id
Router.route("/:id/variants/:variantId").delete(
  isAuthorized,
  isAdmin,
  productValidation.validateVariantId,
  productController.removeVariant
);

export const productManagementRoute = Router;
