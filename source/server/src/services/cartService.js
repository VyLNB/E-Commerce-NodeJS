import { cartModel } from "~/models/cartModel";
import { productModel } from "~/models/productModel";
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";

/**
 * Lấy thông tin giỏ hàng của user
 * Trả về danh sách items với đầy đủ thông tin product và variant
 */
const getCart = async (userId) => {
  const cart = await cartModel.getCartDetails(userId);
  if (!cart) return { items: [] };

  const formattedItems = cart.items
    .map((item) => {
      const product = item.productId;
      // Nếu product bị null (đã bị xóa) thì bỏ qua
      if (!product) return null;

      // Tìm variant tương ứng trong product
      // Lưu ý: variantId trong item là ObjectId, cần so sánh chuỗi
      const variant = product.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );

      // Nếu variant không tìm thấy (đã bị xóa) thì bỏ qua
      if (!variant) return null;

      return {
        product: {
          _id: product._id,
          images: product.images,
          name: product.name,
          status: product.status,
          price: product.price,
        },
        variant: {
          _id: variant._id,
          variantName: variant.variantName,
          stock: variant.stock,
          images: variant.images,
          status: variant.status,
          priceAdjustment: variant.priceAdjustment,
        },
        quantity: item.quantity,
        _id: item._id,
      };
    })
    .filter((item) => item !== null);

  return { items: formattedItems };
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
const addToCart = async (userId, { productId, variantId, quantity }) => {
  // Kiểm tra sản phẩm và biến thể có tồn tại không
  const product = await productModel.findById(productId);
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");

  const variant = product.variants.find(
    (v) => v._id.toString() === variantId.toString()
  );
  if (!variant) throw new ApiError(StatusCodes.NOT_FOUND, "Variant not found");

  // Kiểm tra tồn kho (optional, nhưng nên có)
  if (variant.stock < quantity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Not enough stock");
  }

  return await cartModel.addItem(userId, { productId, variantId, quantity });
};

/**
 * Cập nhật số lượng item
 */
const updateCartItem = async (userId, { productId, variantId, quantity }) => {
  if (quantity <= 0) {
    return await cartModel.removeItem(userId, productId, variantId);
  }
  return await cartModel.updateItemQuantity(
    userId,
    productId,
    variantId,
    quantity
  );
};

/**
 * Xóa item khỏi giỏ hàng
 */
const removeCartItem = (userId, { productId, variantId }) =>
  cartModel.removeItem(userId, productId, variantId);

export const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
