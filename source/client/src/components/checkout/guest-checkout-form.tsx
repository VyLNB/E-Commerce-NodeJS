// src/components/checkout/guest-address-form.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import {
  CustomInputField,
  DistrictSelector,
  ProvinceSelector,
  WardSelector,
} from "../ui";

// Schema validation cho Guest (có thêm email)
const GuestAddressSchema = z.object({
  recipientName: z.string().min(3, "Họ tên quá ngắn"),
  email: z.email("Email không hợp lệ").min(1, "Email là bắt buộc"), // ✨ Quan trọng
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  city: z.string().min(1, "Vui lòng chọn Tỉnh/Thành"),
  district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
  ward: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  street: z.string().min(5, "Địa chỉ quá ngắn"),
});

type GuestFormData = z.infer<typeof GuestAddressSchema>;

type Props = {
  onConfirm: (data: any) => void;
};

export default function GuestAddressForm({ onConfirm }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
  } = useForm<GuestFormData>({
    resolver: zodResolver(GuestAddressSchema),
    mode: "onChange", // Validate realtime để enable nút Confirm
    defaultValues: {
      recipientName: "",
      email: "",
      phone: "",
      city: "TP. Hồ Chí Minh",
      district: "",
      ward: "",
      street: "",
    },
  });

  // Lắng nghe thay đổi form để gửi data lên cha (AddressStep -> CheckoutPage)
  // Tuy nhiên, tốt nhất là người dùng bấm "Xác nhận" mới gửi
  const onSubmit = (data: GuestFormData) => {
    // Mapping data cho đúng format ShippingAddress
    const shippingData = {
      ...data,
      isDefault: true,
      _id: 0, // ID giả
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onConfirm(shippingData);
  };

  return (
    <form
      id="guest-form"
      onChange={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInputField
          label="Họ tên người nhận"
          name="recipientName"
          placeholder="Nguyễn Văn A"
          register={register}
          errors={errors}
        />
        <CustomInputField
          label="Email (Để nhận thông tin đơn hàng)"
          name="email"
          type="email"
          placeholder="email@example.com"
          register={register}
          errors={errors}
        />
      </div>

      <CustomInputField
        label="Số điện thoại"
        name="phone"
        placeholder="0912..."
        register={register}
        errors={errors}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <ProvinceSelector value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.city && (
            <p className="text-red-500  mt-1">{errors.city.message}</p>
          )}
        </div>
        <div>
          <Controller
            name="district"
            control={control}
            render={({ field }) => (
              <DistrictSelector value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.district && (
            <p className="text-red-500  mt-1">{errors.district.message}</p>
          )}
        </div>
        <div>
          <Controller
            name="ward"
            control={control}
            render={({ field }) => (
              <WardSelector value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.ward && (
            <p className="text-red-500  mt-1">{errors.ward.message}</p>
          )}
        </div>
      </div>

      <CustomInputField
        label="Số nhà, Tên đường"
        name="street"
        placeholder="19 Nguyễn Hữu Thọ..."
        register={register}
        errors={errors}
      />
    </form>
  );
}
