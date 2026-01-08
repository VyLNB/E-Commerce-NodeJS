import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { myLogger } from "~/loggers/mylogger.log";

export const transformProductData = (req, res, next) => {
  try {
    // 1. Parse JSON từ field 'data' (nếu có), mặc định là object rỗng
    let productData = {};
    if (req.body.data) {
      try {
        productData = JSON.parse(req.body.data);
      } catch (e) {
        myLogger.error(e.message);
        return next(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "Invalid JSON format in 'data' field."
          )
        );
      }
    }

    const files = req.files || [];

    // 2. Xử lý ảnh chính (Main Images)
    // 2.1 Lấy ảnh mới upload (newImages)
    const mainNewFiles = files.filter((f) => f.fieldname === "newImages");
    const mainNewPaths = mainNewFiles.map((f) => f.path.replace(/\\/g, "/"));

    // 2.2 Lấy ảnh cũ (existingImages) từ FormData - Đặc thù của Update
    let mainExistingImages = [];
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        mainExistingImages = req.body.existingImages;
      } else {
        mainExistingImages = [req.body.existingImages];
      }
    }

    // 2.3 Lấy ảnh từ trong JSON 'data' (nếu có) - Đặc thù của Create hoặc nếu FE gửi trong JSON
    const imagesInJson = Array.isArray(productData.images)
      ? productData.images
      : [];

    // 2.4 Gộp tất cả lại thành mảng duy nhất
    productData.images = [
      ...mainExistingImages,
      ...imagesInJson,
      ...mainNewPaths,
    ];

    // 3. Xử lý ảnh Variants (variant_images_[index])
    if (productData.variants && Array.isArray(productData.variants)) {
      productData.variants = productData.variants.map((variant, index) => {
        // Tìm file ảnh mới cho variant này theo index
        const variantFiles = files.filter(
          (f) => f.fieldname === `variant_images_${index}`
        );
        const variantNewPaths = variantFiles.map((f) =>
          f.path.replace(/\\/g, "/")
        );

        // Ảnh cũ đã có sẵn trong variant object (từ JSON)
        const currentImages = Array.isArray(variant.images)
          ? variant.images
          : [];

        return {
          ...variant,
          images: [...currentImages, ...variantNewPaths],
        };
      });
    }

    // 4. Gán lại data đã xử lý vào req.body
    req.body = productData;

    next();
  } catch (error) {
    next(error);
  }
};
