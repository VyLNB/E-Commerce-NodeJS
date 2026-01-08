import { getCoupons } from "../../api/discounts";
import type { CouponItem, DiscountQueryParams } from "../../interface/discountInterface";
import type { PaginationInfo } from "../../interface/discountInterface";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import DiscountTable from "../../components/discounts/discountsTable";
import { PlusIcon } from "lucide-react";
import { Button, SearchBox } from "../../components";

const DEFAULT_QUERY_PARAMS: DiscountQueryParams = {
  page: 1,
  limit: 10,
  q: "",
};

const DiscountPage = () => {
    const navigate = useNavigate();
    const [discount, setDiscount] = useState<CouponItem[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [queryParams, setQueryParams] =
        useState<DiscountQueryParams>(DEFAULT_QUERY_PARAMS);

    // const fetchDiscount = useCallback(async () => {
    //     try {
    //         setLoading(true);
    //         setError(null);

    //         const response = await getCoupons(queryParams);

    //         if (response?.success && response?.data) {
    //             setDiscount(response.data.items);
    //             setPagination(response.data.meta);
    //         }
    //     } catch (err) {
    //         console.error("Lỗi khi tải mã giảm giá:", err);
    //         setError(err instanceof Error ? err.message : "Lỗi không xác định");
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [queryParams]);

    // useEffect(() => {
    //     fetchDiscount();
    // }, []);

    useEffect(() => {
      const fetchDiscount = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getCoupons(queryParams);

            if (response?.success && response?.data) {
                setDiscount(response.data.items);
                setPagination(response.data.meta);
            }
        } catch (err) {
            console.error("Lỗi khi tải mã giảm giá:", err);
            setError(err instanceof Error ? err.message : "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
      };

      fetchDiscount();
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
          placeholder="Tìm kiếm mã giảm giá..."
          defaultValue={queryParams.q}
          className="w-full max-w-md"
        />

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={() => navigate("/admin/discounts/add")}>
            <PlusIcon size={20} />
            Thêm mã giảm giá
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DiscountTable
          discounts={discount}
          pagination={pagination}
          loading={loading}
          error={error}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
    );
};

export default DiscountPage;