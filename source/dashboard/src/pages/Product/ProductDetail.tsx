import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ProductItem } from "../../interface/productInterface";
import ProductForm from "../../components/product/ProductForm/productForm";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../api/product";
import { getFlexibleImageUrl } from "../../lib/utils";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await getProductById(id);
        const newImages = response.data.images.map((image) =>
          !image.includes("http://localhost:5000")
            ? getFlexibleImageUrl(image)
            : image
        );
        response.data.images = newImages;
        setProduct(response.data as ProductItem);
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdateProduct = async (formData: any) => {
    if (!id) return;
    try {
      console.log("Updating product with ID:", id, "Payload:", formData);
      const res = await updateProduct(id, formData);
      if (res.success) {
        console.log("Success:", formData);
        alert("Cập nhật sản phẩm thành công!");
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      alert(
        `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
      );
    }
  };

  const handleDeleteProduct = async () => {
    if (!id) return;
    try {
      console.log("Deleting product:", id);
      await deleteProduct(id);
      alert("Đã xóa sản phẩm thành công!");
      navigate("/admin/products", { replace: true });
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert(
        `Lỗi: ${error instanceof Error ? error.message : "Lỗi không xác định"}`
      );
      throw error;
    }
  };

  if (loading)
    return <div className="p-8 text-center">Đang tải dữ liệu sản phẩm...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!product)
    return <div className="p-8 text-center">Không tìm thấy sản phẩm</div>;

  return (
    <div className="p-6 container mx-auto overflow-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cập nhật sản phẩm</h1>
      </div>
      <ProductForm
        initialData={product}
        isEditMode={true}
        onSubmit={handleUpdateProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default ProductDetailPage;
