import { useEffect, useState } from "react";
import SearchBox from "../../components/searchBox.tsx";
import { getOrders } from "../../api/orders.ts";
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import type { Order, PaginationInfo } from "../../interface/orderInterface.ts";
import OrderTable from "../../components/orders/orderTable.tsx";

const OrdersPage = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [displayOrders, setDisplayOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  const fetchOrders = async () => {
    try {
        setLoading(true);
        setError(null);

        const response = await getOrders();
        const orderList = response.data?.orders || [];
    
        if (response.data?.meta) {
            setPagination({
            page: response.data.meta.page,
            totalPages: response.data.meta.totalPages,
            total: response.data.meta.total,
            limit: response.data.meta.limit,
            });
        }

        setAllOrders(orderList);

        const currentLimit = response.data?.meta?.limit || 10;
        updateDisplayOrders(orderList, searchTerm, 1, currentLimit);
    } catch (error) {
        if (error instanceof Error) {
            setError(error.message);
        } else {
            setError("Lỗi khi tải danh sách đơn hàng");
        }
    } finally {
        setLoading(false);
    }
  };

  // Hàm cập nhật dữ liệu hiển thị và pagination
    const updateDisplayOrders = (
        orderList: Order[],
        search: string,
        page: number,
        limit: number
    ) => {
        console.log("🔍 updateDisplayOrders called with:", {
        orderListLength: orderList.length,
        search,
        page,
        limit
        });

        // Lọc theo search
        const filtered = search.trim() === ""
        ? orderList
        : orderList.filter((order) => {
            const orderNumber = order.orderNumber?.toLowerCase() || '';
            const fullName = order.userId?.fullName?.toLowerCase() || '';
            const email = order.userId?.email?.toLowerCase() || '';
            const searchLower = search.toLowerCase();
            
            return orderNumber.includes(searchLower) || 
                    fullName.includes(searchLower) ||
                    email.includes(searchLower);
            });

        console.log("🔎 Filtered orders:", filtered.length);

        // Tính toán pagination
        const totalOrders = filtered.length;
        const totalPages = Math.ceil(totalOrders / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedOrders = filtered.slice(startIndex, endIndex);

        setDisplayOrders(paginatedOrders);
        setPagination({
        page: page,
        totalPages,
        total: totalOrders,
        limit,
        });
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Cập nhật khi search thay đổi
    useEffect(() => {
        if (allOrders.length > 0) {
        console.log("🔄 Search term changed:", searchTerm);
        updateDisplayOrders(allOrders, searchTerm, 1, pagination.limit);
        }
    }, [searchTerm]);

    // const handleDeleteOrder = async (orderId: string) => {
    //     if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
    //         try {
    //             console.log("Xóa đơn hàng:", orderId);
    //             // await deleteOrder(orderId);

    //             // Cập nhật danh sách sau khi xóa
    //             const updatedOrders = allOrders.filter((order) => order._id !== orderId);
    //             setAllOrders(updatedOrders);
    //             updateDisplayOrders(updatedOrders, searchTerm, pagination.page, pagination.limit);
    //         } catch (error) {
    //             console.error("Lỗi khi xóa đơn hàng:", error);
    //             setError("Không thể xóa đơn hàng");
    //         }
    //     }
    // };

    const handlePageChange = (event: PaginatorPageChangeEvent) => {
        const newPage = event.page + 1;
        const newLimit = event.rows;
        updateDisplayOrders(allOrders, searchTerm, newPage, newLimit);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    return (
        <div className="container mx-auto p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">
                    Quản lý đơn hàng
                </h1>
                </div>
                <SearchBox onSearch={handleSearch} defaultValue={searchTerm} />
            </div>

            <div className="flex-1 min-h-0">
                <OrderTable
                    orders={displayOrders}
                    pagination={pagination}
                    loading={loading}
                    error={error}
                    onPageChange={handlePageChange}
                    allOrders={allOrders} // THÊM PROP NÀY để truyền toàn bộ danh sách
                />
            </div>
        </div>
    );
};

export default OrdersPage;