import express from "express";
import { categoryController } from "~/controllers/categoryController.js";
import { isAuthorized, isAdmin } from "~/middlewares/authMiddleware.js";
import { categoryValidation } from "~/validations/categoryValidation.js";
import {
  configureUpload,
  imageFileFilter,
} from "~/providers/uploadFileProvider.js";
import { formatImageField } from "~/middlewares/formatImageFieldMiddleware.js";

const Router = express.Router();

// API GET + POST dành riêng cho admin
Router.route("/")
  .post(
    isAuthorized,
    isAdmin,
    configureUpload("categories", imageFileFilter()).single("image"),
    formatImageField("imageUrl"),
    categoryValidation.createNew,
    categoryController.create
  )
  .get(isAuthorized, isAdmin, categoryController.getAllForAdmin);

// API để admin thao tác với category theo id
Router.route("/:id")
  .get(
    isAuthorized,
    isAdmin,
    categoryValidation.validateId,
    categoryController.getById
  )
  .put(
    isAuthorized,
    isAdmin,
    configureUpload("categories", imageFileFilter()).single("image"),
    formatImageField("imageUrl"),
    categoryValidation.validateId,
    categoryValidation.update,
    categoryController.update
  )
  .delete(
    isAuthorized,
    isAdmin,
    categoryValidation.validateId,
    categoryController.remove
  );

export const categoryManagementRoute = Router;
