import multer from "multer";
import path from "path";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { v4 as uuidv4 } from "uuid";

export const imageFileFilter = () => (req, file, cb) => {
  // Chỉ chấp nhận các file ảnh
  if (!file.mimetype.startsWith("image/")) {
    return cb(
      new ApiError(
        StatusCodes.UNSUPPORTED_MEDIA_TYPE,
        "Only image files are allowed!"
      ),
      false
    );
  }

  cb(null, true);
};

// Cấu hình storage và tên file nên nằm trong configureUpload
export const configureUpload = (destinationFolder, fileFilter) => {
  const fullDestinationPath = path.join("publics", destinationFolder);

  // Nếu thư mục chưa tồn tại thì tạo
  try {
    if (!fs.existsSync(fullDestinationPath)) {
      fs.mkdirSync(fullDestinationPath, { recursive: true });
    }
  } catch (err) {
    // Không thể tạo thư mục
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to create upload folder: ${err.message}`
    );
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullDestinationPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = uuidv4();
      const extension = path.extname(file.originalname);
      const newFilename = `${uniqueSuffix}${extension}`;
      cb(null, newFilename);
    },
  });

  return multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    fileFilter,
  });
};

export const avatarFileName = (userId, file) => {
  userId = userId || "guest";
  const extension = path.extname(file.originalname);
  const newFilename = `${userId}${extension}`;
  return newFilename;
};
