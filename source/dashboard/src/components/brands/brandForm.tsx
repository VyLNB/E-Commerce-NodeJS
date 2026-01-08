import type { BrandItem } from "../../interface/brandInterface";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ImageUpload, InputField, TextAreaField } from "../product/ProductForm";
import { Trash2Icon } from "lucide-react";
import { ConfirmDialog } from "../dialogs";
import { getFlexibleImageUrl } from "../../lib/utils";

interface BrandFormProps {
  initialData?: BrandItem | null;
  isEditMode?: boolean;
  onSubmit: (formData: any) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const BrandForm: React.FC<BrandFormProps> = ({
  initialData,
  isEditMode = false,
  onSubmit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const defaultFormData = {
    name: "",
    description: "",
    logoUrl: [] as (string | File)[],
    isActive: true,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [initialFormState, setInitialFormState] = useState(defaultFormData);

  // Load Initial Data (khi Edit)
  useEffect(() => {
    if (initialData && isEditMode) {
      let initialImages: string[] = [];
      if (initialData.logoUrl) {
        const rawUrl = Array.isArray(initialData.logoUrl)
          ? initialData.logoUrl[0]
          : initialData.logoUrl;
        if (rawUrl) {
          initialImages = [getFlexibleImageUrl(rawUrl)];
        }
      }

      const data = {
        name: initialData.name || "",
        description: initialData.description || "",
        logoUrl: initialImages,
        isActive: initialData.isActive ?? true,
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

  const handleImagesChange = (newImages: (string | File)[]) => {
    // Limit to 1 image
    const limitedImages =
      newImages.length > 0 ? [newImages[newImages.length - 1]] : [];
    setFormData((prev) => ({ ...prev, logoUrl: limitedImages }));
  };

  // Handler Submit
  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên thương hiệu");
      return;
    }

    const submitData = new FormData();

    // 1. JSON Data
    const jsonData = {
      name: formData.name.trim(),
      description: formData.description.trim() || "",
      isActive: formData.isActive,
      // Fallback for existing image string
      logoUrl:
        typeof formData.logoUrl[0] === "string"
          ? formData.logoUrl[0]
          : undefined,
    };

    submitData.append("data", JSON.stringify(jsonData));

    // 2. File Data (Must be named 'image')
    const imageFile = formData.logoUrl.find((img) => img instanceof File);
    if (imageFile) {
      submitData.append("image", imageFile);
    }

    try {
      setLoading(true);
      await onSubmit(submitData);
      setInitialFormState(formData);
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
      navigate("/admin/brands");
    }
  };

  const handleConfirmCancel = () => {
    setIsCancelDialogOpen(false);
    navigate("/admin/brands");
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <InputField
            label="Tên thương hiệu"
            placeholder="Nhập tên thương hiệu..."
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />

          <TextAreaField
            label="Mô tả thương hiệu"
            placeholder="Viết mô tả chi tiết..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={5}
          />

          <ImageUpload
            images={formData.logoUrl}
            onChange={handleImagesChange}
            maxImages={1}
            label="Logo thương hiệu"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
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
                Kích hoạt thương hiệu
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
                <span className="hidden sm:inline">Xóa thương hiệu</span>
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
              {isEditMode ? "Cập nhật" : "Lưu thương hiệu"}
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa thương hiệu?"
        message="Bạn có chắc chắn muốn xóa thương hiệu này không? Hành động này không thể hoàn tác."
        confirmText="Xóa ngay"
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

export default BrandForm;
