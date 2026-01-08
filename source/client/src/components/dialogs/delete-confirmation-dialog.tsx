// src/components/dialogs/delete-confirmation-dialog.tsx

"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { Spinner } from "@/public/icons";
import { Trash2Icon, XIcon } from "lucide-react";
import { deleteAddress } from "@/api/address";
import { Address } from "@/lib/types";
import { getFullAddress } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  addressToDelete: Address | null;
  onDeleteSuccess: (remainingAddresses: Address[]) => void;
};

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  userId,
  addressToDelete,
  onDeleteSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!addressToDelete || !userId) return;

    setIsDeleting(true);

    try {
      const response = await deleteAddress(userId, addressToDelete._id);
      if (response.success) {
        toast.success(response.message || "Đã xóa địa chỉ thành công.");
        onDeleteSuccess(response.data);
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
      toast.error("Xóa thất bại: " + errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* ... (Backdrop) */}
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
                    disabled={isDeleting}
                  >
                    <XIcon size={20} aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-gray-700">
                    Bạn có chắc chắn muốn xóa địa chỉ này? Thao tác này không
                    thể hoàn tác.
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="font-semibold block text-gray-700">
                      {addressToDelete?.recipientName}
                    </span>
                    <span className="text-gray-600">
                      {getFullAddress({
                        street: addressToDelete?.street || "",
                        ward: addressToDelete?.ward || "",
                        district: addressToDelete?.district || "",
                        city: addressToDelete?.city || "",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 transition"
                    disabled={isDeleting}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`cursor-pointer inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 transition ${
                      isDeleting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isDeleting ? (
                      <span className="flex items-center gap-2">
                        <Spinner /> Đang xóa...
                      </span>
                    ) : (
                      "Xóa vĩnh viễn"
                    )}
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
