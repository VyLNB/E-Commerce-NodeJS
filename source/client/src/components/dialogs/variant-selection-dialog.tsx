"use client";

import { addToCartServer } from "@/api/cart";
import { useCartActions } from "@/hooks/use-cart-action";
import { setCart } from "@/lib/features/cart-slice";
import { useAppDispatch } from "@/lib/hooks";
import { Product, Variant } from "@/lib/types";
import { formatCurrency, getFlexibleImageUrl } from "@/lib/utils";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import clsx from "clsx";
import { Minus, Plus, XIcon } from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function VariantSelectionDialog({
  product,
  isOpen,
  onClose,
}: Props) {
  const dispatch = useAppDispatch();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartActions();

  // Reset state khi mở dialog cho một sản phẩm mới
  useEffect(() => {
    if (product) {
      // Tự động chọn variant đầu tiên (nếu có)
      const defaultVariant = product.variants?.[0] || null;
      setSelectedVariant(defaultVariant);
      setQuantity(1);

      // Cập nhật ảnh dựa trên variant (hoặc ảnh chính của sản phẩm)
      const initialImage = defaultVariant?.images?.[0] || product.images?.[0];
      setSelectedImage(getFlexibleImageUrl(initialImage));
    }
  }, [product]);

  // Cập nhật ảnh chính khi chọn variant
  useEffect(() => {
    if (
      selectedVariant &&
      selectedVariant.images &&
      selectedVariant.images.length > 0
    ) {
      setSelectedImage(getFlexibleImageUrl(selectedVariant.images[0]));
    } else if (product?.images?.[0]) {
      // Quay về ảnh đầu tiên của sản phẩm nếu variant không có ảnh
      setSelectedImage(getFlexibleImageUrl(product.images[0]));
    }
  }, [selectedVariant, product]);

  // Tính toán giá hiển thị dựa trên variant
  const displayPrice = useMemo(() => {
    if (product) {
      if (selectedVariant) {
        return product.price + selectedVariant.priceAdjustment;
      }
      return product.price; // Giá cơ sở
    }
    return 0;
  }, [product, selectedVariant]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;

    const success = await addToCart(product, selectedVariant, quantity);

    if (success) {
      toast.success(
        `${product.name} (${selectedVariant.variantName}) đã được thêm vào giỏ hàng!`
      );
      handleClose();
    }
  };

  // Hàm để đóng dialog và reset state
  const handleClose = () => {
    onClose();
    // Thêm một chút delay để transition đóng mượt hơn
    setTimeout(() => {
      setSelectedVariant(null);
      setQuantity(1);
      setSelectedImage("");
    }, 300); // 300ms
  };

  if (!product) return null; // Không render gì nếu không có sản phẩm

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Lớp nền mờ */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        {/* Nội dung Dialog */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  Chọn phiên bản sản phẩm
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-md p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition"
                  >
                    <XIcon size={20} aria-hidden="true" />
                  </button>
                </DialogTitle>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cột ảnh */}
                  <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg">
                    <Image
                      src={selectedImage || "/images/placeholder.png"} // Cần có ảnh placeholder
                      alt={product.name}
                      width={250}
                      height={250}
                      className="object-contain"
                    />
                  </div>

                  {/* Cột thông tin và lựa chọn */}
                  <div className="flex flex-col space-y-4">
                    <h4 className="text-xl font-semibold text-gray-800">
                      {product.name}
                    </h4>

                    {/* Giá */}
                    <div className="mt-2">
                      <p className="text-3xl font-medium text-red-500 ">
                        {formatCurrency(displayPrice)}
                      </p>
                    </div>

                    {/* Lựa chọn Variants */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-md font-medium text-gray-900 mb-2">
                          Lựa chọn:
                          <span className="text-gray-600 ml-2">
                            {selectedVariant?.variantName}
                          </span>
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {product.variants.map((variant) => (
                            <button
                              key={variant._id}
                              onClick={() => setSelectedVariant(variant)}
                              disabled={variant.stock === 0}
                              className={clsx(
                                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-200",
                                {
                                  "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500":
                                    selectedVariant?._id === variant._id,
                                  "border-gray-300 bg-white text-gray-700 hover:bg-gray-50":
                                    selectedVariant?._id !== variant._id,
                                  "opacity-50 cursor-not-allowed line-through":
                                    variant.stock === 0,
                                }
                              )}
                            >
                              {variant.variantName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chọn số lượng */}
                    <div className="col-span-1 flex items-center justify-between rounded border border-gray-200 px-2 w-32">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-600 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="w-full text-gray-700 border-transparent text-center h-10 py-2 ">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-600 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    {/* Nút Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedVariant || selectedVariant.stock === 0}
                      className="cursor-pointer w-full rounded-lg bg-gray-900 px-8 py-3 font-medium text-white hover:bg-gray-800 transition
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {!selectedVariant
                        ? "Vui lòng chọn phiên bản"
                        : selectedVariant.stock === 0
                        ? "Hết hàng"
                        : "Thêm vào giỏ"}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
