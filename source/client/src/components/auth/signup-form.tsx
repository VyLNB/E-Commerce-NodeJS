"use client";

import { signup } from "@/api/auth";
import { setCredentials } from "@/lib/features/user-slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Spinner } from "@/public/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import {
  CustomInputField,
  DistrictSelector,
  ProvinceSelector,
  WardSelector,
} from "../ui";
import SocialAuth from "./social-auth";

type Props = {};

const SignupSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Họ tên phải có ít nhất 3 ký tự" })
    .max(100, { message: "Họ tên không được quá 100 ký tự" }),
  email: z
    .email("Email không hợp lệ")
    .min(1, { message: "Email không được để trống" }),
  province: z.string().min(1, { message: "Email không được để trống" }),
  district: z.string().min(1, { message: "Email không được để trống" }),
  ward: z.string().min(1, { message: "Email không được để trống" }),
  street: z.string().min(10, { message: "Vui lòng nhập địa chỉ đầy đủ" }),
});

type SignupFormData = z.infer<typeof SignupSchema>;

export default function SignupForm({}: Props) {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { isAuthenticated } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "phường Tân Thuận Đông",
      street: "",
    },
  });

  const onSubmit: SubmitHandler<SignupFormData> = useCallback(
    async (data) => {
      setLoading(true);
      setApiError(null);

      try {
        const result = await signup({
          fullName: data.fullName,
          email: data.email,
          address: {
            city: data.province,
            district: data.district,
            ward: data.ward,
            street: data.street,
          },
        });

        if (result.error && result.message) {
          setApiError(result.message);
        } else {
          dispatch(
            setCredentials({
              _id: result.data._id,
              email: result.data.email,
              fullName: result.data.fullName,
              avatar: result.data.avatar,
              loyaltyPoints: result.data.loyaltyPoints,
              accessToken: result.data.accessToken,
            })
          );
          toast.success(
            "Vui lòng kiểm tra email để đổi mật khẩu. Thời gian hiệu lực trong 5 phút"
          );
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      } catch (err: any) {
        setApiError(err.message || "Đã xảy ra lỗi không mong muốn.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, router]
  );

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="m-auto w-full max-w-lg bg-white p-8 rounded-lg shadow-2xl shadow-red-100">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Tạo tài khoản mới
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* API ERROR */}
        {apiError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}

        {/* ✨ EMAIL FIELD - SỬ DỤNG CustomInputField */}
        <CustomInputField
          label="Email"
          name="email"
          type="email"
          placeholder="nguyenvana@gmail.com"
          autoComplete="email"
          register={register}
          errors={errors}
          disabled={isSubmitting || loading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ✨ FULL NAME FIELD - SỬ DỤNG CustomInputField */}
          <CustomInputField
            label="Họ tên"
            name="fullName"
            type="text"
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            register={register}
            errors={errors}
            disabled={isSubmitting || loading}
          />

          {/* PROVINCE SELECTOR  */}
          <div>
            <Controller
              name="province"
              control={control}
              render={({ field }) => (
                <ProvinceSelector
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.province && (
              <p className="mt-2 text-sm text-red-600">
                {errors.province.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DISTRICT SELECTOR */}
          <div>
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <DistrictSelector
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.district && (
              <p className="mt-2 text-sm text-red-600">
                {errors.district.message}
              </p>
            )}
          </div>

          {/* WARD SELECTOR */}
          <div>
            <Controller
              name="ward"
              control={control}
              render={({ field }) => (
                <WardSelector value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.ward && (
              <p className="mt-2 text-sm text-red-600">{errors.ward.message}</p>
            )}
          </div>
        </div>

        {/* STREET FIELD */}
        <CustomInputField
          label="Địa chỉ liên hệ"
          name="street"
          type="text"
          placeholder="Số nhà, đường hẻm"
          autoComplete="address-line1"
          register={register}
          errors={errors}
          disabled={isSubmitting || loading}
        />

        <div className="flex items-center justify-center pt-2">
          <span className="text-sm text-gray-500 uppercase">hoặc</span>
        </div>

        <SocialAuth />

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading && (
            <span className="animate-spin">
              <Spinner />
            </span>
          )}{" "}
          <p>Đăng ký</p>
        </button>

        <div className="text-center py-4 text-gray-900 text-sm">
          <p>
            Bạn đã có tài khoản?{" "}
            <Link className="text-red-500 hover:underline" href="/auth/signin">
              Đăng nhập
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
