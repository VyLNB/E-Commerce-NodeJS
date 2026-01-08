import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../product/ProductForm/imageUpLoad";
import InputField from "../product/ProductForm/inputField";
import SelectField from "../product/ProductForm/selectField";
import TextAreaField from "../product/ProductForm/textAreaField";
import { Trash2Icon } from "lucide-react";
import { ConfirmDialog } from "../dialogs";
import { getCategory } from "../../api/category";
import type { CategoryItem } from "../../interface/categoryInterface";
import { getFlexibleImageUrl } from "../../lib/utils";

interface CategoryFormProps {
  initialData?: CategoryItem | null;
  isEditMode?: boolean;
  onSubmit: (formData: any) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
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

  const defaultFormData = {
    name: "",
    description: "",
    imageUrl: [] as (string | File)[],
    isActive: true,
    parentCategoryName: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [initialFormState, setInitialFormState] = useState(defaultFormData);

  // FETCH DATA cho Dropdown (danh sách categories để chọn parent)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryRes = await getCategory();

        if (categoryRes?.data) {
          // Lọc bỏ category hiện tại khỏi danh sách parent (tránh chọn chính nó)
          const filteredCategories = categoryRes.data.categories.filter(
            (cat) => !isEditMode || !initialData || cat._id !== initialData._id
          );

          setCategories(filteredCategories);
          setCategoryOptions(filteredCategories.map((cat) => cat.name));
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu danh mục:", error);
      }
    };
    fetchCategories();
  }, [isEditMode, initialData]);

  // Load Initial Data (khi Edit)
  useEffect(() => {
    if (initialData && isEditMode) {
      // Tìm parent category name từ parentCategoryId
      const parentCategory = categories.find(
        (cat) => cat._id === initialData.parentCategoryId
      );

      // Xử lý ảnh cũ: convert relative path sang full URL để hiển thị
      let initialImages: string[] = [];
      if (initialData.imageUrl) {
        // Handle trường hợp imageUrl là string đơn hoặc array (dù interface là string, nhưng để chắc chắn)
        const rawUrl = initialData.imageUrl;
        initialImages = [getFlexibleImageUrl(rawUrl)];
      }

      const data = {
        name: initialData.name || "",
        description: initialData.description || "",
        imageUrl: initialImages,
        isActive: initialData.isActive ?? true,
        parentCategoryName: parentCategory?.name || "",
      };
      setFormData(data);
      setInitialFormState(data);
    }
  }, [initialData, isEditMode, categories]);

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
    // Backend chỉ hỗ trợ 1 ảnh cho Category (single("image"))
    // Nên ta lấy ảnh cuối cùng nếu user chọn nhiều, hoặc mảng rỗng
    const limitedImages =
      newImages.length > 0 ? [newImages[newImages.length - 1]] : [];
    setFormData((prev) => ({ ...prev, imageUrl: limitedImages }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    const parentCategory = categories.find(
      (c) => c.name === formData.parentCategoryName
    );

    // Chuẩn bị FormData theo yêu cầu của Server
    const submitData = new FormData();

    // 1. Tạo object JSON cho các field text (như server require trong middleware formatImageField)
    const jsonData = {
      name: formData.name,
      description: formData.description || "",
      isActive: formData.isActive,
      parentCategoryId: parentCategory?._id || null,
      // Nếu là ảnh cũ (string), gửi kèm trong JSON (dù server ưu tiên file upload)
      // Server logic: check req.file first, if not check req.body.imageUrl
      imageUrl:
        typeof formData.imageUrl[0] === "string"
          ? formData.imageUrl[0]
          : undefined,
    };

    submitData.append("data", JSON.stringify(jsonData));

    // 2. Append File nếu có (field name phải là 'image' theo routes/v1/category/categoryManagementRoute.js)
    const imageFile = formData.imageUrl.find((img) => img instanceof File);
    if (imageFile) {
      submitData.append("image", imageFile);
    }

    try {
      setLoading(true);
      await onSubmit(submitData);
      setInitialFormState(formData); // Update clean state
    } catch (error) {
      console.error("Lỗi khi submit:", error);
      alert("Lỗi khi lưu danh mục");
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
      navigate("/admin/categories");
    }
  };

  const handleConfirmCancel = () => {
    setIsCancelDialogOpen(false);
    navigate("/admin/categories");
  };

  // --- RENDER ---
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <InputField
            label="Tên danh mục"
            placeholder="Nhập tên danh mục..."
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />

          <TextAreaField
            label="Mô tả danh mục"
            placeholder="Viết mô tả chi tiết..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={5}
          />

          <ImageUpload
            images={formData.imageUrl}
            onChange={handleImagesChange}
            maxImages={1} // UI Limit
            label="Hình ảnh danh mục"
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
                label="Danh mục cha"
                value={formData.parentCategoryName}
                onChange={(v) => handleSelectChange("parentCategoryName", v)}
                options={categoryOptions}
                placeholder="Chọn danh mục cha (tùy chọn)"
                isOpen={activeSelect === "parent"}
                onToggle={() =>
                  setActiveSelect(activeSelect === "parent" ? null : "parent")
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
                Kích hoạt danh mục
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
                <span className="hidden sm:inline">Xóa danh mục</span>
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
              {isEditMode ? "Cập nhật" : "Lưu danh mục"}
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa danh mục?"
        message="Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác."
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

export default CategoryForm;
