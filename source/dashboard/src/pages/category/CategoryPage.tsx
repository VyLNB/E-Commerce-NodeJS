import { Button, SearchBox } from "../../components";
import CategoryTable from "../../components/category/categoryTable";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { getCategory } from "../../api/category";
import type { 
    CategoryItem,
    PaginationInfo,
    CategoryQueryParams
} from "../../interface/categoryInterface";
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import { PlusIcon } from "lucide-react";

const DEFAULT_QUERY_PARAMS: CategoryQueryParams = {
  page: 1,
  limit: 10,
  q: "",
};

const CategoryPage = () => {
  const navigate = useNavigate();
  const [categories, setCategory] = useState<CategoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [queryParams, setQueryParams] =
    useState<CategoryQueryParams>(DEFAULT_QUERY_PARAMS);

  // FIX: Gọi lại API mỗi khi page, limit, hoặc q thay đổi
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCategory(queryParams);

        if (response?.success && response?.data) {
          const categories = Array.isArray(response.data)
            ? response.data
            : response.data.categories;
          setCategory(categories || []);
          setPagination(response.data.pagination ?? null);
        }

      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
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
          placeholder="Tìm kiếm danh mục..."
          className="w-full max-w-md"
        />

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={() => navigate("/admin/categories/add")}>
            <PlusIcon size={20} />
            Thêm danh mục
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <CategoryTable
          categories={categories}
          pagination={pagination}
          loading={loading}
          error={error}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default CategoryPage;