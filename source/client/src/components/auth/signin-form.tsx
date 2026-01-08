"use client";

import React, { useCallback, useEffect, useState } from "react";
import SocialAuth from "./social-auth";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/public/icons";
import { signin, SigninPayload } from "@/api/auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setCredentials } from "@/lib/features/user-slice";
import { CustomInputField } from "../ui";
import { useRouter } from "next/navigation";
import { PasswordRecoveryDialog } from "../dialogs";
import { CartItem } from "@/lib/types";
import { addToCartServer, getCartServer } from "@/api/cart";
import { setCart } from "@/lib/features/cart-slice";

type Props = {};

//  Validation Rules
const SigninSchema = z.object({
  email: z
    .email("Email không hợp lệ")
    .min(1, { message: "Email không được để trống" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

type SigninFormData = z.infer<typeof SigninSchema>;

export default function SigninForm({}: Props) {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

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
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<SigninFormData> = useCallback(
    async (data) => {
      setLoading(true);
      setApiError(null);

      try {
        const result = await signin(data as SigninPayload);

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
        if (result.error && result.message) {
          setApiError(result.message);
        } else {
          const guestCartJson = localStorage.getItem("guest_cart");
          if (guestCartJson) {
            const guestItems: CartItem[] = JSON.parse(guestCartJson);
            if (guestItems.length > 0) {
              // Gọi API loop qua từng item để add lên server
              for (const item of guestItems) {
                await addToCartServer({
                  productId: item.productId,
                  variantId: item.id,
                  quantity: item.quantity,
                });
              }
              // Sau khi merge xong, xóa local cart và fetch lại cart mới từ server
              localStorage.removeItem("guest_cart");
              const newServerCart = await getCartServer();
              dispatch(setCart(newServerCart));
            }
          }
          console.log("Đăng nhập thành công! Dữ liệu người dùng:", result.data);
          router.push("/");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="m-auto w-full max-w-md bg-white p-8 rounded-lg shadow-2xl shadow-red-100">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Đăng nhập
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

        <CustomInputField
          label="Mật khẩu"
          name="password"
          type="password"
          placeholder="******"
          autoComplete="current-password"
          register={register}
          errors={errors}
          disabled={isSubmitting || loading}
        />
        <div className="flex items-center justify-end">
          {/* Thay đổi Link thành span/button kích hoạt Modal */}
          <span
            onClick={() => setIsRecoveryModalOpen(true)}
            className="text-blue-500 hover:underline text-sm cursor-pointer"
          >
            Quên mật khẩu?
          </span>
        </div>

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
          <p>Đăng nhập</p>
        </button>

        <div className="text-center py-4 text-gray-900 text-sm">
          <p>
            Bạn chưa có tài khoản?{" "}
            <Link className="text-red-500 hover:underline" href="/auth/signup">
              Đăng ký
            </Link>
          </p>
        </div>
      </form>

      <PasswordRecoveryDialog
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
      />
    </div>
  );
}
