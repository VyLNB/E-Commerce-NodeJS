/* eslint-disable indent */
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { myLogger } from "~/loggers/mylogger.log";
import { getVietnamDatetimeString } from "~/utils/datetime";
import { discountModel } from "~/models/discountModel";
import { DISCOUNT } from "~/utils/constants";

// Tính trạng thái active từ các trường trong document
const computeIsActiveFromDoc = (discount) => {
  if (discount.isActive === false) {
    return false;
  }
  const now = new Date();
  const usageLimitTotal =
    typeof discount.usageLimitTotal === "number" ? discount.usageLimitTotal : 0;
  const usedCount =
    typeof discount.usedCount === "number" ? discount.usedCount : 0;

  let shouldBeActive = true;

  // Check start date
  if (discount.validFrom && new Date(discount.validFrom) > now) {
    shouldBeActive = false;
  }

  // Check usage limit
  if (usedCount >= usageLimitTotal) {
    shouldBeActive = false;
  }

  myLogger.debug(
    "Computed isActive for discount " +
      discount.code +
      ": " +
      shouldBeActive +
      " (now: " +
      getVietnamDatetimeString(now) +
      ", validFrom: " +
      getVietnamDatetimeString(discount.validFrom) +
      ", usageLimitTotal: " +
      usageLimitTotal +
      ", usedCount: " +
      usedCount +
      ")"
  );

  return shouldBeActive;
};

// Tạo mã giảm giá mới
const create = async (discount) => {
  try {
    discount.name = discount.name || `Mã giảm giá #${discount.code}`;
    discount.usageLimitPerCustomer =
      discount.usageLimitPerCustomer || discount.usageLimitTotal;
    discount.validFrom = discount.validFrom || new Date();
    discount.type = discount.type || DISCOUNT.DISCOUNT_TYPE[0];

    let newDiscount = await discountModel.createDiscount(discount);

    const computedActive = computeIsActiveFromDoc(newDiscount);
    myLogger.debug(
      `Created new discount with code ${newDiscount.code}, computed isActive: ${computedActive}`
    );
    newDiscount = convertTimeFields(newDiscount);
    newDiscount.isActive = computedActive;

    myLogger.debug(
      `Created new discount with code ${newDiscount.code}, isActive: ${newDiscount.isActive}`
    );

    return newDiscount;
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.code) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Discount code already exists. Please choose a different code."
      );
    }

    if (error.name === "ValidationError") {
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

// Lấy mã giảm giá theo code
const getByCode = async (code) => {
  try {
    let discount = await discountModel.getDiscountByCode(code);

    if (!discount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Discount not found.");
    }

    // Tính lại trạng thái isActive and attach after converting time fields
    const computedActive = computeIsActiveFromDoc(discount);
    discount = convertTimeFields(discount);
    discount.isActive = computedActive;

    return discount;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    myLogger.error("Error fetching discount by code: " + error.message, {
      stack: error.stack,
    });
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to fetch discount by code."
    );
  }
};

// Vô hiệu hóa mã giảm giá
const disable = async (discountId) => {
  const oldDiscount = await discountModel.getDiscountById(discountId);
  if (!oldDiscount) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Discount not found.");
  }

  const updatedDiscount = await discountModel.updateDiscount(discountId, {
    usageLimitTotal: oldDiscount.usedCount,
  });

  if (!updatedDiscount) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Discount not found.");
  }

  const computedActive = computeIsActiveFromDoc(updatedDiscount);
  const convertedDiscount = convertTimeFields(updatedDiscount);
  convertedDiscount.isActive = computedActive;

  return convertedDiscount;
};

// Lấy tất cả mã giảm giá (hỗ trợ pagination & sort)
const getAll = async (query = {}) => {
  try {
    // 1. Khởi tạo filter cho DB và biến lọc `isActive`
    const filter = {};
    let filterByIsActive = null; // null: không lọc, true: lọc active, false: lọc inactive

    // 2. Validation và parsing các tham số pagination
    const maxLimit = 100;
    const parsed = Number.parseInt(query.page, 10);
    const page = Number.isFinite(parsed) ? Math.max(parsed, 1) : 1;
    const limitRaw = Math.max(parseInt(query.limit, 10) || 20, 1);
    const limit = Math.min(limitRaw, maxLimit);

    // 3. Parse shorthand filter (query.filter)
    const dateFields = ["validFrom", "validTo"];
    if (query.filter && typeof query.filter === "string") {
      try {
        const parts = query.filter
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        for (const part of parts) {
          const p = part.split(":");
          if (p.length === 2) {
            // Dạng field:value
            const [field, raw] = p;
            if (!DISCOUNT.ALLOWED_FILTER_FIELDS.includes(field)) continue;
            if (field === "isActive") {
              const val = String(raw).toLowerCase();
              if (val === "true" || val === "false") {
                filterByIsActive = val === "true";
              }
              continue;
            }
            if (raw.includes("|")) {
              const vals = raw
                .split("|")
                .map((v) => v.trim())
                .filter(Boolean);
              if (vals.length) {
                filter[field] = vals.length === 1 ? vals[0] : { $in: vals };
              }
            } else if (dateFields.includes(field)) {
              const d = new Date(raw);
              if (!Number.isNaN(d.getTime())) filter[field] = d;
            } else if (raw.indexOf(".") === -1 && !Number.isNaN(Number(raw))) {
              filter[field] = Number(raw);
            } else if (
              raw.toLowerCase() === "true" ||
              raw.toLowerCase() === "false"
            ) {
              filter[field] = raw.toLowerCase() === "true";
            } else {
              filter[field] = { $regex: raw, $options: "i" };
            }
          } else if (p.length >= 3) {
            // Dạng field:op:value
            const [field, op, ...rest] = p;
            if (!DISCOUNT.ALLOWED_FILTER_FIELDS.includes(field)) continue;
            if (field === "isActive") continue; // Đã xử lý ở trên
            const raw = rest.join(":");
            switch ((op || "eq").toLowerCase()) {
              case "eq":
                if (dateFields.includes(field)) {
                  const d = new Date(raw);
                  filter[field] = !Number.isNaN(d.getTime()) ? d : raw;
                } else {
                  filter[field] = raw;
                }
                break;
              case "ne":
                filter[field] = { $ne: raw };
                break;
              case "lt":
                if (dateFields.includes(field)) {
                  filter[field] = { $lt: new Date(raw) };
                } else {
                  filter[field] = { $lt: Number(raw) };
                }
                break;
              case "lte":
                if (dateFields.includes(field)) {
                  filter[field] = { $lte: new Date(raw) };
                } else {
                  filter[field] = { $lte: Number(raw) };
                }
                break;
              case "gt":
                if (dateFields.includes(field)) {
                  filter[field] = { $gt: new Date(raw) };
                } else {
                  filter[field] = { $gt: Number(raw) };
                }
                break;
              case "gte":
                if (dateFields.includes(field)) {
                  filter[field] = { $gte: new Date(raw) };
                } else {
                  filter[field] = { $gte: Number(raw) };
                }
                break;
              case "like":
                filter[field] = { $regex: raw, $options: "i" };
                break;
              case "in":
                filter[field] = {
                  $in: raw
                    .split("|")
                    .map((v) => v.trim())
                    .filter(Boolean),
                };
                break;
              default:
                filter[field] = raw;
            }
          }
        }
      } catch (err) {
        myLogger.warn("Failed to parse shorthand filter: " + err.message);
      }
    }

    // 4. Parse các filter đơn giản (ghi đè shorthand nếu được cung cấp)
    // (Dựa trên các trường trong discountValidation.js)
    if (query.code) {
      filter.code = { $regex: query.code, $options: "i" };
    }
    if (query.name) {
      filter.name = { $regex: query.name, $options: "i" };
    }
    if (query.isActive !== undefined) {
      filterByIsActive = String(query.isActive).toLowerCase() === "true";
    }
    if (query.minDiscount || query.maxDiscount) {
      filter.discountValue = { ...filter.discountValue };
      if (query.minDiscount) {
        filter.discountValue.$gte = Number(query.minDiscount);
      }
      if (query.maxDiscount) {
        filter.discountValue.$lte = Number(query.maxDiscount);
      }
    }
    if (query.validFromAfter || query.validFromBefore) {
      filter.validFrom = { ...filter.validFrom };
      if (query.validFromAfter) {
        filter.validFrom.$gte = new Date(query.validFromAfter);
      }
      if (query.validFromBefore) {
        filter.validFrom.$lte = new Date(query.validFromBefore);
      }
    }

    // 5. Thêm logic lọc `isActive` vào DB filter
    const now = new Date();
    if (filterByIsActive === true) {
      // Điều kiện ACTIVE:
      // 1. validFrom <= now (hoặc null)
      // 2. usedCount < usageLimitTotal
      filter.validFrom = { ...(filter.validFrom || {}), $lte: now };
      filter.$expr = { $lt: ["$usedCount", "$usageLimitTotal"] };
    } else if (filterByIsActive === false) {
      // Điều kiện INACTIVE:
      // 1. validFrom > now
      // HOẶC 2. usedCount >= usageLimitTotal
      filter.$or = [
        { validFrom: { $gt: now } },
        { $expr: { $gte: ["$usedCount", "$usageLimitTotal"] } },
      ];
    }
    // Nếu filterByIsActive === null, không thêm điều kiện lọc active.

    // 6. Xử lý sắp xếp
    let sort = { createdAt: -1 };
    if (query.sortBy) {
      const order = (query.order || "desc").toLowerCase() === "asc" ? 1 : -1;
      if (DISCOUNT.ALLOWED_SORT_FIELDS.includes(query.sortBy)) {
        sort = { [query.sortBy]: order };
      }
    } else if (query.sort) {
      try {
        let parsedSort = {};
        if (typeof query.sort === "string") {
          const parts = query.sort
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          for (const p of parts) {
            const [field, dir] = p.split(":").map((s) => s.trim());
            if (!field) continue;
            const order = (dir || "desc").toLowerCase() === "asc" ? 1 : -1;
            parsedSort[field] = order;
          }
        } else if (typeof query.sort === "object" && query.sort !== null) {
          parsedSort = query.sort;
        }

        const keys = Object.keys(parsedSort || {});
        const invalid = keys.some(
          (k) => !DISCOUNT.ALLOWED_SORT_FIELDS.includes(k)
        );
        if (!invalid && keys.length) sort = parsedSort;
      } catch (err) {
        // nếu parse lỗi, bỏ qua, giữ nguyên default
        myLogger.warn("Failed to parse sort string: " + err.message);
      }
    }

    // 7. Gọi Database
    const options = { page, limit, sort };
    const { docs, total } = await discountModel.getAllDiscounts(
      filter,
      options
    );

    // 8. Xử lý hậu kỳ (Post-processing)
    // Chỉ tính toán và format, KHÔNG LỌC
    const items = docs.map((d) => {
      // Tính toán `isActive` để trả về cho client
      const computedActive = computeIsActiveFromDoc(d);
      const obj = convertTimeFields(d);
      obj.isActive = computedActive;

      if (Object.prototype.hasOwnProperty.call(obj, "usages")) {
        delete obj.usages;
      }

      return obj;
    });

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return {
      items: items, // Trả về `items`
      meta: { total: total, page, limit, totalPages }, // Trả về `total` từ DB
    };
  } catch (error) {
    myLogger.error("Error fetching all discounts: " + error.message, {
      stack: error.stack,
    });
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to fetch discounts."
    );
  }
};

// Xóa mã giảm giá
// const remove = async (discountId) => {
//   try {
//     const deletedDiscount = await discountModel.deleteDiscount(discountId);
//     if (!deletedDiscount) {
//       throw new ApiError(StatusCodes.NOT_FOUND, "Discount not found.");
//     }
//     return deletedDiscount;
//   } catch (error) {
//     if (error instanceof ApiError) {
//       throw error;
//     }
//     myLogger.error("Error deleting discount: " + error.message, {
//       stack: error.stack,
//     });
//     throw new ApiError(
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       "Failed to delete discount."
//     );
//   }
// };

const convertTimeFields = (discount) => {
  // Accept either a mongoose document or a plain object. If doc has toObject,
  // call it; otherwise assume it's already a plain object. Preserve any
  // existing non-schema properties by merging.
  const plain =
    typeof discount.toObject === "function"
      ? discount.toObject()
      : { ...discount };
  // copy back to a mutable object
  discount = { ...plain };
  if (discount.validFrom) {
    discount.validFrom = getVietnamDatetimeString(discount.validFrom);
  }
  if (discount.createdAt) {
    discount.createdAt = getVietnamDatetimeString(discount.createdAt);
  }
  if (discount.updatedAt) {
    discount.updatedAt = getVietnamDatetimeString(discount.updatedAt);
  }
  return discount;
};

// Kiểm tra tính hợp lệ và trả về các giá trị cần thiết để tạm tính cho đơn hàng
const validateDiscountForOrder = async (code) => {
  const discount = await getByCode(code);
  if (!discount) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Discount not found.");
  }

  if (!discount.isActive) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Discount is expired or inactive."
    );
  }

  return {
    _id: discount._id,
    code: code,
    discountValue: discount.discountValue,
    type: discount.type,
  };
};

// Cập nhật mã giảm giá
const update = async (discountId, updateData) => {
  try {
    let updatedDiscount = await discountModel.updateDiscount(
      discountId,
      updateData
    );

    if (!updatedDiscount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Discount not found.");
    }

    const computedActive = computeIsActiveFromDoc(updatedDiscount);
    updatedDiscount = convertTimeFields(updatedDiscount);
    updatedDiscount.isActive = computedActive;

    return updatedDiscount;
  } catch (error) {
    if (error.name === "ValidationError") {
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

export const discountService = {
  create,
  getAll,
  validateDiscountForOrder,
  update,
  disable,
};
