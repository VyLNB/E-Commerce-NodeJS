import express from "express";
import { brandController } from "~/controllers/brandController.js";
import { isAuthorized, isAdmin } from "~/middlewares/authMiddleware.js";
import { brandValidation } from "~/validations/brandValidation.js";
import {
  configureUpload,
  imageFileFilter,
} from "~/providers/uploadFileProvider.js";
import { formatImageField } from "~/middlewares/formatImageFieldMiddleware.js";

const Router = express.Router();

// API GET + POST cho admin
Router.route("/")
  .post(
    isAuthorized,
    isAdmin,
    configureUpload("brands", imageFileFilter()).single("image"),
    formatImageField("logoUrl"),
    brandValidation.createNew,
    brandController.create
  )
  .get(isAuthorized, isAdmin, brandController.getAllForAdmin);

// API để admin thao tác với brand theo id
Router.route("/:id")
  .get(
    isAuthorized,
    isAdmin,
    brandValidation.validateId,
    brandController.getById
  )
  .put(
    isAuthorized,
    isAdmin,
    configureUpload("brands", imageFileFilter()).single("image"),
    formatImageField("logoUrl"),
    brandValidation.validateId,
    brandValidation.update,
    brandController.update
  )
  .delete(
    isAuthorized,
    isAdmin,
    brandValidation.validateId,
    brandController.remove
  );

export const brandManagementRoute = Router;
