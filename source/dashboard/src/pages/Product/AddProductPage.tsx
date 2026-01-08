import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/product/ProductForm/productForm";
import { createProduct } from "../../api/product";

const AddProductPage = () => {
  const navigate = useNavigate();

  const handleCreateProduct = async (formData: any) => {
    try {
      await createProduct(formData);
      alert("Thêm sản phẩm thành công!");
      navigate("/admin/products");
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
        <h1 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
      </div>
      <ProductForm isEditMode={false} onSubmit={handleCreateProduct} />
    </div>
  );
};

export default AddProductPage;
