import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import CustomInputField from "../form/customInputField";

// --- 1. Định nghĩa Zod Schema ---
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const ChangePasswordCard = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      console.log("Dữ liệu mật khẩu hợp lệ:", data);
      // TODO: Gọi API đổi mật khẩu ở đây
      // await changePasswordApi(data);

      alert("Đổi mật khẩu thành công! (Demo)");
      reset(); // Reset form sau khi thành công
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      alert("Có lỗi xảy ra khi đổi mật khẩu.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Đổi mật khẩu</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          {/* Mật khẩu hiện tại */}
          <div>
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <CustomInputField
                  label="Mật khẩu hiện tại"
                  type="password"
                  name="currentPassword"
                  placeHolderText="Nhập mật khẩu hiện tại"
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div>
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <CustomInputField
                  label="Mật khẩu mới"
                  type="password"
                  name="newPassword"
                  placeHolderText="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Xác nhận mật khẩu */}
          <div>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <CustomInputField
                  label="Xác nhận mật khẩu"
                  type="password"
                  name="confirmPassword"
                  placeHolderText="Nhập lại mật khẩu mới"
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Button cập nhật */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full px-6 py-3 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
                ${
                  !isValid || isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
              {isSubmitting ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordCard;
