import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
} from "@headlessui/react";
import { useState } from "react";
import type { ProductVariant } from "../../../interface/productInterface";
import { formatCurrency } from "../../../lib/utils";
import Button from "../../button";
import InputField from "./inputField";
import ImageUpload from "./imageUpLoad";
import SelectField from "./selectField";
import { Trash2 } from "lucide-react";

type Props = {
  variant: ProductVariant;
  onUpdate: (variant: ProductVariant) => void;
  onDelete: () => void;
};

const STATUS_MAP: Record<string, string> = {
  active: "Hoạt động (Active)",
  inactive: "Tạm ẩn (Inactive)",
  discontinued: "Ngừng kinh doanh (Discontinued)",
};

const getStatusKeyByLabel = (label: string) => {
  return (
    Object.keys(STATUS_MAP).find((key) => STATUS_MAP[key] === label) || "active"
  );
};

const VariantRow = ({ variant, onUpdate, onDelete }: Props) => {
  const [initialData, setInitialData] = useState<ProductVariant>(variant);

  const handleInputChange = (
    field: keyof typeof initialData,
    value: string | number | (string | File)[]
  ) => {
    setInitialData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Xử lý thay đổi thuộc tính (attributes/specifications)
  const handleAttributeChange = (key: string, value: string) => {
    const attributesToUse =
      initialData.attributes || initialData.specifications;

    if (!attributesToUse) return;

    const updatedAttributes = { ...attributesToUse, [key]: value };

    const updatedData = initialData.attributes
      ? { ...initialData, attributes: updatedAttributes }
      : { ...initialData, specifications: updatedAttributes };

    setInitialData(updatedData as ProductVariant);
  };

  // Lấy ra các thuộc tính để chỉnh sửa (ưu tiên attributes)
  const attributesToEdit = initialData.attributes || initialData.specifications;
  const attributesKeys = Object.keys(attributesToEdit || {});

  const handleSave = () => {
    onUpdate(initialData);
  };

  const handleCancel = () => {
    setInitialData(variant);
  };

  const currentStatusLabel = STATUS_MAP[initialData.status || "active"];

  return (
    <Disclosure>
      {({ open }) => (
        <div className={open ? "border rounded-lg" : ""}>
          <DisclosureButton className="flex justify-between w-full p-3 hover:bg-gray-100 transition rounded-t-lg">
            {/* Basic Variant Info */}
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">{variant.variantName}</h4>
                {/* Status Badge in Header */}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    variant.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : variant.status === "inactive"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {STATUS_MAP[variant.status || "active"]}
                </span>
              </div>
              <p className="text-xs  text-gray-500">
                {variant.sku || "Biến thể chưa có sku"}
              </p>
            </div>
            {/* Price & Stock */}
            <div className="text-right space-y-1">
              <p className="text-sm font-medium">
                {formatCurrency(variant.priceAdjustment)}
              </p>
              <p className="text-xs text-gray-500">
                Đang có {variant.stock} mặt hàng khả dụng
              </p>
            </div>
            {/* Delete button */}
            <div
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Xóa biến thể này"
            >
              <Trash2 size={18} />
            </div>
          </DisclosureButton>
          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-y-95 opacity-0"
            enterTo="transform scale-y-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-y-100 opacity-100"
            leaveTo="transform scale-y-95 opacity-0"
          >
            <DisclosurePanel className="text-sm p-3 rounded-lg bg-white">
              {/* Hàng Input cơ bản */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Tên Biến thể (Display Name)"
                  placeholder="Nhập tên biến thể"
                  value={initialData.variantName}
                  onChange={(e) =>
                    handleInputChange("variantName", e.target.value)
                  }
                />
                <InputField
                  label="SKU"
                  value={initialData.sku}
                  placeholder="Nhập SKU của biến thể"
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  required
                />
                <InputField
                  label="Giá điều chỉnh (VNĐ)"
                  type="number"
                  value={initialData.priceAdjustment.toString()}
                  onChange={(e) =>
                    handleInputChange("priceAdjustment", Number(e.target.value))
                  }
                />
                <InputField
                  label="Tồn kho"
                  type="number"
                  value={initialData.stock.toString()}
                  onChange={(e) =>
                    handleInputChange("stock", Number(e.target.value))
                  }
                />
                <SelectField
                  label="Trạng thái kinh doanh"
                  value={currentStatusLabel}
                  onChange={(label) => {
                    const statusKey = getStatusKeyByLabel(label);
                    handleInputChange("status", statusKey);
                  }}
                  options={Object.values(STATUS_MAP)}
                  placeholder="Chọn trạng thái"
                />
              </div>
              {attributesKeys.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <h5 className="font-semibold text-gray-800">
                    Thuộc tính (Quyết định Tags)
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attributesKeys.map((key) => (
                      <InputField
                        key={key}
                        label={key} // Tên thuộc tính: "Màu sắc"
                        placeholder={`Giá trị cho ${key}`}
                        value={(attributesToEdit![key] as string) || ""}
                        onChange={(e) =>
                          handleAttributeChange(key, e.target.value)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Image upload for variants */}
              <div className="mt-4">
                <ImageUpload
                  images={initialData.images}
                  onChange={(newImages) =>
                    handleInputChange("images", newImages)
                  }
                  label="Hình ảnh riêng cho biến thể này"
                />
              </div>
              {/* Hàng Actions */}
              <div className="flex justify-end gap-2 pt-4 border-gray-200">
                <DisclosureButton
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-md hover:bg-gray-100 transition"
                >
                  Hủy
                </DisclosureButton>
                <DisclosureButton onClick={handleSave} as={Button}>
                  Lưu thay đổi
                </DisclosureButton>
              </div>
            </DisclosurePanel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
};

export default VariantRow;
