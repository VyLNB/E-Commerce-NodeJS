import mongoose from "mongoose";
import { carts } from "./schemas.js";

const Cart = mongoose.model("Cart", carts);

/**
 * Tìm giỏ hàng theo userId
 */
const findByUserId = (userId) => Cart.findOne({ userId });

/**
 * Lấy chi tiết giỏ hàng (populate thông tin sản phẩm)
 */
const getCartDetails = (userId) =>
  Cart.findOne({ userId }).populate("items.productId");

/**
 * Tạo giỏ hàng mới
 */
const create = async (data) => {
  const cart = new Cart(data);
  return await cart.save();
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * Nếu đã tồn tại thì tăng số lượng
 */
const addItem = async (userId, item) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return await create({ userId, items: [item] });
  }

  const existingItemIndex = cart.items.findIndex(
    (i) =>
      i.productId.toString() === item.productId &&
      i.variantId.toString() === item.variantId
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += item.quantity;
  } else {
    cart.items.push(item);
  }
  return await cart.save();
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
const updateItemQuantity = (userId, productId, variantId, quantity) =>
  Cart.findOneAndUpdate(
    { userId, "items.productId": productId, "items.variantId": variantId },
    { $set: { "items.$.quantity": quantity } },
    { new: true }
  );

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
const removeItem = (userId, productId, variantId) =>
  Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId, variantId } } },
    { new: true }
  );

/**
 * Xóa toàn bộ giỏ hàng
 */
const clearCart = (userId) => Cart.findOneAndDelete({ userId });

export const cartModel = {
  findByUserId,
  getCartDetails,
  create,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
};
