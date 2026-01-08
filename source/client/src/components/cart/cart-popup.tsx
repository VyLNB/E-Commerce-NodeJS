"use client";

import { removeCartItemServer } from "@/api/cart";
import { setCart } from "@/lib/features/cart-slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { CartItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { RemoveCartItemDialog } from "../dialogs";
import { useCartActions } from "@/hooks/use-cart-action";

export default function CartPopup() {
  const { items } = useAppSelector((state) => state.cart);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const dispatch = useAppDispatch();
  const { removeCartItem } = useCartActions();

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

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

  return (
    <>
      <Popover as="div" className="relative">
        <PopoverButton className="flex items-center space-x-2 hover:text-red-500 transition outline-none">
          <ShoppingCart size={24} />
          <span className="hidden sm:block">Giỏ hàng</span>
        </PopoverButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            transition
            className="ring-1 ring-gray-300 rounded-xl absolute top-full right-0 z-10 mt-3 w-screen max-w-sm px-4 sm:px-0 lg:max-w-lg"
          >
            {({ close }) => (
              <div className="overflow-hidden rounded-xl shadow-lg">
                <div className="relative bg-white p-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Giỏ hàng
                  </h3>
                  <div className="mt-6 flow-root max-h-72 overflow-y-auto pr-3 -mr-3">
                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                      {items.length > 0 ? (
                        <ul
                          role="list"
                          className="-my-6 divide-y divide-gray-200"
                        >
                          {items.map((product) => (
                            <li key={product.id} className="flex py-6">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <Image
                                  src={product.imageUrl}
                                  alt={product.imageAlt}
                                  width={96}
                                  height={96}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>
                                      <Link
                                        href={`/products/${product.productId}?variant=${product.id}`}
                                      >
                                        {product.name}
                                      </Link>
                                    </h3>
                                    <p className="ml-4">
                                      {formatCurrency(product.price)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-1 items-end justify-between">
                                  <p className="text-gray-500">
                                    Số lượng: {product.quantity}
                                  </p>

                                  <div className="flex">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenRemoveModal(product)
                                      }
                                      className="cursor-pointer text-red-600 hover:text-red-500"
                                    >
                                      Xóa sản phẩm
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            Giỏ hàng của bạn đang trống.
                          </p>
                        </div>
                      )}
                    </ul>
                  </div>
                  <div className="border-t border-gray-200 px-4 pt-6 sm:px-4 mt-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Tạm tính</p>
                      <p>{formatCurrency(subtotal)}</p>
                    </div>
                    <p className="text-sm mt-0.5 text-gray-500">
                      Phí ship và thuế sẽ được tính tại bước thanh toán
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/cart"
                        onClick={() => close()}
                        className="flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800"
                      >
                        Thanh toán
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
      <RemoveCartItemDialog
        isOpen={isRemoveModalOpen}
        onClose={handleCloseRemoveModal}
        onConfirm={handleConfirmRemove}
        cartItem={itemToRemove}
      />
    </>
  );
}
