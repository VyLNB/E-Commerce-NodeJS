"use client";

import {
  addToCartServer,
  removeCartItemServer,
  updateCartItemServer,
} from "@/api/cart";
import {
  addItem,
  removeItem,
  setCart,
  updateQuantity,
} from "@/lib/features/cart-slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { CartItem, Product, Variant } from "@/lib/types";
import { getFlexibleImageUrl } from "@/lib/utils";
import { toast } from "react-toastify";

export const useCartActions = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, _id: userId } = useAppSelector(
    (state) => state.user
  );

  // Helper để lưu vào LocalStorage
  const syncToLocalStorage = (items: CartItem[]) => {
    localStorage.setItem("guest_cart", JSON.stringify(items));
  };

  // 1. Thêm vào giỏ hàng
  const addToCart = async (
    product: Product,
    variant: Variant,
    quantity: number
  ) => {
    if (isAuthenticated) {
      // LOGIC CHO USER: Gọi API
      try {
        const updatedCart = await addToCartServer({
          productId: product._id,
          variantId: variant._id,
          quantity,
        });
        dispatch(setCart(updatedCart));
        return true;
      } catch (error) {
        console.error(error);
        toast.error("Lỗi thêm vào giỏ hàng");
        return false;
      }
    } else {
      // LOGIC CHO GUEST: Lưu Redux + LocalStorage
      const price = product.price + (variant.priceAdjustment || 0);
      const newItem: CartItem = {
        id: variant._id, // Client dùng variantId làm ID chính
        productId: product._id,
        name: `${product.name} (${variant.variantName})`,
        description: product.description || "",
        code: variant.sku,
        price: price,
        quantity: quantity,
        imageUrl: getFlexibleImageUrl(
          variant.images?.[0] || product.images?.[0]
        ),
        imageAlt: product.name,
      };

      dispatch(addItem(newItem));
      // Lưu ý: Cần lấy state mới nhất để sync LS, nhưng ở đây ta làm đơn giản
      // Tốt nhất là dùng middleware hoặc useEffect để sync state -> LS
      return true;
    }
  };

  // 2. Cập nhật số lượng
  const updateCartItem = async (item: CartItem, quantity: number) => {
    if (isAuthenticated) {
      try {
        const updatedCart = await updateCartItemServer({
          productId: item.productId,
          variantId: item.id,
          quantity,
        });
        dispatch(setCart(updatedCart));
      } catch (error) {
        toast.error("Lỗi cập nhật giỏ hàng");
      }
    } else {
      dispatch(updateQuantity({ id: item.id, quantity }));
    }
  };

  // 3. Xóa sản phẩm
  const removeCartItem = async (item: CartItem) => {
    if (isAuthenticated) {
      try {
        const updatedCart = await removeCartItemServer({
          productId: item.productId,
          variantId: item.id,
        });
        dispatch(setCart(updatedCart));
      } catch (error) {
        toast.error("Lỗi xóa sản phẩm");
      }
    } else {
      dispatch(removeItem(item));
    }
  };

  return { addToCart, updateCartItem, removeCartItem };
};
