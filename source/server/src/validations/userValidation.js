/* eslint-disable no-useless-escape */

import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import { ROLE, USER_STATUS } from "../utils/constants.js";
import fs from "fs/promises";

const createNew = async (req, res, next) => {
  const schema = Joi.object({
    fullName,
    email,
    role: Joi.string()
      .valid(...ROLE)
      .messages({
        "string.empty": "Role cannot be empty",
        "any.only": `Role must be one of the following values: ${ROLE.join(
          ", "
        )}`,
      }),
    address: firstAddressSchema,
  });

  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

const login = async (req, res, next) => {
  const schema = Joi.object({
    email,
    password,
  });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

const address = async (req, res, next) => {
  const schema = Joi.object({
    recipientName,
    phone,
    city,
    district,
    ward,
    street,
    isDefault,
  });
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
  }
};

const update = async (req, res, next) => {
  const schema = Joi.object({
    fullName,
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

const updateStatus = async (req, res, next) => {
  const schema = Joi.object({
    status,
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

const changePassword = async (req, res, next) => {
  const schema = Joi.object({
    currentPassword: password.label("Current Password"),
    newPassword: password.label("New Password"),
  }).with("currentPassword", "newPassword");
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

const passwordRecovery = async (req, res, next) => {
  const schema = Joi.object({
    email,
    resetUrl: Joi.string(), // NOTE: báo FE bỏ luôn trường này
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

const resetPassword = async (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required().trim().strict().messages({
      "any.required": "Token is required",
      "string.empty": "Token cannot be empty",
      "string.strict": "Token must be a string",
      "string.trim": "Token cannot have leading or trailing spaces",
    }),
    newPassword: password.label("New Password"),
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

// Common reusable validators

const email = Joi.string().trim().strict().email().required().messages({
  "any.required": "Email is required",
  "string.empty": "Email cannot be empty",
  "string.email": "Email must be a valid email address",
  "string.trim": "Email cannot have leading or trailing spaces",
  "string.strict": "Email must be a string",
});

const fullName = Joi.string()
  .min(2)
  .max(50)
  .trim()
  .strict()
  .pattern(
    // eslint-disable-next-line no-misleading-character-class
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂĐÊÔƠàáảãạăắằẳẵặâấầ̉ẫậđêếềểễệôốồổỗộơớờởỡợùúủũụưứừửữự\s]+$/,
    "lettersAndSpacesOnly"
  )
  .required()
  .messages({
    "any.required": "Full name is required",
    "string.empty": "Full name cannot be empty",
    "string.min": "Full name should have a minimum length of {#limit}",
    "string.max": "Full name should have a maximum length of {#limit}",
    "string.trim": "Full name cannot have leading or trailing spaces",
    "string.pattern.lettersAndSpacesOnly":
      "Full name can only contain letters and spaces",
    "string.strict": "Full name must be a string",
  });

const password = Joi.string()
  .min(8)
  .max(128)
  .trim()
  .strict()
  .pattern(/[a-z]/, "lowercase")
  .pattern(/[A-Z]/, "uppercase")
  .pattern(/\d/, "digit")
  .pattern(/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>\/?~\\]/, "specialCharacter")
  .required()
  .messages({
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
    "string.min": "Password should have a minimum length of {#limit}",
    "string.max": "Password should have a maximum length of {#limit}",
    "string.trim": "Password cannot have leading or trailing spaces",
    "string.pattern.lowercase":
      "Password must contain at least one lowercase letter",
    "string.pattern.uppercase":
      "Password must contain at least one uppercase letter",
    "string.pattern.digit": "Password must contain at least one digit",
    "string.pattern.specialCharacter":
      "Password must contain at least one special character",
    "string.strict": "Password must be a string",
  });

const status = Joi.string()
  .required()
  .valid(...USER_STATUS)
  .messages({
    "any.required": "Status is required",
    "string.empty": "Status cannot be empty",
    "any.only": `Status must be one of the following values: ${USER_STATUS.join(
      ", "
    )}`,
  });

const recipientName = Joi.string()
  .min(2)
  .max(50)
  .trim()
  .strict()
  .pattern(
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯàáâãèéêìíòóôõùúăđĩũơƯĂÂĐÊÔƠàáảãạăắằẳẵặâấầẩẫậđêếềểễệôốồổỗộơớờởỡợùúủũụưứừửữự\s]+$/,
    "lettersAndSpacesOnly"
  )
  .required()
  .messages({
    "any.required": "Recipient name is required",
    "string.empty": "Recipient name cannot be empty",
    "string.min": "Recipient name should have a minimum length of {#limit}",
    "string.max": "Recipient name should have a maximum length of {#limit}",
    "string.trim": "Recipient name cannot have leading or trailing spaces",
    "string.pattern.lettersAndSpacesOnly":
      "Recipient name can only contain letters and spaces",
    "string.strict": "Recipient name must be a string",
  });
const phone = Joi.string()
  .trim()
  .strict()
  .required()
  .pattern(/^0\d{9,10}$/, "validVietnamPhone")
  .messages({
    "string.empty": "Phone number cannot be empty",
    "string.trim": "Phone number cannot have leading or trailing spaces",
    "string.pattern.validVietnamPhone":
      "Phone number must be a valid Vietnamese phone number starting with 0 and followed by 9 or 10 digits",
    "string.strict": "Phone number must be a string",
    "any.required": "Phone number is required",
  });
const city = Joi.string().min(2).max(50).trim().strict().required().messages({
  "any.required": "City is required",
  "string.empty": "City cannot be empty",
  "string.min": "City should have a minimum length of {#limit}",
  "string.max": "City should have a maximum length of {#limit}",
  "string.trim": "City cannot have leading or trailing spaces",
  "string.strict": "City must be a string",
});
const district = Joi.string()
  .min(2)
  .max(50)
  .trim()
  .strict()
  .required()
  .optional()
  .allow("")
  .messages({
    "string.empty": "District cannot be empty",
    "string.min": "District should have a minimum length of {#limit}",
    "string.max": "District should have a maximum length of {#limit}",
    "string.trim": "District cannot have leading or trailing spaces",
    "string.strict": "District must be a string",
    "any.required": "District is required",
  });
const ward = Joi.string()
  .min(2)
  .max(50)
  .trim()
  .strict()
  .required()
  .optional()
  .allow("")
  .messages({
    "string.empty": "Ward cannot be empty",
    "string.min": "Ward should have a minimum length of {#limit}",
    "string.max": "Ward should have a maximum length of {#limit}",
    "string.trim": "Ward cannot have leading or trailing spaces",
    "string.strict": "Ward must be a string",
    "any.required": "Ward is required",
  });
const street = Joi.string()
  .min(2)
  .max(100)
  .trim()
  .strict()
  .required()
  .messages({
    "any.required": "Street is required",
    "string.empty": "Street cannot be empty",
    "string.min": "Street should have a minimum length of {#limit}",
    "string.max": "Street should have a maximum length of {#limit}",
    "string.trim": "Street cannot have leading or trailing spaces",
    "string.strict": "Street must be a string",
  });

// address fields
const isDefault = Joi.boolean().optional().messages({
  "boolean.base": "isDefault must be a boolean",
});

const firstAddressSchema = Joi.object({
  city,
  district,
  ward,
  street,
  isDefault,
});

export const avatarUpload = async (req, res, next) => {
  try {
    //  Kiểm tra nếu không có file nào được upload
    if (!req.files || req.files.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No file uploaded.");
    }

    // Chỉ cho phép tải lên một file duy nhất
    if (req.files.length > 1) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Only one file can be uploaded at a time."
      );
    }

    // Lấy file duy nhất từ mảng
    const file = req.files[0];

    // Kiểm tra tên trường (fieldname) phải là 'image'
    const expectedFieldName = "image";
    if (file.fieldname !== expectedFieldName) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid field name. Expected '${expectedFieldName}' but got '${file.fieldname}'.`
      );
    }

    req.file = file;
    next();
  } catch (error) {
    if (req.files && req.files.length > 0) {
      // Dọn dẹp các file đã upload
      await Promise.all(req.files.map((file) => fs.unlink(file.path)));
    }
    next(error);
  }
};

export const userValidation = {
  createNew,
  address,
  update,
  changePassword,
  updateStatus,
  passwordRecovery,
  resetPassword,
  avatarUpload,
  login,
};

/**
 * Usage example:
 * Router.route("/register").post(userValidation.createNew, userController.register);
 */
