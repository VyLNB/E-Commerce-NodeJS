"use client";

import { CustomInputField } from "@/components/ui";
import { useAppDispatch, useAppSelector, useImageFallback } from "@/lib/hooks";
import {
  CameraIcon,
  MinusIcon,
  PlusIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import Image from "next/image";
import React, { useState, Fragment, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import AvatarEditor from "react-avatar-editor";
import { dataURLtoFile } from "@/lib/utils";
import { uploadAvatar } from "@/api/user";
import { setAvatar } from "@/lib/features/user-slice";
import { toast } from "react-toastify";
import userFallbackImg from "@/public/images/user-placeholder.png";

export default function Profile() {
  const { fullName, avatar, email } = useAppSelector((state) => state.user);
  const { imgSrc, onError } = useImageFallback(avatar, "/user-placeholder.png");

  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | File>("");
  const [scale, setScale] = useState(1);
  const editorRef = useRef<AvatarEditor | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setImageSrc("");
    setScale(1);
    setIsOpen(true);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageSrc(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageSrc("");
    // Reset giá trị của input để có thể chọn lại cùng một file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (editorRef.current) {
      try {
        const dataUrl = editorRef.current
          .getImageScaledToCanvas()
          .toDataURL("image/png");

        const imageFile = dataURLtoFile(dataUrl, "avatar.png");

        const formData = new FormData();
        formData.append("image", imageFile);
        console.log(formData.get("image"));

        const result = await uploadAvatar(formData);

        dispatch(setAvatar({ avatar: result.data.avatar }));

        toast.success("Cập nhật ảnh đại diện thành công!");

        closeModal();
      } catch (error: any) {
        console.error("Error uploading avatar:", error);

        const errorMessage = error.message || "Đã xảy ra lỗi khi tải ảnh lên.";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <section>
      <div>
        <h1 className="text-3xl font-semibold border-b border-gray-200 pb-4">
          Thông tin tài khoản
        </h1>
        <div className="py-8">
          <div className="relative w-32 h-32 bg-gray-300 rounded-full mb-6">
            <Image
              src={imgSrc || userFallbackImg}
              alt="user-avatar"
              width={128}
              height={128}
              priority
              className="rounded-full object-cover"
              onError={onError}
            />
            <button
              type="button"
              onClick={openModal}
              className="absolute right-2 bottom-2 bg-white rounded-full p-2 text-gray-400 shadow-md hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <CameraIcon size={20} />
            </button>
          </div>
          <div className="space-y-6 w-3/4">
            <div className="flex gap-8 w-full">
              <CustomInputField
                label="Họ và tên"
                name="fullName"
                defaultValue={fullName || ""}
                className="w-full"
              />
              <CustomInputField
                label="Email"
                name="email"
                className="w-full"
                defaultValue={email || ""}
                disabled
              />
            </div>
            <CustomInputField
              label="Số điện thoại"
              name="phone"
              defaultValue={""}
            />
            <button className="px-4 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors">
              Cập nhật thông tin
            </button>
          </div>
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
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
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Chọn ảnh đại diện
                  </DialogTitle>

                  <div className="mt-4 flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      hidden
                    />

                    {!imageSrc ? (
                      <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center">
                        <UploadCloudIcon className=" text-gray-400" size={24} />
                        <p className="mt-2  text-gray-600">
                          Chưa có ảnh nào được chọn
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700 transition"
                        >
                          Tải ảnh lên
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <AvatarEditor
                          ref={editorRef}
                          image={imageSrc}
                          width={250}
                          height={250}
                          border={50}
                          borderRadius={125}
                          color={[0, 0, 0, 0.1]}
                          scale={scale}
                          rotate={0}
                        />
                        <div className="mt-4 w-full flex items-center gap-2 text-gray-700">
                          <MinusIcon size={20} />
                          <input
                            type="range"
                            min="1"
                            max="2"
                            step="0.01"
                            value={scale}
                            onChange={(e) =>
                              setScale(parseFloat(e.target.value))
                            }
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer custom-range-thumb"
                          />
                          <PlusIcon size={20} />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="mt-4 flex items-center gap-2  text-red-600 hover:text-red-800 transition cursor-pointer"
                        >
                          <Trash2Icon size={16} />
                          Xóa ảnh
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      className="cursor-pointer inline-flex justify-center rounded-md border border-transparent px-4 py-2  font-medium text-gray-900 hover:bg-gray-200 transition"
                      onClick={closeModal}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2  font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
                      onClick={handleUpload}
                      disabled={!imageSrc}
                    >
                      Lưu ảnh
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </section>
  );
}
