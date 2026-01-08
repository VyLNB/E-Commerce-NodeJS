import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import { myLogger } from "~/loggers/mylogger.log";

const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
const OBJECT_ID_RULE_MESSAGE =
  "Your string fails to match the Object Id pattern!";

const createNew = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().trim().strict(),
    description: Joi.string().trim().strict(),
    imageUrl: Joi.string().trim().strict(),
    parentCategoryId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE)
      .allow(null),
    isActive: Joi.boolean(),
  });
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

const update = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().strict(),
    description: Joi.string().trim().strict(),
    imageUrl: Joi.string().trim().strict(),
    parentCategoryId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE)
      .allow(null),
    isActive: Joi.boolean(),
  });
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

const validateId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
  });
  try {
    await schema.validateAsync(req.params);
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID format"));
    myLogger.error(error.message);
  }
};

export const categoryValidation = { createNew, update, validateId };
