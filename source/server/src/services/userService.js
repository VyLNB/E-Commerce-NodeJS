import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { jwtProvider } from "~/providers/JwtProvider.js";
import { env } from "~/config/environment";
import { JWT_LIFE, RESET_PASSWORD_TOKEN_LIFE } from "~/utils/constants.js";
import { userModel } from "~/models/userModel.js";
import { myLogger } from "~/loggers/mylogger.log";
import placeholderAvatar from "~/utils/placeholderAvatar";
import bcrypt from "bcryptjs";
import { getVietnamDatetimeString } from "~/utils/datetime";
import crypto from "crypto";
import { defaultRedisClient } from "~/config/redis.js";
import {
  ROLE,
  CONFIRM_EMAIL_BASE_URL,
  RESET_PASSWORD_BASE_URL,
  EMAIL_CONFIRMATION_TOKEN_LIFE,
} from "~/utils/constants.js";

import {
  emailQueue,
  uploadFileToCloudStorageQueue,
} from "~/providers/jobQueue.js";
import fs from "fs";
import path from "path";
import { generatePassword } from "~/utils/random.js";

const login = async (email, password, isGoogleLogin = false) => {
  let user = await userModel.getUserByEmail(email);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  user = user.toObject();

  // So sánh password
  if (!isGoogleLogin) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }
  }

  // Kiểm tra trạng thái user
  if (user.status !== "active") {
    throw new ApiError(StatusCodes.FORBIDDEN, "User is not active");
  }

  delete user.password;
  delete user.addresses;
  user.createdAt = getVietnamDatetimeString(user.createdAt);
  user.updatedAt = getVietnamDatetimeString(user.updatedAt);

  // Tạo thông tin Payload để  trong JWT Token
  const payload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };
  // Tạo Access Token
  const accessToken = await jwtProvider.generateToken(
    payload,
    env.ACCESS_TOKEN_SECRET_SIGNATURE,
    JWT_LIFE.ACCESS_TOKEN_LIFE
  );
  // Tạo Refresh Token
  const refreshToken = await jwtProvider.generateToken(
    payload,
    env.REFRESH_TOKEN_SECRET_SIGNATURE,
    JWT_LIFE.REFRESH_TOKEN_LIFE
  );

  // Trả về thông tin user, accessToken, refreshToken cho Controller
  return { user, accessToken, refreshToken };
};

const findOrCreateUserForGuest = async (guestData) => {
  const { email, fullName, address } = guestData;

  // 1. Kiểm tra user đã tồn tại chưa
  let user = await userModel.getUserByEmail(email);

  if (user) {
    // Nếu user đã tồn tại, trả về ID của user đó để link đơn hàng
    // (Optional: Có thể gửi email báo "Bạn vừa đặt hàng với tài khoản này...")
    return user._id;
  }

  // 2. Nếu chưa tồn tại, tạo user mới
  const randomPassword = generatePassword(); // Tạo mật khẩu ngẫu nhiên
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(randomPassword, salt);

  const newUserData = {
    email,
    fullName,
    password: hashedPassword,
    role: "customer",
    status: "active", // Active luôn để họ có thể đăng nhập ngay
    avatar: placeholderAvatar(fullName),
    addresses: address ? [{ ...address, isDefault: true }] : [],
  };

  const newUser = await userModel.createUser(newUserData);

  // 3. Gửi email thông báo tài khoản mới (Quan trọng)
  await emailQueue.add("send_account_creation_email", {
    to: email,
    userName: fullName,
    password: randomPassword, // Gửi mật khẩu tạm để họ đăng nhập
    loginLink: `${env.FE_CLIENT_HOST}:${env.FE_CLIENT_PUBLIC_PORT}/auth/signin`,
  });

  return newUser._id;
};

const refreshToken = async (refreshToken) => {
  try {
    // Xác thực token
    const decoded = await jwtProvider.verifyToken(
      refreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    );

    // Tạo payload mới cho Access Token
    delete decoded.iat;
    delete decoded.exp;
    const user = decoded;

    // Tạo Access Token
    const accessToken = await jwtProvider.generateToken(
      user,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      JWT_LIFE.ACCESS_TOKEN_LIFE
    );

    return { accessToken };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // Nếu lỗi là do token hết hạn
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Refresh token expired! Please login again."
      );
    } else if (
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      // Nếu xảy ra các lỗi khác liên quan đến Token
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid refresh token! Please login again."
      );
    } else {
      // Các lỗi khác
      throw error;
    }
  }
};

const getUserById = async (userId) => {
  let user = await userModel.getUserById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  user = user.toObject();
  delete user.password;
  delete user.addresses;
  user.createdAt = getVietnamDatetimeString(user.createdAt);
  user.updatedAt = getVietnamDatetimeString(user.updatedAt);
  return user;
};

const updateUser = async (userId, updateData) => {
  let user = await userModel.updateUser(userId, updateData);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  user = user.toObject();
  delete user.password;
  delete user.addresses;
  user.createdAt = getVietnamDatetimeString(user.createdAt);
  user.updatedAt = getVietnamDatetimeString(user.updatedAt);
  return user;
};

const updateStatus = async (userId, status) => {
  // Không cho thay đổi status của admin
  const role = await userModel.getUserRoleById(userId);
  if (!role) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  if (role === ROLE[1]) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Cannot change status of admin user"
    );
  }
  return await updateUser(userId, status);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  let user = await userModel.getUserById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  user = user.toObject();
  // So sánh password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid current password");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user = await userModel.updateUser(userId, { password: hashedPassword });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  user = user.toObject();

  await emailQueue.add("send_password_change_notification_email", {
    to: user.email,
  });

  return user._id;
};

const passwordRecovery = async (email) => {
  const isUserExists = await userModel.isUserExists(email);
  if (!isUserExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  const token = crypto.randomBytes(32).toString("hex");
  await defaultRedisClient.setex(
    `reset:${token}`,
    RESET_PASSWORD_TOKEN_LIFE,
    email
  );
  const resetURL = `${env.FE_CLIENT_HOST}:${env.FE_CLIENT_PUBLIC_PORT}${RESET_PASSWORD_BASE_URL}?token=${token}`;
  myLogger.debug(`Password reset link for ${email}: ${resetURL}`);

  await emailQueue.add("send_reset_password_email", {
    to: email,
    resetLink: resetURL,
    reset_password_token_life: RESET_PASSWORD_TOKEN_LIFE,
  });

  // NOTE: Log này để test với email giả lập
  myLogger.info(`Password reset link generated for ${email}: ${resetURL}`);

  return resetURL;
};

const resetPassword = async (token, newPassword) => {
  const email = await defaultRedisClient.get(`reset:${token}`);
  if (!email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired token");
  }
  const isUserExists = await userModel.isUserExists(email);
  if (!isUserExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  const user = await userModel.updateUserByEmail(email, {
    password: hashedPassword,
  });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  await defaultRedisClient.del(`reset:${token}`);
  return user._id;
};

const register = async (userData) => {
  try {
    const salt = await bcrypt.genSalt(10);

    // NOTE: môi dev sẽ đặt mật khẩu mặc định, môi trường production thì random
    if (env.BUILD_MODE === "dev") {
      userData.password = "#12345678Gu";
    } else {
      userData.password = generatePassword();
    }

    userData.password = await bcrypt.hash(userData.password, salt);

    if (!userData.avatar) {
      userData.avatar = placeholderAvatar(userData.fullName);
    }

    // Thêm thông tin address
    if (userData.address) {
      userData.address.recipientName = userData.fullName;
      userData.address.isDefault = true;
      userData.addresses = [userData.address];
      delete userData.address;
    }

    let newUser = await userModel.createUser(userData);
    newUser = newUser.toObject();
    delete newUser.password;
    newUser.createdAt = getVietnamDatetimeString(newUser.createdAt);
    newUser.updatedAt = getVietnamDatetimeString(newUser.updatedAt);

    /** Gửi email xác nhận đăng ký và yêu cầu đặt mật khẩu ban đầu */
    const token = crypto.randomBytes(32).toString("hex");
    await defaultRedisClient.setex(
      `reset:${token}`,
      EMAIL_CONFIRMATION_TOKEN_LIFE,
      newUser.email
    );
    const resetURL = `${env.FE_CLIENT_HOST}:${env.FE_CLIENT_PUBLIC_PORT}${CONFIRM_EMAIL_BASE_URL}?token=${token}`;
    myLogger.debug(
      `Registration confirmation link for ${newUser.email}: ${resetURL}`
    );

    await emailQueue.add("send_welcome_email", {
      to: newUser.email,
      userName: newUser.fullName,
      resetLink: resetURL,
      email_confirmation_token_life: EMAIL_CONFIRMATION_TOKEN_LIFE,
    });

    // NOTE: Log này để test với email giả lập
    myLogger.info(
      `Registration confirmation link generated for ${newUser.email}: ${resetURL}`
    );

    // Tạo thông tin Payload để  trong JWT Token
    const payload = {
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
    };
    // Tạo Access Token
    const accessToken = await jwtProvider.generateToken(
      payload,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      JWT_LIFE.ACCESS_TOKEN_LIFE
    );
    // Tạo Refresh Token
    const refreshToken = await jwtProvider.generateToken(
      payload,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      JWT_LIFE.REFRESH_TOKEN_LIFE
    );

    return { newUser, accessToken, refreshToken };
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.email) {
      // Email đã tồn tại
      throw new ApiError(StatusCodes.CONFLICT, "Email already exists");
    } else if (
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      // Nếu xảy ra các lỗi khác liên quan đến Token
      myLogger.error(error.message, { stack: error.stack });
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Register success but error when generating token! Please login again."
      );
    } else if (error.name === "ValidationError") {
      // Dữ liệu bị lỗi do quá trình xử lý của server
      myLogger.error(error.message, { stack: error.stack });
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Data was corrupted during server processing."
      );
    }
    throw error;
  }
};

const getAllUsers = async (page, limit, search) => {
  const { users, total, totalPages } = await userModel.getAllUsers(
    page,
    limit,
    search
  );
  // Xoá thông tin password và địa chỉ
  const processedUsers = users.map((user) => {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.addresses;
    userObj.createdAt = getVietnamDatetimeString(userObj.createdAt);
    userObj.updatedAt = getVietnamDatetimeString(userObj.updatedAt);
    return userObj;
  });

  return {
    users: processedUsers,
    total,
    page,
    limit,
    totalPages,
  };
};

const isActive = async (email) => {
  const status = await userModel.getUserStatusByEmail(email);
  return status === "active";
};

const deleteUser = async (userId) => {
  // Không cho xoá admin
  const role = await userModel.getUserRoleById(userId);
  if (!role) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  if (role === ROLE[1]) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Cannot delete admin user");
  }
  const result = await userModel.deleteUser(userId);
  if (!result) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  result.toObject();
  delete result.password;
  delete result.addresses;
  result.createdAt = getVietnamDatetimeString(result.createdAt);
  result.updatedAt = getVietnamDatetimeString(result.updatedAt);
  return result;
};

const uploadAvatar = async (userId, filePath) => {
  const user = await updateUser(userId, { avatar: filePath });

  // NOTE: chỉ môi trường dev mới upload file lên cloud storage
  if (env.BUILD_MODE === "dev") {
    try {
      // Đọc file từ đường dẫn trên server và gửi nội dung (base64) vào job
      if (!filePath) throw new Error("filePath is required for avatar upload");
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);
      const buffer = await fs.promises.readFile(absolutePath);
      const b64 = buffer.toString("base64");
      const ext = path.extname(filePath) || ".jpg";
      const destPath = `avatars/${userId}${ext}`;

      await uploadFileToCloudStorageQueue.add("upload_file", {
        fileBuffer: b64,
        destPath,
        isAvatar: true,
        userId,
      });
    } catch (err) {
      myLogger.error("Failed to enqueue avatar upload job: " + err.message, {
        stack: err.stack,
      });
    }
  }

  return { _id: user._id, avatar: user.avatar };
};

const googleLogin = async (userGoogleData) => {
  try {
    const userData = {
      fullName: userGoogleData.displayName,
      email: userGoogleData.emails[0].value,
      avatar: userGoogleData.photos[0].value,
    };

    // Kiểm tra nếu email đã có trong db chưa
    if (await userModel.isUserExists(userData.email)) {
      return login(userData.email, null, true);
    }

    // Tạo mới bằng cách gọi service register
    return register(userData);
  } catch (error) {
    myLogger.error("Converting Google user data error: " + error.message, {
      stack: error.stack,
    });
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Converting Google user data error"
    );
  }
};

export const userService = {
  login,
  getUserById,
  register,
  refreshToken,
  getAllUsers,
  updateUser,
  changePassword,
  passwordRecovery,
  resetPassword,
  isActive,
  updateStatus,
  deleteUser,
  uploadAvatar,
  googleLogin,
  findOrCreateUserForGuest,
};
