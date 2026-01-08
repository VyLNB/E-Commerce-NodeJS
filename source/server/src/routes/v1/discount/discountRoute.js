import express from "express";
import { discountController } from "~/controllers/discountController.js";
import { discountValidation } from "~/validations/discountValidation.js";

const Router = express.Router();

Router.route("/:code").get(
  discountValidation.validateDiscountCode,
  discountController.validateDiscountForOrder
);

export const discountRoute = Router;
