import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteCategory, getCategoryById, updateCategory } from "../../api/category";
import type { CategoryItem } from "../../interface/categoryInterface";
import CategoryForm from "../../components/category/categoryForm";

const CategoryDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [category, setCategory] = useState<CategoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchCategory = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await getCategoryById(id);
            setCategory(response.data as CategoryItem);
        } catch (err) {
            setError("Không thể tải thông tin danh mục");
            console.error(err);
        } finally {
            setLoading(false);
        }
      };

      fetchCategory();
  }, [id]);

     const handleUpdateCategory = async (formData: any) => {
        if (!id) return;
        try {
          console.log("Updating category with ID:", id, "Payload:", formData);
          await updateCategory(id, formData);
          console.log("Success:", formData);
          alert("Cập nhật danh mục thành công!");
          navigate("/admin/categories");
        } catch (error) {
          console.error("Lỗi khi cập nhật danh mục:", error);
          alert(
            `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
          );
        }
      };
    
      const handleDeleteCategory = async () => {
        if (!id) return;
        try {
          console.log("Deleting category:", id);
          await deleteCategory(id);
          alert("Đã xóa danh mục thành công!");
          navigate("/admin/categories", { replace: true });
        } catch (error) {
          console.error("Lỗi khi xóa danh mục:", error);
          alert(
            `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
          );
          throw error;
        }
      };

    if (loading)
    return <div className="p-8 text-center">Đang tải dữ liệu danh mục...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!category)
        return <div className="p-8 text-center">Không tìm thấy danh mục</div>;

    return (
        <div className="p-6 container mx-auto overflow-auto pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Cập nhật danh mục</h1>
            </div>
            <CategoryForm
                initialData={category}
                isEditMode={true}
                onSubmit={handleUpdateCategory}
                onDelete={handleDeleteCategory}
            />
        </div>
    );
};
export default CategoryDetail;