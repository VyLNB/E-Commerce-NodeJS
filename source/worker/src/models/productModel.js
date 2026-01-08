import mongoose from "mongoose";
import { productSchema } from "./schemas.js";
import { myLogger } from "../loggers/myLogger.js";

const Product = mongoose.model("Product", productSchema);

const findById = (id) => Product.findById(id);

/**
 * Tìm và thay thế một đường dẫn ảnh local bằng public URL
 * Nó sẽ tìm cả trong mảng images gốc và mảng images của các variants
 */
const updateImagePath = async (productId, localPath, publicUrl) => {
  if (!productId || !localPath || !publicUrl) {
    myLogger.warn("updateImagePath: Missing required arguments.");
    return;
  }

  try {
    // Thử cập nhật mảng 'images' gốc của sản phẩm
    const updateRootImages = await Product.updateOne(
      { _id: productId, images: localPath },
      { $set: { "images.$": publicUrl } }
    );

    if (updateRootImages.modifiedCount > 0) {
      myLogger.info(
        `Updated root image for ${productId}: ${localPath} -> ${publicUrl}`
      );
      return; // Đã tìm thấy và cập nhật, không cần tìm trong variant
    }

    // Nếu không thành công, thử cập nhật mảng 'images' trong 'variants'
    // Cập nhật tất cả các phần tử mảng images trong variants khớp với localPath
    const updateVariantImages = await Product.updateOne(
      { _id: productId, "variants.images": localPath },
      { $set: { "variants.$[].images.$[elem]": publicUrl } },
      { arrayFilters: [{ elem: localPath }] }
    );

    if (updateVariantImages.modifiedCount > 0) {
      myLogger.info(
        `Updated variant image for ${productId}: ${localPath} -> ${publicUrl}`
      );
    } else {
      myLogger.warn(
        `Could not find localPath ${localPath} to update for product ${productId}`
      );
    }
  } catch (error) {
    myLogger.error(
      `Error updating image path for product ${productId}: ${error.message}`,
      { stack: error.stack }
    );
  }
};

export const productModel = {
  Product,
  findById,
  updateImagePath,
};
