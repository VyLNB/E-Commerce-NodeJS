import type { Order, PaginationInfo } from "../../interface/orderInterface";
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { Link } from "react-router-dom";

interface OrderTableProps {
    orders: Order[];
    pagination: PaginationInfo | null;
    loading: boolean;
    error: string | null;
    onPageChange: (event: PaginatorPageChangeEvent) => void;
    onViewDetail?: (order: Order) => void; // ĐỔI THÀNH NHẬN order object thay vì orderId
    allOrders?: Order[]; // THÊM PROP NÀY để truyền toàn bộ danh sách
}

const OrderTable: React.FC<OrderTableProps> = ({
    orders,
    pagination,
    loading,
    error,
    onPageChange,
    allOrders, 
}) => {
    if (loading) {
        return (
            <div className="h-full flex justify-center items-center bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex justify-center items-center bg-white rounded-xl shadow-sm border border-gray-200 text-red-500 p-6">
                Lỗi tải dữ liệu: {error}
            </div>
        );
    }

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2 py-3 px-4">
            <span className="text-xl text-gray-800 font-bold">
                Danh sách đơn hàng
            </span>
        </div>
    );

    const orderNumberBodyTemplate = (order: Order) => {
        return (
            <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <span className="text-teal-600 font-semibold">
                        {order.orderNumber.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="ml-3">
                    <Link
                        to={`/admin/orders/${order._id}`}
                        state={{ 
                            order,                    // Truyền order hiện tại
                            orders: allOrders || []   // Truyền toàn bộ danh sách
                        }}
                        className="text-sm font-medium text-teal-600 hover:text-teal-800 hover:underline"
                    >
                        {order.orderNumber}
                    </Link>
                </div>
            </div>
        );
    };

    const customerNameBodyTemplate = (order: Order) => {
        return (
            <div className="text-sm text-gray-900">
                {order.userId?.fullName || 'N/A'}
            </div>
        );
    };

    const emailBodyTemplate = (order: Order) => {
        return (
            <div className="text-sm text-gray-600">
                {order.userId?.email || 'N/A'}
            </div>
        );
    };

    const statusBodyTemplate = (order: Order) => {
        const statusMap: { [key: string]: { label: string; color: string } } = {
            Pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
            Processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
            Shipped: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
            Delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
            Cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
        };

        const status = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.label}
            </span>
        );
    };

    const totalAmountBodyTemplate = (order: Order) => {
        return (
            <div className="text-sm font-semibold text-gray-900">
                {order.totalAmount.toLocaleString('vi-VN')}đ
            </div>
        );
    };

    const createdAtBodyTemplate = (order: Order) => {
        const date = new Date(order.createdAt);
        return (
            <div className="text-sm text-gray-600">
                {date.toLocaleDateString('vi-VN')}
            </div>
        );
    };

    const first = pagination
        ? (pagination.page - 1) * pagination.limit
        : 0;
    const totalRecords = pagination?.total || 0;
    const rows = pagination?.limit || 10;

    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DataTable
                value={orders}
                header={header}
                tableStyle={{ minWidth: "60rem" }}
                scrollable
                scrollHeight="flex"
                className="flex-1 min-h-0 text-sm"
                showGridlines={false}
                stripedRows
                removableSort
                dataKey="_id"
                emptyMessage="Không tìm thấy đơn hàng nào."
            >
                <Column
                    header="Mã đơn hàng"
                    body={orderNumberBodyTemplate}
                    style={{ minWidth: "200px" }}
                    frozen
                    className="font-medium"
                />
                <Column
                    header="Khách hàng"
                    body={customerNameBodyTemplate}
                    style={{ minWidth: "150px" }}
                />
                <Column
                    header="Email"
                    body={emailBodyTemplate}
                    style={{ minWidth: "200px" }}
                />
                <Column
                    header="Trạng thái"
                    body={statusBodyTemplate}
                    style={{ minWidth: "120px" }}
                    field="status"
                    sortable
                />
                <Column
                    header="Tổng tiền"
                    body={totalAmountBodyTemplate}
                    style={{ minWidth: "120px" }}
                    field="totalPrice"
                    sortable
                />
                <Column
                    header="Ngày tạo"
                    body={createdAtBodyTemplate}
                    style={{ minWidth: "120px" }}
                    sortable
                />
            </DataTable>

            <Paginator
                first={first}
                rows={rows}
                totalRecords={totalRecords}
                rowsPerPageOptions={[10, 20, 50]}
                onPageChange={onPageChange}
                className="border-t border-gray-200 shrink-0"
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="{first} - {last} của {totalRecords} đơn hàng"
            />
        </div>
    );
}

export default OrderTable;