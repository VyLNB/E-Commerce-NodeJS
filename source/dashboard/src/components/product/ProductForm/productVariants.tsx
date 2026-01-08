import { PlusIcon, X } from "lucide-react";
import { Fragment, useEffect, useState, useCallback } from "react";
import type {
  ProductOption,
  ProductVariant,
} from "../../../interface/productInterface";
import Button from "../../button";
import VariantRow from "./variantRow";
import OptionTitle from "./optionTitle";
import { deriveOptionsFromVariants, getCombinations } from "../../../lib/utils";
import InputField from "./inputField";

type Props = {
  productFormData: any;
  onUpdate: (data: {
    variantOptions: ProductOption[];
    variants: ProductVariant[];
  }) => void;
};

const createDefaultVariant = (
  combination: Record<string, string>,
  variantName: string
): ProductVariant => {
  return {
    _id: `temp-${Date.now()}-${variantName}-${Math.random()}`,
    sku: "",
    variantName: variantName,
    priceAdjustment: 0,
    stock: 0,
    images: [],
    status: "active",
    attributes: combination, // LƯU Ý: combination là { "Màu sắc": "Đỏ", "Kích thước": "L" }
    specifications: {},
  };
};

const ProductVariants = ({ productFormData, onUpdate }: Props) => {
  const { variants, variantOptions } = productFormData;
  const [optionTitles, setOptionTitles] =
    useState<ProductOption[]>(variantOptions);
  const [variantList, setVariantList] = useState<ProductVariant[]>(variants);

  // State mới để quản lý việc thêm tùy chọn
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValuesString, setNewOptionValuesString] = useState("");

  // Initial load
  useEffect(() => {
    setOptionTitles(productFormData.variantOptions);
    setVariantList(productFormData.variants);
  }, [productFormData.variantOptions, productFormData.variants]);

  // Hàm xử lý việc đổi tên tiêu đề tùy chọn
  const handleOptionTitleChange = useCallback(
    (oldTitle: string, newTitle: string) => {
      setOptionTitles((prevOptions) => {
        const updatedOptions = prevOptions.map((option) =>
          option.name === oldTitle ? { ...option, name: newTitle } : option
        );
        onUpdate({ variantOptions: updatedOptions, variants: variantList });
        return updatedOptions;
      });
    },
    [variantList, onUpdate]
  );

  // Hàm helper để giữ lại tên tùy chỉnh nếu chỉ có một tùy chọn
  const applyCustomOptionName = (
    derivedOptions: ProductOption[],
    currentOptions: ProductOption[]
  ) => {
    if (derivedOptions.length === 1 && currentOptions.length === 1) {
      const derivedName = derivedOptions[0].name;
      const currentCustomName = currentOptions[0].name;

      if (derivedName === "Tùy chọn" || currentCustomName !== derivedName) {
        return [
          {
            ...derivedOptions[0],
            name: currentCustomName,
          },
        ];
      }
    }
    return derivedOptions;
  };

  // Hàm thêm mới một biến thể kèm thuộc tính
  const handleAddNewOption = () => {
    if (!newOptionName.trim() || !newOptionValuesString.trim()) {
      alert("Vui lòng nhập tên tùy chọn và ít nhất một giá trị.");
      return;
    }

    const newValues = newOptionValuesString
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);
    if (newValues.length === 0) {
      alert("Vui lòng nhập ít nhất một giá trị hợp lệ.");
      return;
    }

    // 1. Tạo đối tượng ProductOption mới
    const newOption: ProductOption = {
      name: newOptionName.trim(),
      values: newValues,
    };

    // 2. Kết hợp với các tùy chọn hiện có
    const allOptions = [
      ...optionTitles.filter((opt) => opt.name !== newOption.name),
      newOption,
    ]; // Lọc bỏ tên cũ nếu trùng

    // 3. Sử dụng getCombinations để tạo ra tất cả các tổ hợp mới
    const newCombinations = getCombinations(allOptions);

    // 4. Tái tạo Variants từ Combinations (giữ lại dữ liệu hiện có)
    const updatedVariants = newCombinations.map((combination) => {
      const variantName = Object.values(combination).join(" / ");

      // Tìm biến thể cũ khớp với tổ hợp thuộc tính này
      const existingVariant = variantList.find((v) => {
        // Kiểm tra xem tất cả thuộc tính của biến thể cũ có khớp với tổ hợp mới không
        const oldAttributes = v.attributes || v.specifications || {};
        const keysMatch =
          Object.keys(oldAttributes).length === Object.keys(combination).length;
        const valuesMatch =
          keysMatch &&
          Object.keys(combination).every(
            (key) => combination[key] === oldAttributes[key]
          );

        return valuesMatch;
      });

      // Nếu tồn tại biến thể cũ, giữ lại dữ liệu (giá, tồn kho, ID)
      if (existingVariant) {
        return {
          ...existingVariant,
          variantName: variantName, // Cập nhật lại tên hiển thị
          attributes: combination, // Đảm bảo thuộc tính đúng
        } as ProductVariant;
      }

      // Nếu là biến thể mới, tạo biến thể mặc định
      return createDefaultVariant(combination, variantName);
    });

    // 5. Đồng bộ hóa trạng thái
    setVariantList(updatedVariants);
    setOptionTitles(allOptions);

    onUpdate({ variantOptions: allOptions, variants: updatedVariants });

    // 6. Reset UI
    setIsAddingOption(false);
    setNewOptionName("");
    setNewOptionValuesString("");
  };

  const handleRemoveVariant = (variantId: string | undefined) => {
    if (!variantId) return;

    if (!window.confirm("Bạn có chắc chắn muốn xóa biến thể này?")) {
      return;
    }

    // Filter out the deleted variant
    const updatedVariants = variantList.filter((v) => v._id !== variantId);

    // Recalculate Options (in case a specific attribute value is no longer used)
    const newlyDerivedOptions = deriveOptionsFromVariants(updatedVariants);
    const finalOptionTitles = applyCustomOptionName(
      newlyDerivedOptions,
      optionTitles
    );

    // Update State & Notify Parent
    setVariantList(updatedVariants);
    setOptionTitles(finalOptionTitles);
    onUpdate({ variantOptions: finalOptionTitles, variants: updatedVariants });
  };

  // Hàm xử lý khi cập nhật một biến thể (giữ nguyên logic giữ tên tùy chỉnh)
  const handleUpdateVariant = (updatedVariant: ProductVariant) => {
    const updatedVariants = [...variantList];
    const index = updatedVariants.findIndex(
      (variant) => variant._id === updatedVariant._id
    );

    if (index === -1) {
      console.warn(
        "Không tìm thấy biến thể để cập nhật với ID:",
        updatedVariant._id
      );
      return;
    }

    updatedVariants[index] = updatedVariant;

    const newlyDerivedOptions = deriveOptionsFromVariants(updatedVariants);
    const finalOptionTitles = applyCustomOptionName(
      newlyDerivedOptions,
      optionTitles
    );

    setVariantList(updatedVariants);
    setOptionTitles(finalOptionTitles);

    onUpdate({ variantOptions: finalOptionTitles, variants: updatedVariants });
  };

  const canEditOptionTitle = optionTitles.length === 1;

  return (
    <div className="w-full bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
      {/* TITLE */}
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Biến thể ({variantList.length})
          </h3>
        </div>
      </div>

      {/*UI Tùy chọn để thêm Option Type */}
      <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            Quản lý Thuộc tính & Giá trị
          </h3>
          <Button
            onClick={() => setIsAddingOption(!isAddingOption)}
            className={`bg-blue-500 hover:bg-blue-600 ${
              isAddingOption ? "bg-gray-500 hover:bg-gray-600" : ""
            }`}
          >
            {isAddingOption ? <X size={18} /> : <PlusIcon size={18} />}
            {isAddingOption ? "Đóng" : "Thêm Thuộc tính mới"}
          </Button>
        </div>

        {isAddingOption && (
          <div className="mt-4 p-4 border border-gray-200 rounded-md bg-white space-y-3">
            <h4 className="font-medium text-sm">
              Định nghĩa Thuộc tính/Tùy chọn mới
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Tên thuộc tính (Ví dụ: Kích thước)"
                placeholder="Nhập tên thuộc tính"
                value={newOptionName}
                onChange={(e: any) => setNewOptionName(e.target.value)}
                required
              />
              <InputField
                label="Các giá trị (Phân tách bằng dấu phẩy)"
                placeholder="Ví dụ: S, M, L"
                value={newOptionValuesString}
                onChange={(e: any) => setNewOptionValuesString(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddNewOption}>
                Tạo Biến thể (Tổ hợp)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Danh sách Variant theo title */}
      <div>
        {optionTitles.map((option) => (
          <Fragment key={option.name}>
            <OptionTitle
              title={option.name}
              tags={option.values}
              isEditable={canEditOptionTitle}
              onTitleChange={(newTitle) =>
                handleOptionTitleChange(option.name, newTitle)
              }
            />
          </Fragment>
        ))}
      </div>

      {/* SPACER */}
      <div className="h-[1px] w-full bg-gray-300"></div>

      {/* Khu vực quản lý Biến thể (Danh sách) */}
      <div className="space-y-2">
        {variantList.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed text-gray-500">
            <p>Sản phẩm này chưa có biến thể nào.</p>
            <p className="text-sm mt-2">
              Bấm "Thêm Thuộc tính mới" để bắt đầu.
            </p>
          </div>
        ) : (
          variantList.map((variant) => (
            <Fragment key={variant._id}>
              <VariantRow
                variant={variant}
                onUpdate={handleUpdateVariant}
                onDelete={() => handleRemoveVariant(variant._id)}
              />
            </Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductVariants;
