import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError.js";
import { ORDER } from "~/utils/constants.js";

const createOrder = async (req, res, next) => {
  const schema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          variantId: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object({
      recipientName: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      city: Joi.string().required(),
      district: Joi.string().required(),
      ward: Joi.string().required(),
      street: Joi.string().required(),
    }).required(),
    paymentMethod: Joi.string()
      .valid(...ORDER.PAYMENT_METHODS)
      .required(),
    discountCode: Joi.string().optional().allow(""),
    notes: Joi.string().optional().allow(""),
    pointsToUse: Joi.number().integer().min(0).optional(),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

const updateStatus = async (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid(...ORDER.ORDER_STATUS)
      .required(),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

export const orderValidation = {
  createOrder,
  updateStatus,
};
