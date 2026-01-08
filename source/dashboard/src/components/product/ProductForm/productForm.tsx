import { Trash2Icon, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBrands } from "../../../api/brand";
import { getCategory } from "../../../api/category";
import type { BrandItem } from "../../../interface/brandInterface";
import type { CategoryItem } from "../../../interface/categoryInterface";
import type {
  ProductItem,
  ProductOption,
  ProductVariant,
} from "../../../interface/productInterface";
import { ConfirmDialog } from "../../dialogs";
import ImageUpload from "./imageUpLoad";
import InputField from "./inputField";
import SelectField from "./selectField";
import TextAreaField from "./textAreaField";
import ProductVariants from "./productVariants";
import {
  deriveOptionsFromVariants,
  getFlexibleImageUrl,
} from "../../../lib/utils";
import Button from "../../button";

interface ProductFormProps {
  initialData?: ProductItem | null;
  isEditMode?: boolean;
  onSubmit: (formData: any) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  isEditMode = false,
  onSubmit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [activeSelect, setActiveSelect] = useState<string | null>(null);

  // State quản lý dropdown options
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);

  const defaultFormData = {
    name: "",
    description: "",
    price: 0,
    categoryName: "",
    brandName: "",
    images: [] as (string | File)[],
    variantOptions: [] as ProductOption[],
    variants: [] as ProductVariant[],
    specifications: [] as { name: string; value: string }[],
    attributes: [] as { name: string; value: string }[],
    isActive: true,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [initialFormState, setInitialFormState] = useState(defaultFormData);

  // FETCH DATA cho Dropdown
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [categoryRes, brandRes] = await Promise.all([
          getCategory(),
          getBrands(),
        ]);

        if (categoryRes?.data) {
          setCategories(categoryRes.data.categories);
          setCategoryOptions(
            categoryRes.data.categories.map((cat) => cat.name)
          );
        }
        if (brandRes?.data) {
          setBrands(brandRes.data.brands);
          setBrandOptions(brandRes.data.brands.map((brand) => brand.name));
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu phân loại:", error);
      }
    };
    fetchDropdownData();
  }, []);

  // Load Initial Data (khi Edit)
  useEffect(() => {
    if (initialData && isEditMode) {
      const options =
        initialData.variants.length > 0
          ? deriveOptionsFromVariants(initialData.variants)
          : [];

      // Convert Record<string, string> to Array<{name, value}> for UI
      const specsArray = initialData.specifications
        ? Object.entries(initialData.specifications).map(([key, val]) => ({
            name: key,
            value: val,
          }))
        : [];

      // Convert attributes object sang mảng cho UI
      const attributesArray = initialData.attributes
        ? Object.entries(initialData.attributes).map(([key, val]) => ({
            name: key,
            value: val,
          }))
        : [];

      const variants = initialData.variants.map((variant) => {
        const newVariantImages = variant.images.map((image) =>
          !image.includes("http://localhost:5000")
            ? getFlexibleImageUrl(image)
            : image
        );
        variant.images = newVariantImages;
        return variant;
      });

      const data = {
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        categoryName: initialData.category?.name || "",
        brandName: initialData.brand?.name || "",
        images: initialData.images || [],
        variantOptions: options,
        variants: variants || [],
        specifications: specsArray,
        attributes: attributesArray,
        isActive: initialData.status === "active",
      };
      setFormData(data);
      setInitialFormState(data);
    }
  }, [initialData, isEditMode]);

  // --- CÁC HÀM HANDLERS ---
  const isFormDirty = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormState);
  }, [formData, initialFormState]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setActiveSelect(null);
  };

  const handleImagesChange = (newImages: (string | File)[]) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  // --- HANDLERS CHO SPECIFICATIONS ---
  const handleAddSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { name: "", value: "" }],
    }));
  };

  const handleRemoveSpec = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSpecChange = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    const newSpecs = formData.specifications.map((spec, i) =>
      i === index ? { ...spec, [field]: value } : spec
    );
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  // --- HANDLERS CHO ATTRIBUTES (BỘ LỌC) ---
  const handleAddAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { name: "", value: "" }],
    }));
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleAttributeChange = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    const newAttrs = formData.attributes.map((attr, i) =>
      i === index ? { ...attr, [field]: value } : attr
    );
    setFormData((prev) => ({ ...prev, attributes: newAttrs }));
  };

  const handleSubmit = async () => {
    // Validation
    const category = categories.find((c) => c.name === formData.categoryName);
    const brand = brands.find((b) => b.name === formData.brandName);

    if (!category) {
      alert("Vui lòng chọn danh mục hợp lệ");
      return;
    }
    if (!brand) {
      alert("Vui lòng chọn thương hiệu hợp lệ");
      return;
    }
    if (formData.price < 0) {
      alert("Giá sản phẩm không được âm");
      return;
    }

    try {
      setLoading(true);

      const submitFormData = new FormData();

      // 1. Prepare Main Product Images
      const mainExistingImages = formData.images.filter(
        (img): img is string => typeof img === "string"
      );
      const mainNewFiles = formData.images.filter(
        (img): img is File => img instanceof File
      );

      // 2. Process Variants
      const processedVariants = formData.variants.map((variant, index) => {
        const variantExistingImages = variant.images.filter(
          (img) => typeof img === "string"
        );
        const variantNewFiles = variant.images.filter(
          (img) => img instanceof File
        );

        variantNewFiles.forEach((file) => {
          submitFormData.append(`variant_images_${index}`, file);
        });

        return {
          ...variant,
          _id: variant._id?.startsWith("temp-") ? undefined : variant._id,
          status: variant.status || "active",
          images: variantExistingImages,
        };
      });

      // 3. Process Specifications (Array -> Object)
      const specificationsObject = formData.specifications.reduce(
        (acc, curr) => {
          if (curr.name.trim() && curr.value.trim()) {
            acc[curr.name.trim()] = curr.value.trim();
          }
          return acc;
        },
        {} as Record<string, string>
      );

      // 3.1. Process Attributes (Array -> Object)
      const attributesObject = formData.attributes.reduce((acc, curr) => {
        if (curr.name.trim() && curr.value.trim()) {
          acc[curr.name.trim()] = curr.value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      // 4. Construct the Main JSON Payload
      const jsonData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        categoryId: category._id,
        brandId: brand._id,
        status: formData.isActive ? "active" : "inactive",
        specifications: specificationsObject,
        attributes: attributesObject,
        variants: processedVariants.length > 0 ? processedVariants : [],
      };

      // 5. Append Data to FormData
      submitFormData.append("data", JSON.stringify(jsonData));

      mainExistingImages.forEach((url) => {
        submitFormData.append("existingImages", url);
      });

      mainNewFiles.forEach((file) => {
        submitFormData.append("newImages", file);
      });

      await onSubmit(submitFormData);
    } catch (error) {
      console.error("Lỗi khi submit form:", error);
      alert(
        `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => setIsDeleteDialogOpen(true);

  const handleConfirmDelete = async () => {
    if (onDelete) {
      try {
        setLoading(true);
        await onDelete();
      } catch (error) {
        setLoading(false);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleCancelClick = () => {
    if (isFormDirty()) {
      setIsCancelDialogOpen(true);
    } else {
      navigate("/admin/products");
    }
  };

  const handleConfirmCancel = () => {
    setIsCancelDialogOpen(false);
    navigate("/admin/products");
  };

  const handleVariantsUpdate = useCallback(
    (data: { variantOptions: ProductOption[]; variants: ProductVariant[] }) => {
      setFormData((prev) => ({
        ...prev,
        variantOptions: data.variantOptions,
        variants: data.variants,
      }));
    },
    []
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Info & Price */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Thông tin chung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Tên sản phẩm"
                  placeholder="Nhập tên sản phẩm..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <InputField
                  label="Giá bán (VNĐ)"
                  type="number"
                  placeholder="0"
                  value={formData.price.toString()}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
              </div>
            </div>
            <TextAreaField
              label="Mô tả sản phẩm"
              placeholder="Viết mô tả chi tiết..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={5}
            />
          </div>

          {/* 2. Upload Images */}
          <ImageUpload images={formData.images} onChange={handleImagesChange} />

          {/* 3. Attributes Section (Bộ lọc) */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Thuộc tính lọc (Attributes)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Dùng cho bộ lọc tìm kiếm (VD: CPU: "Core i5", RAM: "16GB").
                  Nên nhập ngắn gọn, chuẩn hóa.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddAttribute}
                className="text-xs"
              >
                <Plus size={16} /> Thêm thuộc tính
              </Button>
            </div>

            {formData.attributes.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-md border border-dashed border-gray-300">
                Chưa có thuộc tính lọc nào.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.attributes.map((attr, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <InputField
                        label={index === 0 ? "Tên (VD: CPU)" : ""}
                        placeholder="Tên thuộc tính"
                        value={attr.name}
                        onChange={(e) =>
                          handleAttributeChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <InputField
                        label={index === 0 ? "Giá trị (VD: Core i7)" : ""}
                        placeholder="Giá trị chuẩn hóa"
                        value={attr.value}
                        onChange={(e) =>
                          handleAttributeChange(index, "value", e.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(index)}
                      className={`text-gray-400 hover:text-red-500 transition-colors p-2 ${
                        index === 0 ? "mt-6" : "mt-1"
                      }`}
                      title="Xóa dòng này"
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Specifications Section (Thông số hiển thị) */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Thông số kỹ thuật (Specifications)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Dùng để hiển thị bảng chi tiết (VD: CPU: "Intel Core
                  i7-13700H...").
                </p>
              </div>
              <Button type="button" onClick={handleAddSpec} className="text-xs">
                <Plus size={16} /> Thêm thông số
              </Button>
            </div>

            {formData.specifications.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-md border border-dashed border-gray-300">
                Chưa có thông số kỹ thuật nào.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <InputField
                        label={index === 0 ? "Tên thông số" : ""}
                        placeholder="VD: Vi xử lý"
                        value={spec.name}
                        onChange={(e) =>
                          handleSpecChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <InputField
                        label={index === 0 ? "Giá trị chi tiết" : ""}
                        placeholder="VD: Intel® Core™ i7-13620H..."
                        value={spec.value}
                        onChange={(e) =>
                          handleSpecChange(index, "value", e.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(index)}
                      className={`text-gray-400 hover:text-red-500 transition-colors p-2 ${
                        index === 0 ? "mt-6" : "mt-1"
                      }`}
                      title="Xóa dòng này"
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Variants Section */}
          <ProductVariants
            productFormData={formData}
            onUpdate={handleVariantsUpdate}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Phân loại
            </h3>
            <div className="space-y-4">
              <SelectField
                label="Danh mục"
                value={formData.categoryName}
                onChange={(v) => handleSelectChange("categoryName", v)}
                options={categoryOptions}
                placeholder="Chọn danh mục"
                addNewText="Thêm danh mục mới"
                onAddNew={() => navigate("/admin/categories")}
                isOpen={activeSelect === "category"}
                onToggle={() =>
                  setActiveSelect(
                    activeSelect === "category" ? null : "category"
                  )
                }
              />
              <SelectField
                label="Thương hiệu"
                value={formData.brandName}
                onChange={(v) => handleSelectChange("brandName", v)}
                options={brandOptions}
                placeholder="Chọn thương hiệu"
                addNewText="Thêm thương hiệu mới"
                onAddNew={() => navigate("/admin/brands")}
                isOpen={activeSelect === "brand"}
                onToggle={() =>
                  setActiveSelect(activeSelect === "brand" ? null : "brand")
                }
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Trạng thái
            </h3>
            <label
              htmlFor="isActive"
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                checked={formData.isActive}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
              />
              <span className="text-sm font-medium text-gray-700">
                Kích hoạt sản phẩm
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-60 bg-white border-t border-gray-200 p-4 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            {isEditMode && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={loading}
                className="px-4 py-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <Trash2Icon size={18} />
                <span className="hidden sm:inline">Ngưng sản phẩm</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (isEditMode && !isFormDirty())}
              className={`px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 font-medium flex items-center ${
                loading || (isEditMode && !isFormDirty())
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isEditMode ? "Cập nhật" : "Lưu sản phẩm"}
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Ngưng sản phẩm?"
        message="Bạn có chắc chắn muốn ngưng phát hành sản phẩm này không? Hành động này không thể hoàn tác."
        confirmText="Xác nhận ngưng"
        variant="danger"
        isLoading={loading}
      />
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Rời khỏi trang?"
        message="Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang này không?"
        confirmText="Rời đi"
        cancelText="Ở lại"
        variant="warning"
      />
    </>
  );
};

export default ProductForm;
