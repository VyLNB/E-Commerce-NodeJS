import { useState, useEffect } from "react";
import { getOrders } from "../../api/orders";
import type { Order } from "../../interface/orderInterface"

interface OrdersTableProps {
  userId: string;
}

export default function OrdersTable({ userId }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy tất cả orders từ API (có thể cần tăng limit để lấy nhiều hơn)
      const response = await getOrders({
        limit: 100, // Lấy nhiều orders để filter
        sort_by: "-createdAt",
      });

      // Filter ra những orders của user hiện tại
      const userOrders = response.data.orders.filter(
        (order) => order.userId._id === userId
      );

      setOrders(userOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Tính toán pagination
  const totalOrders = orders.length;
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; text: string }> = {
      Pending: { className: "bg-yellow-100 text-yellow-800", text: "Chờ xác nhận" },
      Confirmed: { className: "bg-blue-100 text-blue-800", text: "Đã xác nhận" },
      Processing: { className: "bg-purple-100 text-purple-800", text: "Đang xử lý" },
      Shipped: { className: "bg-indigo-100 text-indigo-800", text: "Đang giao" },
      Delivered: { className: "bg-green-100 text-green-800", text: "Đã giao" },
      Cancelled: { className: "bg-red-100 text-red-800", text: "Đã hủy" },
    };

    const config = statusConfig[status] || { className: "bg-gray-100 text-gray-800", text: status };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Đơn hàng ({totalOrders})
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">Người dùng chưa có đơn hàng nào</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 font-semibold">Mã đơn</th>
                  <th className="p-3 font-semibold">Sản phẩm</th>
                  <th className="p-3 font-semibold">Tổng tiền</th>
                  <th className="p-3 font-semibold">Trạng thái</th>
                  <th className="p-3 font-semibold">Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <span className="font-mono text-xs">{order.orderNumber}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {item.productId?.images?.[0] && (
                              <img
                                src={item.productId.images[0]}
                                alt={item.productId?.name || 'Product'}
                                className="w-8 h-8 object-cover rounded"
                              />
                            )}
                            <span className="text-xs truncate max-w-[200px]">
                              {item.productId?.name || 'Sản phẩm không tồn tại'} × {item.quantity}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{order.items.length - 2} sản phẩm khác
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{formatPrice(order.totalAmount)}</td>
                    <td className="p-3">{getStatusBadge(order.status)}</td>
                    <td className="p-3 text-gray-600">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, totalOrders)} của {totalOrders} đơn hàng
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="px-3 py-1 text-sm">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}