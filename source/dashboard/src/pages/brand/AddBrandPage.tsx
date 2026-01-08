import { useNavigate } from "react-router-dom";
import BrandForm from "../../components/brands/brandForm";
import { createBrand } from "../../api/brand";

const AddBrandPage = () => {
  const navigate = useNavigate();

  const handleCreateBrand = async (formData: any) => {
    try {
      console.log("Creating new brand with payload:", formData);
      const newBrand = await createBrand(formData);
      console.log("Success:", newBrand);
      alert("Thêm thương hiệu thành công!");
      navigate("/admin/brands");
    } catch (error) {
      console.error("Lỗi khi tạo thương hiệu:", error);
      alert(
        `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
      );
    }
  };

  return (
    <div className="p-6 container mx-auto overflow-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thêm thương hiệu mới</h1>
      </div>
      <BrandForm isEditMode={false} onSubmit={handleCreateBrand} />
    </div>
  );
};

export default AddBrandPage;
