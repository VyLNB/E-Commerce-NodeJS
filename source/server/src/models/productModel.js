/* eslint-disable indent */
import mongoose from "mongoose";
import { productSchema } from "./schemas.js";
import { myLogger } from "~/loggers/mylogger.log.js";
import { categoryModel } from "./categoryModel.js";

const Product = mongoose.model("Product", productSchema);

// PRODUCT
const find = async (queryParams) => {
  const {
    q,
    categoryId,
    categorySlug,
    brandId,
    minPrice,
    maxPrice,
    status,
    sortBy,
    page = 1,
    limit = 20,
  } = queryParams;

  // --- BƯỚC 1: Xây dựng bộ lọc cấp Sản Phẩm (Base Query) ---
  const matchQuery = {};

  // 1.1 Lọc theo Status & Brand
  if (status) matchQuery.status = status;
  if (brandId) matchQuery.brandId = new mongoose.Types.ObjectId(brandId);

  // 1.2 Lọc theo Search Text (Tên sản phẩm)
  if (q) {
    matchQuery.name = { $regex: q, $options: "i" };
  }

  // 1.3 Lọc theo Category (Logic quan trọng)
  if (categoryId) {
    matchQuery.categoryId = new mongoose.Types.ObjectId(categoryId);
  } else if (categorySlug) {
    // Nếu có slug, tìm ID của nó và các con cháu
    const slugs = categorySlug
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (slugs.length > 0) {
      const categoryIds = await categoryModel.findBySlugs(slugs);

      // CHỈ lọc theo ID, đảm bảo không bị nhầm sang field khác
      if (categoryIds.length > 0) {
        matchQuery.categoryId = { $in: categoryIds };
      } else {
        // Nếu slug không tồn tại, trả về rỗng luôn để tránh query sai
        return {
          products: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalProducts: 0,
            limit,
          },
        };
      }
    }
  }

  // --- BƯỚC 2: Xây dựng bộ lọc Biến thể (Variant Filters) ---
  // Thay vì Unwind, ta dùng $elemMatch để tìm sản phẩm có biến thể phù hợp

  // 2.1 Lọc theo Giá (Tìm trong mảng variants có variant nào nằm trong khoảng giá không)
  if (minPrice || maxPrice) {
    if (minPrice) {
      matchQuery.price = { ...matchQuery.price, $gte: Number(minPrice) };
    }
    if (maxPrice) {
      matchQuery.price = { ...matchQuery.price, $lte: Number(maxPrice) };
    }
  }

  // 2.2 Lọc theo Thuộc tính Động (Màu sắc, Size...)
  // Loại bỏ các key đặc biệt để lấy ra các key thuộc tính
  const ignoredKeys = [
    "q",
    "categorySlug",
    "category",
    "brandId",
    "minPrice",
    "maxPrice",
    "status",
    "sortBy",
    "sort_by",
    "isActive",
    "page",
    "limit",
    "sort",
    "order",
  ];
  const attributeFilters = [];

  Object.keys(queryParams).forEach((key) => {
    if (!ignoredKeys.includes(key) && queryParams[key] !== undefined) {
      const value = queryParams[key];
      const filterValues = Array.isArray(value)
        ? value
        : String(value)
            .split(",")
            .map((v) => v.trim());

      attributeFilters.push({
        $or: [
          // 1. Tìm ở Attributes cấp Product
          { [`attributes.${key}`]: { $in: filterValues } },

          // 2. Tìm ở Attributes cấp Variant
          { [`variants.attributes.${key}`]: { $in: filterValues } },

          // 3. Tìm trong Specifications (Nơi chứa dữ liệu Kích thước, CPU, RAM...)
          { [`specifications.${key}`]: { $in: filterValues } },
        ],
      });
    }
  });

  // Nếu có điều kiện lọc biến thể (Attributes), dùng $elemMatch
  if (attributeFilters.length > 0) {
    matchQuery.$and = attributeFilters;
  }

  // Debug: Log ra query cuối cùng để kiểm tra
  myLogger.debug(
    `[Product Find] Final MatchQuery: ${JSON.stringify(matchQuery)}`
  );

  // --- BƯỚC 3: Thực thi Query (Dùng Pipeline đơn giản để Join & Sort) ---

  const sortOptions = {};
  if (sortBy === "price_asc") sortOptions.price = 1;
  else if (sortBy === "price_desc") sortOptions.price = -1;
  else if (sortBy === "name_asc") sortOptions.name = 1;
  else sortOptions.createdAt = -1; // Default newest

  const pipeline = [
    { $match: matchQuery }, // Lọc ngay bước đầu
    { $sort: sortOptions },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          // Join Category
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          // Join Brand
          {
            $lookup: {
              from: "brands",
              localField: "brandId",
              foreignField: "_id",
              as: "brand",
            },
          },
          { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
          // Project để format data gọn gàng
          {
            $project: {
              name: 1,
              slug: 1,
              description: 1,
              images: 1,
              price: 1,
              variantOptions: 1,
              variants: 1,
              createdAt: 1,
              updatedAt: 1,
              status: 1,
              totalRating: 1,
              avgStar: 1,
              specifications: 1,
              attributes: 1,
              category: { _id: 1, name: 1, slug: 1 },
              brand: { _id: 1, name: 1, slug: 1 },
            },
          },
        ],
      },
    },
  ];

  const result = await Product.aggregate(pipeline).exec();

  const metadata = result[0].metadata[0];
  const totalProducts = metadata ? metadata.total : 0;
  const products = result[0].data;
  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products,
    pagination: {
      currentPage: page,
      totalPages,
      totalProducts,
      limit,
    },
  };
};

const create = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

const update = async (id, updateData) =>
  await Product.findByIdAndUpdate(id, updateData, { new: true })
    .select("-ratings")
    .exec();

const remove = async (id) =>
  await Product.findByIdAndUpdate(id, { status: "discontinued" }).exec();

// VARIANTS
const addVariant = async (productId, variantData) =>
  await Product.findByIdAndUpdate(
    productId,
    { $push: { variants: variantData } },
    { new: true, runValidators: true } // 'new: true' trả về document đã cập nhật
  ).select("-ratings");
const updateVariant = async (productId, variantId, variantData) => {
  // Tạo object $set động
  // Ví dụ: { 'variants.$.stock': 100, 'variants.$.priceAdjustment': 5 }
  const updateFields = {};
  for (const key in variantData) {
    updateFields[`variants.$[elem].${key}`] = variantData[key];
  }

  return await Product.findOneAndUpdate(
    { _id: productId },
    { $set: updateFields },
    {
      arrayFilters: [{ "elem._id": variantId }], // Chỉ cập nhật element khớp variantId
      new: true,
      runValidators: true,
    }
  ).select("-ratings");
};

const removeVariant = async (productId, variantId) =>
  await Product.findByIdAndUpdate(
    productId,
    { $pull: { variants: { _id: variantId } } },
    { new: true }
  ).select("-ratings");

// Lấy document từ Category khớp với category_id
// và chỉ lấy 2 fields là name và slug
const findById = async (id) =>
  await Product.findById(id)
    .select("-ratings")
    .populate("categoryId", "name slug")
    .populate("brandId", "name slug")
    .exec();

// Ratings operations
const addRating = async (productId, rating) => {
  if (!rating._id) rating._id = new mongoose.Types.ObjectId();

  const product = await Product.findByIdAndUpdate(
    productId,
    { $push: { ratings: rating } },
    { new: true, runValidators: true, context: "query" }
  )
    .populate("ratings.postedBy", "fullName avatar")
    .exec();
  return product;
};

const listRatings = async (productId, options = {}) => {
  const product = await Product.findById(productId)
    .select("ratings totalRating avgStar")
    .populate("ratings.postedBy", "fullName avatar")
    .exec();
  if (!product) return null;
  const { page = 1, limit = 20 } = options;
  const start = (page - 1) * limit;
  const end = start + limit;
  const ratings = product.ratings.slice(start, end);
  return {
    ratings,
    total: product.ratings.length,
    page,
    limit,
    avgStar: product.avgStar || 0,
    totalRating: product.totalRating || 0,
  };
};

const updateRating = async (productId, ratingId, updateData) => {
  // Try positional atomic update first
  const setObj = Object.fromEntries(
    Object.entries(updateData).map(([k, v]) => [`ratings.$.${k}`, v])
  );

  let product = await Product.findOneAndUpdate(
    { _id: productId, "ratings._id": ratingId },
    { $set: setObj },
    { new: true, runValidators: true, context: "query" }
  )
    .populate("ratings.postedBy", "fullName avatar")
    .exec();

  if (product) return product;

  // Fallback: try to find product and update by array index in case of id type mismatch
  const doc = await Product.findById(productId).exec();
  if (!doc) return null;

  const idx = doc.ratings.findIndex((r) => {
    try {
      return r._id && r._id.toString() === String(ratingId);
    } catch {
      return false;
    }
  });

  if (idx === -1) return null;

  // Build $set object using the found index to update specific array element
  const setByIndex = Object.fromEntries(
    Object.entries(updateData).map(([k, v]) => [`ratings.${idx}.${k}`, v])
  );

  product = await Product.findByIdAndUpdate(
    productId,
    { $set: setByIndex },
    { new: true, runValidators: true, context: "query" }
  )
    .populate("ratings.postedBy", "fullName avatar")
    .exec();

  return product;
};

const removeRating = async (productId, ratingId) => {
  // Use updateOne to get the modifiedCount so we can tell if anything was removed
  const res = await Product.updateOne(
    { _id: productId },
    { $pull: { ratings: { _id: ratingId } } }
  ).exec();

  const modified = res && (res.modifiedCount ?? res.nModified ?? 0);

  if (!modified) return null;

  // Fetch document after change to verify removal and return result
  let product = await Product.findById(productId).lean().exec();

  // Check if rating still exists (handling potential type mismatches)
  const ratingExists =
    product &&
    (product.ratings || []).some((r) => {
      try {
        return r._id && String(r._id) === String(ratingId);
      } catch {
        return false;
      }
    });

  // If updateOne reported a modification but the element still exists,
  // try native collection update with explicit ObjectId to handle any type mismatch.
  if (ratingExists) {
    try {
      const coll = Product.collection;
      const oid = mongoose.Types.ObjectId.isValid(productId)
        ? new mongoose.Types.ObjectId(productId)
        : productId;
      const rid = mongoose.Types.ObjectId.isValid(ratingId)
        ? new mongoose.Types.ObjectId(ratingId)
        : ratingId;

      await coll.updateOne({ _id: oid }, { $pull: { ratings: { _id: rid } } });

      // Refetch after native update
      product = await Product.findById(productId).lean().exec();
    } catch (err) {
      myLogger.error(
        `Error during fallback native delete for ratingId=${ratingId} on productId=${productId}: ${err}`
      );
    }
  }

  return product;
};

const checkRatingOwnership = async (productId, ratingId, userId) => {
  try {
    const product = await Product.findOne({
      _id: productId,
      "ratings._id": ratingId,
    }).select("ratings");

    if (!product) {
      return false;
    }

    const rating = product.ratings.find(
      (r) => r._id && r._id.toString() === ratingId.toString()
    );

    if (!rating) {
      return false;
    }

    return rating.postedBy && rating.postedBy.toString() === userId.toString();
  } catch (err) {
    myLogger.error(`checkRatingOwnership error: ${err.message}`);
    return false;
  }
};

const recalcTotalRating = async (productId) => {
  // Use aggregation to compute average safely and update atomically to avoid
  // load-then-save race conditions that can restore removed subdocuments.
  const oid = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;

  const pipeline = [
    { $match: { _id: oid } },
    {
      $facet: {
        // Calculate total count of all ratings (valid or invalid)
        stats: [
          {
            $project: {
              totalRating: { $size: { $ifNull: ["$ratings", []] } },
            },
          },
        ],
        // Calculate average only for valid ratings (1-5 stars)
        average: [
          { $unwind: { path: "$ratings", preserveNullAndEmptyArrays: false } },
          {
            $project: {
              star: { $toDouble: "$ratings.star" },
            },
          },
          {
            $match: {
              star: { $gte: 1, $lte: 5 },
            },
          },
          {
            $group: {
              _id: null,
              avgStar: { $avg: "$star" },
              stars: { $push: "$star" },
            },
          },
        ],
      },
    },
  ];

  const res = await Product.aggregate(pipeline).exec();
  let avg = 0;
  let count = 0;

  if (res && res.length > 0) {
    // Extract total count
    if (res[0].stats && res[0].stats.length > 0) {
      count = res[0].stats[0].totalRating || 0;
    }

    // Extract average
    if (res[0].average && res[0].average.length > 0) {
      const avgData = res[0].average[0];
      const validStars = avgData.stars || [];

      if (typeof avgData.avgStar === "number") {
        const v = Number(avgData.avgStar);
        if (Number.isFinite(v)) {
          avg = +v.toFixed(2);
        }
      } else if (validStars.length > 0) {
        // Fallback manual calculation
        const sum = validStars.reduce((a, b) => a + b, 0);
        avg = +(sum / validStars.length).toFixed(2);
      }
    }
  }

  // ensure avg is a valid finite number before updating
  if (!Number.isFinite(avg)) avg = 0;

  await Product.updateOne(
    { _id: oid },
    { $set: { totalRating: count, avgStar: avg } }
  ).exec();

  return { totalRating: count, avgStar: avg };
};

export const productModel = {
  find,
  findById,
  create,
  update,
  remove,
  addVariant,
  removeVariant,
  updateVariant,
  addRating,
  listRatings,
  updateRating,
  removeRating,
  checkRatingOwnership,
  recalcTotalRating,
};
