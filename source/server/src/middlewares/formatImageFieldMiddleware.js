import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { myLogger } from "~/loggers/mylogger.log";

/**
 * Middleware to handle single image upload processing.
 * 1. Parses 'data' JSON string from body if present (consistency with Product pattern).
 * 2. Assigns the uploaded file path to the specified field name in req.body.
 * * @param {string} fieldName - The field name in req.body to store the image path (e.g., 'imageUrl', 'logoUrl')
 */
export const formatImageField = (fieldName) => (req, res, next) => {
  try {
    // 1. Check if data is sent as a JSON string in a 'data' field (like in Products)
    if (req.body.data) {
      try {
        const parsedData = JSON.parse(req.body.data);
        req.body = { ...req.body, ...parsedData };
        delete req.body.data;
      } catch (error) {
        myLogger.error(error.message);
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Invalid JSON format in 'data' field."
        );
      }
    }

    // 2. Handle the uploaded file
    if (req.file) {
      // Standardize path separators to forward slashes
      req.body[fieldName] = req.file.path.replace(/\\/g, "/");
    }

    next();
  } catch (error) {
    next(error);
  }
};
