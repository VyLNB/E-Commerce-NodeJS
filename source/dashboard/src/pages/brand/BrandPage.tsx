import { getBrands } from '../../api/brand';
import type { BrandQueryParams, BrandItem, PaginationInfo } from '../../interface/brandInterface';
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, SearchBox } from "../../components";
import BrandTable from '../../components/brands/brandTable';
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import { PlusIcon } from "lucide-react";



const DEFAULT_QUERY_PARAMS: BrandQueryParams = {
    page: 1,
    limit: 10,
    q: "",
}

const BrandPage = () => {
  const navigate = useNavigate();
  const [brands, setBrand] = useState<BrandItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [queryParams, setQueryParams] = useState<BrandQueryParams>(DEFAULT_QUERY_PARAMS);

// Bỏ useCallback ở fetchBrand, chuyển logic vào useEffect
  useEffect(() => {
    const fetchBrand = async () => {
        try {
            setLoading(true);
            setError(null);
        
            const response = await getBrands(queryParams);
        
            if (response?.success && response?.data) {
                const brands = Array.isArray(response.data)
                ? response.data
                : response.data.brands;
                setBrand(brands || []);
                setPagination(response.data.pagination ?? null);
            }

        } catch (err) {
            console.error("Lỗi khi tải thương hiệu:", err);
            setError(err instanceof Error ? err.message : "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    };

    fetchBrand();
  }, [queryParams.page, queryParams.limit, queryParams.q, queryParams.sort_by]);

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
            placeholder="Tìm kiếm thương hiệu..."
            defaultValue={queryParams.q}
            className="w-full max-w-md"
          />

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button onClick={() => navigate("/admin/brands/add")}>
              <PlusIcon size={20} />
              Thêm thương hiệu mới
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <BrandTable
            brands={brands}
            pagination={pagination}
            loading={loading}
            error={error}
            onPageChange={handlePageChange}
          />
        </div>
    </div>
  );
}
export default BrandPage;