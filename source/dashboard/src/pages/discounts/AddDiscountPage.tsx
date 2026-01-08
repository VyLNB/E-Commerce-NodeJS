import { useNavigate } from "react-router-dom";
import { createDiscount } from "../../api/discounts";
import DiscountForm from "../../components/discounts/discountsForm";

const AddDiscountPage = () => {
  const navigate = useNavigate();

  const handleCreateDiscount = async (formData: any) => {
    try {
      console.log("Creating new discount with payload:", formData);
      
      // Chuẩn bị payload theo đúng format API yêu cầu
      const payload = {
        code: formData.code, // 5 ký tự in hoa, chữ và số
        discountValue: formData.discountValue, // "10"
        type: formData.type, // "percentage" hoặc "fixed_amount"
        usageLimitTotal: formData.usageLimitTotal, // "9" (max=10)
        description: formData.description || undefined, // optional
        usageLimitPerCustomer: formData.usageLimitPerCustomer || formData.usageLimitTotal, // optional, default=usageLimitTotal
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : new Date().toISOString(), // optional, default=Date.now()
        name: formData.name || undefined, // optional
      };

      console.log("Formatted payload:", payload);

      // Gọi API tạo mã giảm giá
      const response = await createDiscount(payload);
      
      console.log("API Response:", response);
      
      // Kiểm tra response và hiển thị thông báo thành công
      if (response) {
        alert(`Thêm mã giảm giá thành công!\nMã: ${response.code}`);
      } else {
        alert("Thêm mã giảm giá thành công!");
      }
      
      // Chuyển về trang danh sách mã giảm giá
      navigate("/admin/discounts");
      
    } catch (error: any) {
      console.error("Lỗi khi tạo mã giảm giá:", error);
      
      // Xử lý các loại lỗi cụ thể
      let errorMessage = "Lỗi không xác định";
      
      if (error.response) {
        // Lỗi từ server (status code 4xx, 5xx)
        errorMessage = error.response.data?.message || error.response.data?.error || `Lỗi ${error.response.status}`;
        
        // Xử lý các lỗi cụ thể
        if (error.response.status === 400) {
          errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin!";
        } else if (error.response.status === 409) {
          errorMessage = "Mã giảm giá đã tồn tại. Vui lòng sử dụng mã khác!";
        } else if (error.response.status === 401) {
          errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!";
        } else if (error.response.status === 403) {
          errorMessage = "Bạn không có quyền thực hiện thao tác này!";
        }
      } else if (error.request) {
        // Request đã được gửi nhưng không nhận được response
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!";
      } else {
        // Lỗi khác
        errorMessage = error.message || "Đã xảy ra lỗi!";
      }
      
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  return (
    <div className="p-6 container mx-auto overflow-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thêm mã giảm giá mới</h1>
      </div>
      <DiscountForm isEditMode={false} onSubmit={handleCreateDiscount} />
    </div>
  );
};

export default AddDiscountPage;