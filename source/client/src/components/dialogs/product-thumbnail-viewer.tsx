"use client";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { Fragment, useState, useEffect } from "react";

type Props = {
  images: string[];
  startIndex?: number; // Index của ảnh để hiển thị đầu tiên
  isOpen: boolean;
  onClose: () => void;
};

export default function ProductThumbnailViewer({
  isOpen,
  onClose,
  images = [],
  startIndex = 0,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // Cập nhật index hiện tại nếu startIndex thay đổi (ví dụ: người dùng nhấp vào một ảnh khác)
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
    }
  }, [isOpen, startIndex]);

  if (!images || images.length === 0) {
    return null;
  }

  // Hàm chuyển ảnh tiếp theo (có quay vòng)
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  // Hàm chuyển ảnh trước đó (có quay vòng)
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </TransitionChild>

        {/* Container toàn màn hình */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full w-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Panel hiển thị (chiếm 90% viewport) */}
              <DialogPanel className="relative flex h-[90vh] w-[90vw] transform items-center justify-center overflow-hidden rounded-xl bg-transparent text-left align-middle transition-all">
                {/* Nút Đóng (Góc trên bên phải) */}
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-full p-2 text-gray-300 hover:bg-white/20 transition absolute top-2 right-2 z-20"
                >
                  <XIcon size={32} aria-hidden="true" />
                </button>

                {/* Ảnh chính */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    width={1200}
                    height={1200}
                    src={images[currentIndex]}
                    className="m-auto object-contain max-h-full max-w-full"
                    alt={`thumbnail-zoom-${currentIndex + 1}`}
                    priority
                  />
                </div>

                {/* Nút Lùi (Prev) */}
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full p-3 text-gray-300 hover:bg-white/20 transition z-10"
                  >
                    <ChevronLeftIcon size={32} />
                  </button>
                )}

                {/* Nút Tới (Next) */}
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full p-3 text-gray-300 hover:bg-white/20 transition z-10"
                  >
                    <ChevronRightIcon size={32} />
                  </button>
                )}

                {/* Bộ đếm ảnh */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1 text-white text-sm">
                    {currentIndex + 1} / {images.length}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
