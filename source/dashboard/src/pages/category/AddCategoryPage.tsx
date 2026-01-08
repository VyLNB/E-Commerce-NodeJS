import { useNavigate } from "react-router-dom";
import CategoryForm  from "../../components/category/categoryForm";
import { createCategory } from "../../api/category";

const AddCategoryPage = () => {
  const navigate = useNavigate();

  const handleCreateProduct = async (formData: any) => {
    try {
      console.log("Creating new product with payload:", formData);
      const newProduct = await createCategory(formData);
      console.log("Success:", newProduct);
      alert("Thêm sản phẩm thành công!");
      navigate("/admin/categories");
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      alert(
        `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
      );
    }
  };

  return (
    <div className="p-6 container mx-auto overflow-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thêm danh mục mới</h1>
      </div>
      {/* <ProductForm isEditMode={false} onSubmit={handleCreateProduct} /> */}
      <CategoryForm isEditMode={false} onSubmit={handleCreateProduct} />
    </div>
  );
};

export default AddCategoryPage;
