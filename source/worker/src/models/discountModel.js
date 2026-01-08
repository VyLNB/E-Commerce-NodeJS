import mongoose from "mongoose";
import { discountSchema } from "./schemas.js";
import { myLogger } from "../loggers/myLogger.js";

const Discount = mongoose.model("Discount", discountSchema);

// Tạo mã giảm giá mới
const createDiscount = async (discountData) => {
  const discount = new Discount(discountData);
  return await discount.save();
};

// Lấy mã giảm giá theo code
const getDiscountByCode = async (code) =>
  await Discount.findOne({ code: code.trim() }).exec();

// Lấy mã giảm giá theo ID
const getDiscountById = async (discountId) =>
  await Discount.findById(discountId).exec();

// Cập nhật mã giảm giá
const updateDiscount = async (discountId, updateData) => {
  const discount = await Discount.findByIdAndUpdate(discountId, updateData, {
    new: true,
  });
  return discount;
};

// Lấy tất cả mã giảm giá (hỗ trợ phân trang và sắp xếp)
// Tham số options: { page, limit, sort }
// - page: số trang (bắt đầu từ 1)
// - limit: số bản ghi mỗi trang
// - sort: object sắp xếp theo cú pháp Mongoose, ví dụ { createdAt: -1 }
const getAllDiscounts = async (filter = {}, options = {}) => {
  const page = parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const limit =
    parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 20;
  const sort = options.sort || { createdAt: -1 };
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Discount.find(filter).sort(sort).skip(skip).limit(limit).exec(),
    Discount.countDocuments(filter),
  ]);

  myLogger.debug("getAll - db filter", filter, "options", options);
  myLogger.debug(
    "getAll - returned docs count" + docs.length + "total" + total
  );

  return { docs, total, page, limit };
};
// Xóa mã giảm giá
const deleteDiscount = async (discountId) => {
  const result = await Discount.findByIdAndDelete(discountId).exec();
  return result;
};

export const discountModel = {
  createDiscount,
  getDiscountByCode,
  updateDiscount,
  getAllDiscounts,
  deleteDiscount,
  getDiscountById,
  Discount, // Export model để sử dụng populate
};
