import { StatusCodes } from "http-status-codes";
import { myLogger } from "~/loggers/mylogger.log.js";
import { productModel } from "~/models/productModel";
import {
  broadcastProductChange,
  broadcastReviewUpdate,
} from "~/providers/websocket.js";
import { formatProduct } from "~/utils";
import ApiError from "~/utils/ApiError";

const addRating = async (productId, ratingData, userId = null) => {
  try {
    // Validate star if present
    if (ratingData.star !== undefined) {
      if (typeof ratingData.star !== "number" || isNaN(ratingData.star)) {
        throw new ApiError(400, "Invalid star rating");
      }
    }

    // Nếu không có postedBy, thì lấy từ req, không có thì để null (chưa đăng nhập)
    if (!ratingData.postedBy) {
      ratingData.postedBy = userId;
    }

    const product = await productModel.addRating(productId, ratingData);
    if (!product) throw new ApiError(404, "Product not found");
    const { totalRating, avgStar } = await productModel.recalcTotalRating(
      productId
    );

    myLogger.debug(
      `[addRating Service] New Total Rating: ${totalRating}, Avg Star: ${avgStar}`
    );

    // return the newly added rating (last element)
    const added = product.ratings[product.ratings.length - 1];
    const result = {
      rating: added.toObject ? added.toObject() : added,
      totalRating,
      avgStar,
    };

    // Broadcast update via WebSocket
    broadcastReviewUpdate(productId, result);

    return result;
  } catch (error) {
    if (error.name === "ValidationError") {
      myLogger.error("Mongoose validation error", {
        message: error.message,
        stack: error.stack,
      });
      throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
    throw error;
  }
};

const listRatings = async (productId, page = 1, limit = 20) => {
  const res = await productModel.listRatings(productId, { page, limit });
  if (!res) throw new ApiError(404, "Product not found");
  return res;
};

const updateRating = async (
  productId,
  ratingId,
  updateData,
  isAdmin = false,
  userId = null
) => {
  // Kiểm tra quyền (tương tự removeRating)
  let isOwner = false;
  if (userId) {
    isOwner = await productModel.checkRatingOwnership(
      productId,
      ratingId,
      userId
    );
  }

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You do not have permission to update this rating"
    );
  }

  try {
    const product = await productModel.updateRating(
      productId,
      ratingId,
      updateData
    );
    if (!product) throw new ApiError(404, "Rating or Product not found");
    const { totalRating, avgStar } = await productModel.recalcTotalRating(
      productId
    );

    // Tìm rating vừa update để trả về (thay vì lấy cái cuối cùng như code cũ)
    const updatedRating =
      product.ratings.find(
        (r) => r._id && r._id.toString() === ratingId.toString()
      ) || product.ratings[product.ratings.length - 1];

    const result = {
      rating: updatedRating.toObject ? updatedRating.toObject() : updatedRating,
      totalRating,
      avgStar,
    };

    // Broadcast update via WebSocket
    broadcastReviewUpdate(productId, result);

    return result;
  } catch (error) {
    if (error.name === "ValidationError") {
      myLogger.error("Mongoose validation error", {
        message: error.message,
        stack: error.stack,
      });
      throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
    throw error;
  }
};

const removeRating = async (
  productId,
  ratingId,
  isAdmin = false,
  userId = null
) => {
  // Kiểm tra quyền xóa
  // nếu là admin hoặc chủ sở hữu rating thì được xóa
  let isOwner = false;
  if (userId) {
    isOwner = await productModel.checkRatingOwnership(
      productId,
      ratingId,
      userId
    );
  }
  if (!isOwner && !isAdmin) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You do not have permission to delete this rating"
    );
  }

  const product = await productModel.removeRating(productId, ratingId);
  if (!product) throw new ApiError(404, "Rating or Product not found");

  // Recalculate and use the updated totalRating returned by the helper
  const { totalRating, avgStar } = await productModel.recalcTotalRating(
    productId
  );

  const result = { message: "Rating removed", totalRating, avgStar };

  // Broadcast update via WebSocket
  broadcastReviewUpdate(productId, result);

  return result;
};

const find = async (queryParams) => {
  const { products, pagination } = await productModel.find(queryParams);
  const formattedProducts = products.map(formatProduct);
  return { products: formattedProducts, pagination };
};

const findById = async (id) => {
  const product = await productModel.findById(id);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }
  return formatProduct(product);
};

const create = async (productData) => {
  // 1. Tách variants ra khỏi data tạo product ban đầu
  const rawVariants = productData.variants || [];
  delete productData.variants; // Xóa để không tạo variant rỗng hoặc sai logic trong bước đầu

  // 2. Tạo Product "cha" (chưa có variants)
  // Các đường dẫn ảnh (local path) đã có trong productData do middleware xử lý
  const newProduct = await productModel.create(productData);

  // 3. Tận dụng variantService để thêm từng variant
  if (rawVariants.length > 0) {
    try {
      for (const variantData of rawVariants) {
        // Gọi hàm addVariant của service con.
        await addVariant(newProduct._id, variantData);
      }
    } catch (error) {
      myLogger.error(
        `Error adding variants for product ${newProduct._id}: ${error.message}`
      );
      // Tùy chọn rollback nếu cần
      throw error;
    }
  }

  // 4. Trả về product đầy đủ thông tin (bao gồm variants vừa thêm)
  return findById(newProduct._id);
};

const update = async (id, updateData) => {
  // Cập nhật sản phẩm vào DB (bao gồm cả các path ảnh mới nếu có)
  const updatedProduct = await productModel.update(id, updateData);
  if (!updatedProduct) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }

  // Broadcast changes if price or status is updated
  if (updateData.price !== undefined || updateData.status !== undefined) {
    broadcastProductChange(id, {
      type: "PRODUCT_UPDATE",
      productId: id,
      price: updatedProduct.price,
      status: updatedProduct.status,
    });
  }

  return formatProduct(updatedProduct);
};

const remove = async (id) => {
  // Xóa trong DB
  const deletedProduct = await productModel.remove(id);

  if (!deletedProduct) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }

  // Broadcast product deletion
  broadcastProductChange(id, {
    type: "PRODUCT_DELETED",
    productId: id,
  });

  return { _id: deletedProduct._id, message: "Product deleted successfully" };
};

const addVariant = async (productId, variantData) => {
  // Kiểm tra xem SKU đã tồn tại trong sản phẩm này chưa
  const product = await productModel.findById(productId);
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }
  if (product.variants.some((v) => v.sku === variantData.sku)) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      `SKU '${variantData.sku}' already exists for this product.`
    );
  }

  // Lưu variant vào DB (ảnh local path đã có trong variantData)
  const updatedProduct = await productModel.addVariant(productId, variantData);

  return formatProduct(updatedProduct);
};

const updateVariant = async (productId, variantId, variantData) => {
  // Kiểm tra SKU unique (nếu SKU đang được cập nhật)
  if (variantData.sku) {
    const product = await productModel.findById(productId);
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }
    // Tìm xem có biến thể *khác* (ID khác) nhưng *cùng* SKU không
    if (
      product.variants.some(
        (v) => v.sku === variantData.sku && v._id.toString() !== variantId
      )
    ) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `SKU '${variantData.sku}' already exists for this product.`
      );
    }
  }

  const updatedProduct = await productModel.updateVariant(
    productId,
    variantId,
    variantData
  );
  if (!updatedProduct) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");
  }

  // Broadcast changes
  const updatedVariant = updatedProduct.variants.id(variantId);
  if (updatedVariant) {
    broadcastProductChange(productId, {
      type: "VARIANT_UPDATE",
      productId,
      variantId,
      priceAdjustment: updatedVariant.priceAdjustment,
      stock: updatedVariant.stock,
      status: updatedVariant.status,
    });
  }

  return formatProduct(updatedProduct);
};

const removeVariant = async (productId, variantId) => {
  const updatedProduct = await productModel.removeVariant(productId, variantId);
  if (!updatedProduct) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");
  }

  // Broadcast variant deletion
  broadcastProductChange(productId, {
    type: "VARIANT_DELETED",
    productId,
    variantId,
  });

  return formatProduct(updatedProduct);
};

export const productService = {
  find,
  findById,
  create,
  update,
  remove,
  addRating,
  listRatings,
  updateRating,
  removeRating,
  addVariant,
  updateVariant,
  removeVariant,
};
