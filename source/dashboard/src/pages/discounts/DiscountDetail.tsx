import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DiscountForm from "../../components/discounts/discountsForm";
import type { CouponItem } from "../../interface/discountInterface";
import { disableDiscount } from "../../api/discounts";

const DiscountDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [discount, setDiscount] = useState<CouponItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Lấy discount từ state được truyền qua navigate
        const discountData = location.state?.discount as CouponItem | undefined;
        
        if (discountData) {
            setDiscount(discountData);
            setLoading(false);
        } else {
            // Nếu không có data (user refresh page hoặc direct access)
            // Redirect về trang danh sách
            navigate("/admin/discounts", { replace: true });
        }
    }, [id, location.state, navigate]);

    const handleUpdateDiscount = async (formData: any) => {
        if (!id) return;
        try {
            console.log("Updating discount status with ID:", id, "isActive:", formData.isActive);
            
            // Chỉ gọi API khi disable (isActive = false)
            if (!formData.isActive) {
                const response = await disableDiscount(id);
                console.log("API Response:", response);
                
                if (response.data) {
                    setDiscount(response.data);
                }
                
                alert("Đã vô hiệu hóa mã giảm giá!");
                navigate("/admin/discounts");
            } else {
                // Nếu enable, bạn cần API tương ứng
                alert("Chức năng kích hoạt lại chưa được hỗ trợ!");
                return;
            }
            
        } catch (error) {
            console.error("Lỗi khi cập nhật mã giảm giá:", error);
            alert(
                `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
            );
        }
    };

    const handleDeleteDiscount = async () => {
        if (!id) return;
        try {
            console.log("Deleting discount:", id);
            // TODO: Uncomment khi có API
            // await deleteDiscount(id);
            alert("Tính năng chưa được hỗ trợ!");
            navigate("/admin/discounts", { replace: true });
        } catch (error) {
            console.error("Lỗi khi xóa mã giảm giá:", error);
            alert(
                `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
            );
            throw error;
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Đang tải dữ liệu mã giảm giá...</div>;
    }
    
    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }
    
    if (!discount) {
        return <div className="p-8 text-center">Không tìm thấy mã giảm giá</div>;
    }

    return (
        <div className="p-6 container mx-auto overflow-auto pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Cập nhật mã giảm giá</h1>
            </div>
            <DiscountForm
                initialData={discount}
                isEditMode={true}
                onSubmit={handleUpdateDiscount}
                onDelete={handleDeleteDiscount}
            />
        </div>
    );
};

export default DiscountDetail;