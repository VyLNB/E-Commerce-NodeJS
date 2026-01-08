"use client";

import { removeCartItemServer, updateCartItemServer } from "@/api/cart";
import {
  DiscountValidationResponse,
  validateDiscountCode,
} from "@/api/discount";
import { RemoveCartItemDialog } from "@/components/dialogs";
import { useCartActions } from "@/hooks/use-cart-action";
import { setCart } from "@/lib/features/cart-slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { CartItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";

const ESTIMATED_TAX = 50000;
const ESTIMATED_SHIPPING = 29000;

export default function ShoppingCartPage() {
  const { items } = useAppSelector((state) => state.cart);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const dispatch = useAppDispatch();
  const { updateCartItem, removeCartItem } = useCartActions();

  // DISCOUNT STATE
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] =
    useState<DiscountValidationResponse | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const handleQuantityChange = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      await updateCartItem(item, newQuantity);
    }
  };

  const handleOpenRemoveModal = (item: CartItem) => {
    setItemToRemove(item);
    setIsRemoveModalOpen(true);
  };

  const handleCloseRemoveModal = () => {
    setItemToRemove(null);
    setIsRemoveModalOpen(false);
  };

  const handleConfirmRemove = async () => {
    if (itemToRemove) {
      await removeCartItem(itemToRemove);
      toast.success(`"${itemToRemove.name}" đã được xóa khỏi giỏ hàng.`);
      handleCloseRemoveModal();
    }
  };

  // 1. Subtotal Before Discount
  const subtotalBeforeDiscount = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  // 2. Discount Amount Calculation
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;

    if (appliedDiscount.type === "fixed_amount") {
      return Math.min(appliedDiscount.discountValue, subtotalBeforeDiscount); // Cap at subtotal
    }
    if (appliedDiscount.type === "percentage") {
      // Server-side code will actually handle max discount value logic,
      // but we calculate the client display based on percentage here.
      const discount =
        subtotalBeforeDiscount * (appliedDiscount.discountValue / 100);
      return Math.min(discount, subtotalBeforeDiscount);
    }
    return 0;
  }, [appliedDiscount, subtotalBeforeDiscount]);

  // 3. Totals
  const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;
  const total = subtotalAfterDiscount + ESTIMATED_TAX + ESTIMATED_SHIPPING;

  const handleApplyDiscount = useCallback(async () => {
    setDiscountError(null);
    setAppliedDiscount(null);
    if (!promoCode.trim()) {
      setDiscountError("Vui lòng nhập mã giảm giá.");
      return;
    }

    try {
      const discount = await validateDiscountCode(promoCode.trim());
      setAppliedDiscount(discount);
      toast.success(`Áp dụng mã giảm giá ${discount.code} thành công!`);
    } catch (error: any) {
      const message =
        error.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.";
      setDiscountError(message);
      toast.error(message);
    }
  }, [promoCode]);

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12 lg:px-32">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 relative">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4 pr-2 h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col sm:flex-row gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200"
                >
                  {/* 1. PRODUCT IMAGE */}
                  <div className="flex-shrink-0">
                    <Link
                      href={`/products/${item.productId}?variant=${item.id}`}
                    >
                      <div className="relative h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 96px, 128px"
                        />
                      </div>
                    </Link>
                  </div>

                  {/* 2. CONTENT CONTAINER */}
                  <div className="flex flex-1 flex-col justify-between">
                    {/* Top Section: Info & Delete */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <Link
                          href={`/products/${item.productId}?variant=${item.id}`}
                        >
                          <h2 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                            {item.name}
                          </h2>
                        </Link>

                        {/* Description / Variant Info */}
                        <div className="flex flex-wrap gap-2  text-gray-500">
                          <span className="bg-gray-50 px-2 line-clamp-2 py-1 rounded-md border border-gray-100">
                            {item.description}
                          </span>
                          {item.code && (
                            <span className="px-2 py-1  text-gray-400 font-mono flex items-center">
                              SKU: {item.code}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Remove Button (Desktop Position) */}
                      <button
                        onClick={() => handleOpenRemoveModal(item)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 -mr-2 -mt-2 sm:mr-0 sm:mt-0"
                        title="Xóa sản phẩm"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Bottom Section: Quantity & Price */}
                    <div className="flex flex-wrap items-end justify-between gap-4 mt-4 sm:mt-0">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all shadow-sm disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="text"
                          readOnly
                          value={item.quantity}
                          className="w-10 text-center bg-transparent  font-semibold text-gray-900 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all shadow-sm"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price Info */}
                      <div className="text-right">
                        <p className=" text-gray-400 mb-0.5">Thành tiền</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600">
                          {formatCurrency(item.price * item.quantity).replace(
                            /\s/g,
                            ""
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium mb-4">
                  Giỏ hàng của bạn đang trống
                </p>
                <Link
                  href="/products"
                  className="px-6 py-2.5 bg-gray-900 text-white  font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            )}
          </div>
          {/* CHECK OUT SUMMARY */}
          <div className="space-y-4">
            {/* Discount Code Input */}
            <div>
              <label
                htmlFor="promoCode"
                className="block  mb-1 font-medium text-gray-700"
              >
                Mã giảm giá
              </label>
              <div className="w-full flex items-center rounded-lg border focus-within:ring-2 border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500/50 transition duration-150">
                <input
                  type="text"
                  id="promoCode"
                  placeholder="Nhập mã giảm giá tại đây"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setDiscountError(null);
                  }}
                  className="p-3 w-full focus:outline-none rounded-l-lg text-gray-700"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={!promoCode.trim()}
                  className="cursor-pointer border-l border-gray-300 py-3 h-full inline-flex items-center rounded-r-md  bg-gray-50 px-4  font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
              {discountError && (
                <p className="mt-2  text-red-600">{discountError}</p>
              )}
              {appliedDiscount && (
                <p className="mt-2  text-green-600">
                  Mã [{appliedDiscount.code}] đã được áp dụng thành công.
                </p>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 space-y-4 text-gray-700">
              <div className="flex justify-between">
                <p>Tạm tính (Trước khi giảm)</p>
                <p className="font-semibold">
                  {formatCurrency(subtotalBeforeDiscount).replace(/\s/g, "")}
                </p>
              </div>

              {/* Discount Line */}
              {appliedDiscount && (
                <div className="flex justify-between text-green-600">
                  <p>
                    Discount (
                    {appliedDiscount.type === "percentage"
                      ? `${appliedDiscount.discountValue}%`
                      : appliedDiscount.code}
                    )
                  </p>
                  <p className="font-semibold">
                    - {formatCurrency(discountAmount).replace(/\s/g, "")}
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <p>Tạm tính (Sau khi giảm)</p>
                <p className="font-semibold">
                  {formatCurrency(subtotalAfterDiscount).replace(/\s/g, "")}
                </p>
              </div>
              <div className="flex justify-between">
                <p>Ước tính thuế</p>
                <p className="font-semibold">
                  {formatCurrency(ESTIMATED_TAX).replace(/\s/g, "")}
                </p>
              </div>
              <div className="flex justify-between">
                <p>Phí vận chuyển</p>
                <p className="font-semibold">
                  {formatCurrency(ESTIMATED_SHIPPING).replace(/\s/g, "")}
                </p>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <p>Thành tiền</p>
                <p>{formatCurrency(total).replace(/\s/g, "")}</p>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href={{
                  pathname: "/checkout",
                  query: { discountCode: appliedDiscount?.code || "" },
                }}
                className="w-full block text-center bg-gray-900 text-white font-semibold cursor-pointer py-3 rounded-lg hover:bg-gray-800 transition duration-300"
              >
                Thanh toán
              </Link>
            </div>
          </div>
        </div>
      </div>
      <RemoveCartItemDialog
        isOpen={isRemoveModalOpen}
        onClose={handleCloseRemoveModal}
        onConfirm={handleConfirmRemove}
        cartItem={itemToRemove}
      />
    </div>
  );
}
