import { Button, SearchBox } from "../../components";
import ProductTable from "../../components/product/productTable";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { getProducts } from "../../api/product";
import type {
  ProductItem,
  PaginationInfo,
  ProductQueryParams,
} from "../../interface/productInterface";
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import { PlusIcon } from "lucide-react";

const DEFAULT_QUERY_PARAMS: ProductQueryParams = {
  page: 1,
  limit: 10,
  q: "",
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] =
    useState<ProductQueryParams>(DEFAULT_QUERY_PARAMS);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProducts(queryParams);

      if (response?.success && response?.data) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Hàm xử lý khi Paginator thay đổi
  const handlePageChange = useCallback((event: PaginatorPageChangeEvent) => {
    setQueryParams((prev) => ({
      ...prev,
      page: event.page + 1,
      limit: event.rows,
    }));
  }, []);

  // Hàm xử lý khi SearchBox thay đổi
  const handleSearch = useCallback((searchTerm: string) => {
    setQueryParams((prev) => ({
      ...prev,
      q: searchTerm,
      page: 1,
    }));
  }, []);

  return (
    <div className="container h-full flex flex-col gap-4 mx-auto">
      <div className="flex items-center justify-between gap-4 shrink-0">
        <SearchBox
          onSearch={handleSearch}
          placeholder="Tìm kiếm sản phẩm..."
          defaultValue={queryParams.q}
          className="w-full max-w-md"
        />

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={() => navigate("/admin/products/add")}>
            <PlusIcon size={20} />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ProductTable
          products={products}
          pagination={pagination}
          loading={loading}
          error={error}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
