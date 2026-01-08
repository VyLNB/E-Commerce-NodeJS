"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { Trash2Icon, XIcon } from "lucide-react";
import { CartItem } from "@/lib/types";
import Image from "next/image";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItem | null;
  onConfirm: () => void;
};

export default function RemoveCartItemDialog({
  isOpen,
  onClose,
  cartItem,
  onConfirm,
}: Props) {
  if (!cartItem) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <DialogPanel className="w-full max-w-sm transform rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 flex items-center gap-2"
                  >
                    <Trash2Icon className="text-red-500" size={20} />
                    Xác nhận Xóa
                  </DialogTitle>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition"
                  >
                    <XIcon size={20} aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-gray-700">
                    Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-4">
                    <Image
                      src={cartItem.imageUrl}
                      alt={cartItem.imageAlt}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {cartItem.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate-2">
                        {cartItem.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="cursor-pointer inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 transition"
                  >
                    Xóa
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
