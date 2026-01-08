import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import { PRODUCT_STATUS } from "../utils/constants.js";
import { myLogger } from "~/loggers/mylogger.log";

const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
const OBJECT_ID_RULE_MESSAGE =
  "Your string fails to match the Object Id pattern!";
const variantSchema = Joi.object({
  sku: Joi.string().required().trim().strict(),
  variantName: Joi.string().required().trim().strict(),
  priceAdjustment: Joi.number().required().default(0),
  stock: Joi.number().required().min(0).default(0),
  images: Joi.array().items(Joi.string().trim().strict()).optional(),
  attributes: Joi.object()
    .pattern(Joi.string().min(1), Joi.string().min(1)) // Key và Value đều là chuỗi không rỗng
    .optional(),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  status: Joi.string()
    .valid(...PRODUCT_STATUS)
    .default(PRODUCT_STATUS[0]),
});

const createNew = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().trim().strict(),
    description: Joi.string().required().trim().strict(),
    images: Joi.array().items(Joi.string().required()).min(1).required(),
    price: Joi.number().required().min(0),
    categoryId: Joi.string().required(),
    variantOptions: Joi.array()
      .items(Joi.string().trim().strict().min(1))
      .unique()
      .optional()
      .default([]),
    variants: Joi.array().items(variantSchema).optional().min(0).default([]),
    specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    brandId: Joi.string().required(),
    status: Joi.string()
      .valid(...PRODUCT_STATUS)
      .default(PRODUCT_STATUS[0]),
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
    images: Joi.array().items(Joi.string()).min(0),
    price: Joi.number().min(0),
    variantOptions: Joi.array()
      .items(Joi.string().trim().strict().min(1))
      .unique()
      .optional(),
    variants: Joi.array().items(variantSchema).optional().min(0),
    categoryId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    brandId: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    status: Joi.string().valid(...PRODUCT_STATUS),
  });

  try {
    await schema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

// Validation cho việc thêm/cập nhật 1 biến thể
const validateVariantData = async (req, res, next) => {
  try {
    const schema =
      req.method === "POST"
        ? variantSchema.required()
        : variantSchema.optional();

    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

// Validation cho variantId
const validateVariantId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    variantId: Joi.string()
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
    // Nếu ID không hợp lệ, trả về lỗi 404 Not Found
    next(new ApiError(StatusCodes.NOT_FOUND, "Product not found"));
    myLogger.error(error.message);
  }
};

// Rating validations
const validateRatingCreate = async (req, res, next) => {
  const schema = Joi.object({
    star: Joi.number().integer().min(1).max(5).required().messages({
      "number.base": "Star rating must be a number",
      "number.integer": "Star rating must be an integer",
      "any.required": "Star rating is required",
      "number.min": "Star rating must be at least 1",
      "number.max": "Star rating must not exceed 5",
    }),
    images: Joi.array().items(Joi.string()).optional(),
    comment: Joi.string().max(2000).trim().strict().optional().messages({
      "string.base": "Comment must be a string",
      "string.max": "Comment must not exceed 2000 characters",
      "string.trim": "Comment must not contain leading or trailing spaces",
      "string.strict": "Comment must not contain leading or trailing spaces",
    }),
    postedBy: Joi.string().pattern(OBJECT_ID_RULE).optional().messages({
      "string.pattern.base": "Invalid user ID format",
    }),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

const validateCommentCreate = async (req, res, next) => {
  const schema = Joi.object({
    comment: Joi.string().max(2000).trim().strict().required().messages({
      "string.base": "Comment must be a string",
      "string.empty": "Comment cannot be empty",
      "string.max": "Comment must not exceed 2000 characters",
      "any.required": "Comment is required",
      "string.trim": "Comment must not contain leading or trailing spaces",
      "string.strict": "Comment must not contain leading or trailing spaces",
    }),
    postedBy: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .message("Invalid user ID format")
      .optional(),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

const validateRatingUpdate = async (req, res, next) => {
  const schema = Joi.object({
    star: Joi.number().integer().min(1).max(5).optional().messages({
      "number.base": "Star rating must be a number",
      "number.integer": "Star rating must be an integer",
      "number.min": "Star rating must be at least 1",
      "number.max": "Star rating must not exceed 5",
    }),
    comment: Joi.string().max(2000).optional().messages({
      "string.base": "Comment must be a string",
      "string.max": "Comment must not exceed 2000 characters",
    }),
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

const validateRatingId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    ratingId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
  });

  try {
    await schema.validateAsync(req.params);
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.NOT_FOUND, "Rating not found"));
    myLogger.error(error.message);
  }
};

export const productValidation = {
  createNew,
  update,
  validateId,
  validateRatingCreate,
  validateCommentCreate,
  validateRatingUpdate,
  validateRatingId,
  validateVariantData,
  validateVariantId,
};
