import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError.js";
import { DISCOUNT } from "~/utils/constants.js";

function extractFieldsFromShorthandFilter(filterStr = "") {
  // filter format: field:value,field:op:value,...
  const fields = new Set();
  filterStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((part) => {
      const p = part.split(":");
      if (p.length >= 2) fields.add(p[0]);
    });
  return Array.from(fields);
}

const validateDiscountQuery = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sort: Joi.string().optional(),
    filter: Joi.string().optional(),
    code: Joi.string().optional(),
    name: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    minDiscount: Joi.number().optional(),
    maxDiscount: Joi.number().optional(),
    validFromAfter: Joi.date().iso().optional(),
    validFromBefore: Joi.date().iso().optional(),
  });

  const { error, value } = schema.validate(req.query);
  if (error) return next(new ApiError(StatusCodes.BAD_REQUEST, error.message));

  // validate sort fields nếu có
  if (value.sort) {
    // sort có thể là shorthand "field:asc,field2:desc" hoặc single field
    const parts = String(value.sort)
      .split(",")
      .map((s) => s.split(":")[0].trim())
      .filter(Boolean);
    const invalid = parts.find(
      (f) => !DISCOUNT.ALLOWED_SORT_FIELDS.includes(f)
    );
    if (invalid) {
      return next(
        new ApiError(StatusCodes.BAD_REQUEST, `Invalid sort field: ${invalid}`)
      );
    }
  }

  // validate filter shorthand fields
  if (value.filter) {
    const fields = extractFieldsFromShorthandFilter(value.filter);
    const invalid = fields.find(
      (f) => !DISCOUNT.ALLOWED_FILTER_FIELDS.includes(f)
    );
    if (invalid) {
      return next(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          `Invalid filter field: ${invalid}`
        )
      );
    }
  }

  // Gán lại giá trị đã validate cho req.query
  req.query = { ...req.query, ...value };
  return next();
};

const validateCreateDiscount = async (req, res, next) => {
  const schema = Joi.object({
    code,
    description: Joi.string().trim().strict().min(3).optional().messages({
      "string.min": "Description must be at least 3 characters long",
      "string.strict":
        "Description must not contain leading or trailing spaces",
      "string.empty": "Description cannot be empty",
      "string.trim": "Description must not contain leading or trailing spaces",
    }),
    discountValue: Joi.number().positive().required().messages({
      "number.base": "Discount value must be a number",
      "number.positive": "Discount value must be a positive number",
      "any.required": "Discount value is required",
    }),
    usageLimitTotal: Joi.number()
      .integer()
      .min(0)
      .max(DISCOUNT.MAX_USAGE_LIMIT_TOTAL)
      .required()
      .messages({
        "number.base": "Usage limit total must be a number",
        "number.integer": "Usage limit total must be an integer",
        "number.max": `Usage limit total must not exceed ${DISCOUNT.MAX_USAGE_LIMIT_TOTAL}`,
        "any.required": "Usage limit total is required",
      }),
    usageLimitPerCustomer: Joi.number()
      .integer()
      .min(0)
      .max(DISCOUNT.MAX_USAGE_LIMIT_TOTAL)
      .optional()
      .messages({
        "number.base": "Usage limit per customer must be a number",
        "number.integer": "Usage limit per customer must be an integer",
        "number.max": `Usage limit per customer must not exceed ${DISCOUNT.MAX_USAGE_LIMIT_TOTAL}`,
      }),
    validFrom: Joi.date().optional().messages({
      "date.base": "Valid from must be a valid date",
    }),
    name: Joi.string().trim().strict().min(3).optional().messages({
      "string.min": "Name must be at least 3 characters long",
      "string.strict": "Name must not contain leading or trailing spaces",
      "string.empty": "Name cannot be empty",
      "string.trim": "Name must not contain leading or trailing spaces",
    }),
    type: Joi.string()
      .valid(...DISCOUNT.DISCOUNT_TYPE)
      .optional(),
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    if (error.isJoi === true) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
    }
    next(error);
  }
};

const validateDiscountCode = async (req, res, next) => {
  const schema = Joi.object({
    code,
  });

  try {
    await schema.validateAsync(req.params);
    next();
  } catch (error) {
    if (error.isJoi === true) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
    }
    next(error);
  }
};

const code = Joi.string().trim().strict().uppercase().required().messages({
  "any.required": "Code is required",
  "string.empty": "Code cannot be empty",
  "string.strict": "Code must not contain leading or trailing spaces",
  "string.uppercase": "Code must be uppercase",
});

export const discountValidation = {
  validateDiscountQuery,
  validateCreateDiscount,
  validateDiscountCode,
};
