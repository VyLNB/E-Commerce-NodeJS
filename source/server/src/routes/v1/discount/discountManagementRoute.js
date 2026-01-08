import express from "express";
import { discountController } from "~/controllers/discountController.js";
import { discountValidation } from "~/validations/discountValidation.js";
import { isAuthorized, isAdmin } from "~/middlewares/authMiddleware.js";

const Router = express.Router();

Router.route("/")
  .get(
    isAuthorized,
    isAdmin,
    discountValidation.validateDiscountQuery,
    discountController.getAllDiscounts
  )
  .post(
    isAuthorized,
    isAdmin,
    discountValidation.validateCreateDiscount,
    discountController.createDiscount
  );

Router.route("/:discountId/disable").get(
  isAuthorized,
  isAdmin,
  discountController.disable
);

// Router.route("/:discountId").put(
//   isAuthorized,
//   isAdmin,
//   discountController.update
// );

export const discountManagementRoute = Router;
