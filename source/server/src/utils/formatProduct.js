const { getVietnamDatetimeString } = require("./datetime");

const formatProduct = (product) => {
  if (!product) return null;
  const productObj = product.toObject ? product.toObject() : { ...product };
  // Handle lỗi Map - object trong mongo
  if (product.specifications && product.specifications instanceof Map) {
    productObj.specifications = Object.fromEntries(product.specifications);
  }

  if (product.attributes && product.attributes instanceof Map) {
    productObj.attributes = Object.fromEntries(product.attributes);
  }

  if (productObj.variants && productObj.variants.length > 0) {
    // Handle lỗi Map - object trong mongo
    productObj.variants = productObj.variants.map((variant) => {
      // Chuyển đổi attributes (Map) sang Object
      if (variant.attributes && variant.attributes instanceof Map) {
        variant.attributes = Object.fromEntries(variant.attributes);
      }
      // Chuyển đổi specifications (Map) sang Object
      if (variant.specifications && variant.specifications instanceof Map) {
        variant.specifications = Object.fromEntries(variant.specifications);
      }
      return variant;
    });
    // Tính tổng tồn kho từ các biến thể
    productObj.totalStock = productObj.variants.reduce(
      (acc, variant) => acc + (variant.stock || 0),
      0
    );

    // Tìm giá thấp nhất (Giá cơ sở + Giá điều chỉnh)
    const minPriceAdjustment = Math.min(
      ...productObj.variants.map((v) => v.priceAdjustment)
    );
    const calculatedPrice = (productObj.price || 0) + minPriceAdjustment;
    productObj.displayPrice = Math.max(0, calculatedPrice);
  } else {
    // Nếu không có biến thể, dùng giá cơ sở và (nếu có) stock cơ sở
    productObj.displayPrice = productObj.price;
    // productObj.totalStock = productObj.stock || 0; // (stock cơ sở đã bị xóa)
    productObj.totalStock = 0;
  }

  // Đổi tên field categoryId -> category nếu đã được populate
  if (productObj.categoryId && typeof productObj.categoryId === "object") {
    productObj.category = productObj.categoryId;
    delete productObj.categoryId;
  }

  // Đổi tên field brandId -> brand nếu đã được populate
  if (productObj.brandId && typeof productObj.brandId === "object") {
    productObj.brand = productObj.brandId;
    delete productObj.brandId;
  }

  productObj.createdAt = getVietnamDatetimeString(productObj.createdAt);
  productObj.updatedAt = getVietnamDatetimeString(productObj.updatedAt);
  return productObj;
};

export default formatProduct;
