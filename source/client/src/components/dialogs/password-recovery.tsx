"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomInputField } from "../ui";
import { toast } from "react-toastify";
import { Spinner } from "@/public/icons";
import { XIcon } from "lucide-react";
import { recoverPassword } from "@/api/user";

// Định nghĩa Schema Form cho Email
const EmailSchema = z.object({
  email: z.email("Email không hợp lệ").min(1, "Email không được để trống"),
});

type EmailFormData = z.infer<typeof EmailSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PasswordRecoveryDialog({ isOpen, onClose }: Props) {
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailFormData>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<EmailFormData> = async (data) => {
    setIsApiLoading(true);
    setApiError(null);

    try {
      const res = await recoverPassword(data.email);

      if (res.success) {
        toast.success(
          "Đã gửi link đặt lại mật khẩu thành công đến: " + data.email
        );
        reset();
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi không xác định khi gửi yêu cầu.";

      setApiError(errorMessage);
      toast.error("Gửi yêu cầu thất bại. " + errorMessage);
    } finally {
      setIsApiLoading(false);
    }
  };

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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  Khôi phục Mật khẩu
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition"
                    disabled={isApiLoading}
                  >
                    <XIcon size={20} aria-hidden="true" />
                  </button>
                </DialogTitle>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Nhập địa chỉ email bạn đã đăng ký. Chúng tôi sẽ gửi một liên
                    kết để bạn đặt lại mật khẩu.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-4 space-y-4"
                >
                  {/* API ERROR */}
                  {apiError && (
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm"
                      role="alert"
                    >
                      <span className="block sm:inline">{apiError}</span>
                    </div>
                  )}

                  <CustomInputField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="nguyenvana@gmail.com"
                    register={register}
                    errors={errors}
                    disabled={isApiLoading}
                  />

                  <button
                    type="submit"
                    disabled={isApiLoading}
                    className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out ${
                      isApiLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isApiLoading && (
                      <span className="animate-spin">
                        <Spinner />
                      </span>
                    )}{" "}
                    Gửi Link Khôi phục
                  </button>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
