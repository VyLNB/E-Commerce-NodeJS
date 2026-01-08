import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../product/ProductForm/inputField";
import SelectField from "../product/ProductForm/selectField";
import TextAreaField from "./../product/ProductForm/textAreaField";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import type { CouponItem } from "../../interface/discountInterface";

interface DiscountFormProps {
  initialData?: CouponItem | null;
  isEditMode?: boolean;
  onSubmit: (formData: any) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const DiscountForm: React.FC<DiscountFormProps> = ({
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

  const typeOptions = ["percentage", "fixed_amount"];
  const statusOptions = [
    { label: "Hoạt động", value: true },
    { label: "Không hoạt động", value: false }
  ];

  // Helper function để format date cho datetime-local input
  const formatDateForInput = (dateValue: any): string => {
    if (!dateValue) {
      return new Date().toISOString().slice(0, 16);
    }

    try {
      // Nếu dateValue là string dạng "13:26:54 23/10/2025"
      if (typeof dateValue === 'string' && dateValue.includes('/')) {
        const parts = dateValue.split(' ');
        if (parts.length === 2) {
          const timePart = parts[0]; // "13:26:54"
          const datePart = parts[1]; // "23/10/2025"
          
          const [day, month, year] = datePart.split('/');
          const [hours, minutes] = timePart.split(':');
          
          // Tạo ISO string: YYYY-MM-DDTHH:mm
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
      }

      // Nếu là ISO string hoặc timestamp
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 16);
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }

    // Fallback: return current date
    return new Date().toISOString().slice(0, 16);
  };

  const defaultFormData = {
    code: "",
    discountValue: "",
    type: "percentage",
    usageLimitTotal: "",
    description: "",
    usageLimitPerCustomer: "",
    validFrom: new Date().toISOString().slice(0, 16),
    name: "",
    isActive: true,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [initialFormState, setInitialFormState] = useState(defaultFormData);

  // Load Initial Data (khi Edit)
  useEffect(() => {
    if (initialData && isEditMode) {
      const data = {
        code: initialData.code || "",
        discountValue: initialData.discountValue?.toString() || "",
        type: initialData.type || "percentage",
        usageLimitTotal: initialData.usageLimitTotal?.toString() || "",
        description: initialData.description || "",
        usageLimitPerCustomer: (initialData.usageLimitPerCustomer ?? initialData.usageLimitTotal)?.toString() || "",
        validFrom: formatDateForInput(initialData.validFrom),
        name: initialData.name || "",
        isActive: initialData.isActive ?? true,
      };
      setFormData(data);
      setInitialFormState(data);
    }
  }, [initialData, isEditMode]);

  // --- CÁC HÀM HANDLERS ---
  const isFormDirty = useCallback(() => {
    // Chỉ check isActive có thay đổi không
    return formData.isActive !== initialFormState.isActive;
  }, [formData.isActive, initialFormState.isActive]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // Không cho phép thay đổi nếu đang ở chế độ edit và field không phải isActive
    if (isEditMode && field !== "isActive") return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof typeof formData, value: string | boolean) => {
    // Chỉ cho phép thay đổi isActive khi edit
    if (isEditMode && field !== "isActive") return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setActiveSelect(null);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditMode) return; // Không cho phép thay đổi khi edit
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
    handleInputChange("code", value);
  };

  const handleUsageLimitChange = (field: "usageLimitTotal" | "usageLimitPerCustomer", value: string) => {
    if (isEditMode) return; // Không cho phép thay đổi khi edit
    const numValue = value.replace(/[^0-9]/g, "");
    const limitedValue = numValue ? Math.min(parseInt(numValue), 10).toString() : "";
    handleInputChange(field, limitedValue);
  };

  // Handler Submit
  const handleSubmit = async () => {
    if (!isEditMode) {
      // Validation cho create mode
      if (!formData.code.trim() || formData.code.length !== 5) {
        alert("Vui lòng nhập mã giảm giá (5 ký tự in hoa, chữ và số)");
        return;
      }

      if (!formData.discountValue.trim()) {
        alert("Vui lòng nhập giá trị giảm giá");
        return;
      }

      if (!formData.usageLimitTotal.trim()) {
        alert("Vui lòng nhập giới hạn sử dụng");
        return;
      }
    }

    const payload = isEditMode 
      ? {
          // Chỉ gửi isActive khi edit
          isActive: formData.isActive
        }
      : {
          // Gửi full data khi create
          code: formData.code,
          discountValue: formData.discountValue,
          type: formData.type,
          usageLimitTotal: formData.usageLimitTotal,
          description: formData.description || undefined,
          usageLimitPerCustomer: formData.usageLimitPerCustomer || formData.usageLimitTotal,
          validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : new Date().toISOString(),
          name: formData.name || undefined,
          isActive: formData.isActive,
        };

    console.log("Submitting payload:", payload);

    try {
      setLoading(true);
      await onSubmit(payload);
      setInitialFormState(formData);
    } catch (error) {
      console.error("Lỗi:", error);
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
      navigate("/admin/discounts");
    }
  };

  const handleConfirmCancel = () => {
    setIsCancelDialogOpen(false);
    navigate("/admin/discounts");
  };

  // --- RENDER ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className={isEditMode ? "opacity-50 pointer-events-none" : ""}>
          <InputField
            label="Mã giảm giá"
            name="code"
            placeholder="VD: ABC12 (5 ký tự)"
            value={formData.code}
            onChange={handleCodeChange}
            required
            maxLength={5}
            disabled={isEditMode}
          />
        </div>

        <div className={isEditMode ? "opacity-50 pointer-events-none" : ""}>
          <InputField
            label="Tên mã giảm giá"
            name="name"
            placeholder="Nhập tên mã giảm giá (tùy chọn)..."
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={isEditMode}
          />
        </div>

        <div className={isEditMode ? "opacity-50 pointer-events-none" : ""}>
          <TextAreaField
            label="Mô tả"
            placeholder="Viết mô tả chi tiết (tùy chọn)..."
            value={formData.description}
            onChange={(e: any) => handleInputChange("description", e.target.value)}
            rows={4}
            disabled={isEditMode}
          />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isEditMode ? "opacity-50 pointer-events-none" : ""}`}>
          <InputField
            label="Giá trị giảm"
            name="discountValue"
            placeholder="VD: 10"
            type="number"
            value={formData.discountValue}
            onChange={(e: any) => handleInputChange("discountValue", e.target.value)}
            required
            disabled={isEditMode}
          />

          <SelectField
            label="Loại giảm giá"
            value={formData.type}
            onChange={(v: any) => handleSelectChange("type", v)}
            options={typeOptions}
            placeholder="Chọn loại giảm giá"
            isOpen={activeSelect === "type"}
            onToggle={() =>
              setActiveSelect(activeSelect === "type" ? null : "type")
            }
            disabled={isEditMode}
          />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isEditMode ? "opacity-50 pointer-events-none" : ""}`}>
          <InputField
            label="Giới hạn sử dụng tổng"
            name="usageLimitTotal"
            placeholder="VD: 9 (tối đa 10)"
            type="number"
            value={formData.usageLimitTotal}
            onChange={(e: any) => handleUsageLimitChange("usageLimitTotal", e.target.value)}
            required
            disabled={isEditMode}
          />

          <InputField
            label="Giới hạn/Khách hàng"
            name="usageLimitPerCustomer"
            placeholder="VD: 9 (tùy chọn)"
            type="number"
            value={formData.usageLimitPerCustomer}
            onChange={(e: any) => handleUsageLimitChange("usageLimitPerCustomer", e.target.value)}
            disabled={isEditMode}
          />
        </div>

        <div className={isEditMode ? "opacity-50 pointer-events-none" : ""}>
          <InputField
            label="Hiệu lực từ"
            name="validFrom"
            type="datetime-local"
            value={formData.validFrom}
            onChange={(e: any) => handleInputChange("validFrom", e.target.value)}
            disabled={isEditMode}
          />
        </div>

        {/* Trường isActive - CHỈ trường này được phép chỉnh sửa khi edit */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Trạng thái <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            {statusOptions.map((option) => (
              <label
                key={option.label}
                className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer transition-colors ${
                  formData.isActive === option.value
                    ? "bg-teal-50 border-teal-500 text-teal-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="isActive"
                  value={option.value.toString()}
                  checked={formData.isActive === option.value}
                  onChange={() => handleSelectChange("isActive", option.value)}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin tóm tắt
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã:</span>
              <span className="font-medium text-gray-900">
                {formData.code || "---"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giảm giá:</span>
              <span className="font-medium text-gray-900">
                {formData.discountValue 
                  ? `${formData.discountValue}${formData.type === "percentage" ? "%" : " VNĐ"}`
                  : "---"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giới hạn:</span>
              <span className="font-medium text-gray-900">
                {formData.usageLimitTotal || "---"} lần
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className={`font-medium ${formData.isActive ? "text-green-600" : "text-orange-600"}`}>
                {formData.isActive ? "Hoạt động" : "Không hoạt động"}
              </span>
            </div>
          </div>
        </div>

        {isEditMode && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">
              ⚠️ Chế độ chỉnh sửa
            </h4>
            <p className="text-xs text-yellow-800">
              Bạn chỉ có thể thay đổi trạng thái hoạt động của mã giảm giá. Các thông tin khác không thể chỉnh sửa.
            </p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            📋 Lưu ý
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Mã giảm giá: 5 ký tự in hoa (A-Z, 0-9)</li>
            <li>• Giới hạn tối đa: 10 lần sử dụng</li>
            <li>• Loại: Phần trăm hoặc số tiền cố định</li>
            <li>• Giới hạn/khách: Mặc định = giới hạn tổng</li>
          </ul>
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
                <Trash2 size={18} />
                <span className="hidden sm:inline">Xóa mã giảm giá</span>
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
                (loading || (isEditMode && !isFormDirty())) ? "opacity-70 cursor-not-allowed" : ""
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
              {isEditMode ? "Cập nhật trạng thái" : "Lưu mã giảm giá"}
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa mã giảm giá?"
        message="Bạn có chắc chắn muốn xóa mã giảm giá này không? Hành động này không thể hoàn tác."
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
    </div>
  );
};

export default DiscountForm;