import express from "express";
import { productController } from "~/controllers/productController.js";
import { productValidation } from "~/validations/productValidation";
import { isAuthorized, optionalAuth } from "~/middlewares/authMiddleware.js";
import {
  configureUpload,
  imageFileFilter,
} from "~/providers/uploadFileProvider";

const Router = express.Router();

// Lấy danh sách sản phẩm (tìm kiếm, lọc, phân trang)
Router.route("/").get(productController.find);

// Lấy chi tiết một sản phẩm
Router.route("/:id").get(
  productValidation.validateId, // Đảm bảo ID đúng định dạng trước khi đi vào controller
  productController.findById
);

// Ratings endpoints
Router.route("/:id/ratings")
  .get(productValidation.validateId, productController.getRatings)
  .post(
    isAuthorized,
    // Middleware xử lý upload file (tối đa 3 ảnh)
    configureUpload("reviews", imageFileFilter()).array("images", 3),
    // Middleware custom để map req.files sang req.body.images cho Validation
    (req, res, next) => {
      if (req.files && req.files.length > 0) {
        req.body.images = req.files.map((f) => f.path.replace(/\\/g, "/"));
      }
      next();
    },
    productValidation.validateId,
    productValidation.validateRatingCreate,
    productController.addRating
  );

Router.route("/:id/comments").post(
  optionalAuth,
  productValidation.validateId,
  productValidation.validateCommentCreate,
  productController.addRating
);

Router.route("/:id/ratings/:ratingId")
  .put(
    isAuthorized,
    productValidation.validateRatingId,
    productValidation.validateRatingUpdate,
    productController.updateRating
  )
  .delete(
    isAuthorized,
    productValidation.validateRatingId,
    productController.removeRating
  );

export const productRoute = Router;
