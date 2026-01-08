"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CustomInputField } from "../ui";
import { resetPassword } from "@/api/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Regex cho độ mạnh mật khẩu
const passwordStrengthRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

// Định nghĩa Schema Form
const ResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Mật khẩu mới không được để trống")
      .regex(
        passwordStrengthRegex,
        "Mật khẩu phải có: 8+ ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt (@$!%*?&#...)"
      ),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp với Mật khẩu mới",
    path: ["confirmPassword"],
  });

// Định nghĩa Type từ Zod Schema
type ResetPasswordFormSchema = z.infer<typeof ResetPasswordSchema>;

// --- 2. Component ResetPasswordForm ---

type Props = {
  resetToken: string | null;
};

export default function ResetPasswordForm({ resetToken }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormSchema>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (data: ResetPasswordFormSchema) => {
    try {
      const result = await resetPassword(resetToken, data.newPassword);
      console.log("API Result:", result);
      toast.success("Đặt lại mật khẩu thành công");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (error) {
      console.error("Lỗi khi đặt lại mật khẩu:", error);
      setError("root.serverError", {
        type: "400",
        message:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không xác định.",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm p-4 sm:p-6 md:max-w-md">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Đặt Lại Mật Khẩu
        </h2>

        {/* Hiển thị lỗi chung từ API nếu có */}
        {errors.root?.serverError && (
          <p className="mb-4 rounded-md border border-red-400 bg-red-100 p-3 text-sm font-semibold text-red-700">
            {errors.root.serverError.message}
          </p>
        )}

        {/* Thông tin hướng dẫn viết mật khẩu */}
        <div className="mb-6 rounded-md border-l-4 border-blue-500 bg-blue-50 p-3 text-sm text-gray-600">
          <p className="font-semibold text-blue-700 mb-1">Quy tắc Mật khẩu:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Tối thiểu 8 ký tự.</li>
            <li>Ít nhất 1 chữ hoa (A-Z).</li>
            <li>Ít nhất 1 chữ thường (a-z).</li>
            <li>Ít nhất 1 số (0-9).</li>
            <li>Ít nhất 1 ký tự đặc biệt (@$!%*?&...).</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <CustomInputField
            label="Mật khẩu Mới"
            name="newPassword"
            type="password"
            placeholder="Mật khẩu mạnh (ví dụ: MatKhau123@)"
            register={register}
            errors={errors}
            disabled={isSubmitting}
            helperText="Mật khẩu phải chứa 8+ ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt."
          />

          <CustomInputField
            label="Xác nhận Mật khẩu"
            name="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full cursor-pointer flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Đang đặt lại..." : "Đặt Lại Mật Khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
