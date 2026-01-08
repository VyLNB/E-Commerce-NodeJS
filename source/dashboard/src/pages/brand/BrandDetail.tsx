import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { BrandItem } from "../../interface/brandInterface";
import { deleteBrand, getBrandById, updateBrand } from "../../api/brand";
import BrandForm from "../../components/brands/brandForm";

const BrandDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [category, setCategory] = useState<BrandItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchBrand = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await getBrandById(id);
            setCategory(response.data as BrandItem);
        } catch (err) {
            setError("Không thể tải thông tin thương hiệu");
            console.error(err);
        } finally {
            setLoading(false);
        }
      };

      fetchBrand();
  }, [id]);

     const handleUpdateBrand = async (formData: any) => {
        if (!id) return;
        try {
          console.log("Updating brand with ID:", id, "Payload:", formData);
          await updateBrand(id, formData);
          console.log("Success:", formData);
          alert("Cập nhật thương hiệu thành công!");
          navigate("/admin/brands");
        } catch (error) {
          console.error("Lỗi khi cập nhật thương hiệu:", error);
          alert(
            `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
          );
        }
      };
    
      const handleDeleteBrand = async () => {
        if (!id) return;
        try {
          console.log("Deleting brand:", id);
          await deleteBrand(id);
          alert("Đã xóa thương hiệu thành công!");
          navigate("/admin/brands", { replace: true });
        } catch (error) {
          console.error("Lỗi khi xóa danh mục:", error);
          alert(
            `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
          );
          throw error;
        }
      };

    if (loading)
    return <div className="p-8 text-center">Đang tải dữ liệu thương hiệu...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!category)
        return <div className="p-8 text-center">Không tìm thấy thương hiệu</div>;

    return (
        <div className="p-6 container mx-auto overflow-auto pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Cập nhật thương hiệu</h1>
            </div>
            <BrandForm
                initialData={category}
                isEditMode={true}
                onSubmit={handleUpdateBrand}
                onDelete={handleDeleteBrand}
            />
        </div>
    );
};
export default BrandDetail;