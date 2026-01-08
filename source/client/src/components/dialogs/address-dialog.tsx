"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import * as z from "zod";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CustomInputField,
  DistrictSelector,
  ProvinceSelector,
  WardSelector,
} from "../ui";
import { toast } from "react-toastify";
import { Spinner } from "@/public/icons";
import { XIcon } from "lucide-react";
import { saveAddress, updateAddress } from "@/api/address";
import { useAppSelector } from "@/lib/hooks";
import { Address } from "@/lib/types";

const AddressSchema = z.object({
  recipientName: z
    .string()
    .min(3, { message: "Họ tên phải có ít nhất 3 ký tự" })
    .max(100, { message: "Họ tên không được quá 100 ký tự" }),
  phone: z.string().min(10, { message: "Số điện thoại phải có ít nhất 10 số" }),
  city: z.string().min(1, "Vui lòng chọn giá trị"),
  district: z.string().min(1, "Vui lòng chọn giá trị"),
  ward: z.string().min(1, "Vui lòng chọn giá trị"),
  street: z.string().min(10, { message: "Vui lòng nhập địa chỉ đầy đủ" }),
  isDefault: z.boolean(),
});

type AddressFormData = z.infer<typeof AddressSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Address;
  onSaveSuccess: (addresses: Address[]) => void;
};

export default function AddressDialog({
  isOpen,
  onClose,
  initialData,
  onSaveSuccess,
}: Props) {
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { _id } = useAppSelector((state) => state.user);

  const defaultValues = {
    fullName: "",
    email: "",
    phone: "",
    province: "TP. Hồ Chí Minh",
    district: "Quận 1",
    ward: "phường Tân Thuận Đông",
    street: "",
    isDefault: false,
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(AddressSchema),
    defaultValues: initialData || defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const onSubmit: SubmitHandler<AddressFormData> = async (data) => {
    setIsApiLoading(true);
    setApiError(null);
    console.log(data);

    try {
      if (!_id) return;

      let response;
      const payload = {
        recipientName: data.recipientName,
        phone: data.phone,
        city: data.city,
        district: data.district,
        ward: data.ward,
        street: data.street,
        isDefault: data.isDefault,
      };

      if (initialData?._id) {
        response = await updateAddress(_id, initialData._id, payload);
      } else {
        response = await saveAddress(_id, payload);
      }

      if (response.success) {
        toast.success(response.message);
        onSaveSuccess(response.data);
        reset();
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
      setApiError(errorMessage);
    } finally {
      setIsApiLoading(false);
    }
  };

  const dialogTitle = initialData
    ? "Chỉnh sửa Địa chỉ"
    : "Thông tin người nhận hàng";

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
              <DialogPanel className="w-full max-w-xl transform rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="mb-4 text-xl font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  {dialogTitle}
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      onClose();
                    }}
                    className="rounded-md p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition"
                    disabled={isApiLoading}
                  >
                    <XIcon size={20} aria-hidden="true" />
                  </button>
                </DialogTitle>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-4 space-y-4"
                >
                  {apiError && (
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm"
                      role="alert"
                    >
                      <span className="block sm:inline">{apiError}</span>
                    </div>
                  )}

                  <CustomInputField
                    label="Họ tên"
                    name="recipientName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    register={register}
                    errors={errors}
                    disabled={isApiLoading}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInputField
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="nguyenvana@gmail.com"
                      autoComplete="email"
                      register={register}
                      errors={errors}
                      disabled={isApiLoading}
                    />
                    <CustomInputField
                      label="Phone"
                      name="phone"
                      type="tel"
                      placeholder="0912312414"
                      autoComplete="tel"
                      register={register}
                      errors={errors}
                      disabled={isApiLoading}
                    />
                  </div>
                  <div className="w-full h-0.5 bg-gray-200 rounded-xl my-8"></div>
                  <DialogTitle
                    as="h3"
                    className="mb-4 text-xl font-medium leading-6 text-gray-900 flex justify-between items-center"
                  >
                    Địa chỉ giao hàng
                  </DialogTitle>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <ProvinceSelector
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      {errors.city && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
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
                    <div>
                      <Controller
                        name="ward"
                        control={control}
                        render={({ field }) => (
                          <WardSelector
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      {errors.ward && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.ward.message}
                        </p>
                      )}
                    </div>
                    <CustomInputField
                      label="Địa chỉ liên hệ"
                      name="street"
                      type="text"
                      placeholder="Số nhà, đường hẻm"
                      autoComplete="address-line1"
                      register={register}
                      errors={errors}
                      disabled={isApiLoading}
                    />
                  </div>
                  {/* Default Field */}
                  <div className="flex items-center justify-end text-gray-700 gap-2">
                    <input
                      id="isDefault"
                      type="checkbox"
                      className="h-4 w-4 rounded bg-gray-200 focus:ring-blue-500 cursor-pointer appearance-none checked:bg-blue-600 checked:border-transparent checked:ring-1 checked:ring-blue-600"
                      {...register("isDefault")}
                    />
                    <label
                      htmlFor="isDefault"
                      className="cursor-pointer select-none"
                    >
                      Đặt làm mặc định
                    </label>
                  </div>
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        reset();
                        onClose();
                      }}
                      className="cursor-pointer inline-flex justify-center rounded-md border border-gray-300 px-4 py-2  font-medium text-gray-900 hover:bg-gray-200 transition"
                      disabled={isApiLoading}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={isApiLoading}
                      className={`cursor-pointer inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2  font-medium text-white hover:bg-blue-700 transition ${
                        isApiLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isApiLoading ? (
                        <span className="flex items-center gap-2">
                          <Spinner /> Đang lưu...
                        </span>
                      ) : (
                        "Lưu địa chỉ"
                      )}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
