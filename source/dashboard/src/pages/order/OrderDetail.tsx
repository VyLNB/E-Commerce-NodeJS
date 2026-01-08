import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { Order } from "../../interface/orderInterface";
import { getOrders, updateOrderStatus } from "../../api/orders";

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Kiểm tra xem có order được truyền qua navigation state không
        if (location.state && location.state.order) {
          console.log("Using order from navigation state");
          setOrder(location.state.order);
          setLoading(false);
          return;
        }

        // Kiểm tra xem có danh sách orders được truyền qua state không
        if (location.state && location.state.orders) {
          console.log("Finding order in orders list from state");
          const foundOrder = location.state.orders.find(
            (o: Order) => o._id === id
          );
          if (foundOrder) {
            setOrder(foundOrder);
            setLoading(false);
            return;
          }
        }

        // Nếu không có data trong state, mới gọi API
        console.log("Fetching orders from API");
        const response = await getOrders({ limit: 100 });
        
        if (response.success && response.data && response.data.orders) {
          const foundOrder = response.data.orders.find(
            (order: Order) => order._id === id
          );
          
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            throw new Error("Order not found");
          }
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (err) {
        setError("Không thể tải thông tin đơn hàng");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, location.state]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Processing: "bg-blue-100 text-blue-800 border-blue-300",
      Shipped: "bg-purple-100 text-purple-800 border-purple-300",
      Delivered: "bg-green-100 text-green-800 border-green-300",
      Cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Pending: "Chờ xử lý",
      Processing: "Đang xử lý",
      Shipped: "Đang giao hàng",
      Delivered: "Đã giao hàng",
      Cancelled: "Đã hủy",
    };
    return labels[status] || status;
  };

  const statusOptions = [
    { value: "Pending", label: "Chờ xử lý" },
    { value: "Processing", label: "Đang xử lý" },
    { value: "Shipped", label: "Đang giao hàng" },
    { value: "Delivered", label: "Đã giao hàng" },
    { value: "Cancelled", label: "Đã hủy" },
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !id || newStatus === order.status) return;

    if (window.confirm(`Xác nhận thay đổi trạng thái đơn hàng thành "${getStatusLabel(newStatus)}"?`)) {
      try {
        setIsUpdatingStatus(true);
        
        // Gọi API để cập nhật trạng thái
        const response = await updateOrderStatus(id, newStatus as any);
        
        if (response.success) {
          // Cập nhật state local
          setOrder({ ...order, status: newStatus, updatedAt: new Date().toISOString() });
          alert("Cập nhật trạng thái thành công!");
        } else {
          throw new Error(response.message || "Cập nhật thất bại");
        }
      } catch (err) {
        console.error("Error updating status:", err);
        alert(`Lỗi khi cập nhật trạng thái: ${err instanceof Error ? err.message : "Lỗi không xác định"}`);
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang tải dữ liệu đơn hàng...</p>
      </div>
    );
  
  if (error) 
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate("/admin/orders")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  
  if (!order)
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">Không tìm thấy đơn hàng</p>
        <button
          onClick={() => navigate("/admin/orders")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );

  return (
    <div className="p-6 container mx-auto overflow-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng</h1>
          <p className="text-gray-600 mt-1">Mã đơn: {order.orderNumber}</p>
        </div>
        <button
          onClick={() => navigate("/admin/orders")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Trạng thái đơn hàng
              </h2>
              <div className="relative">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdatingStatus}
                  className={`px-4 py-2 pr-10 rounded-full text-sm font-semibold border-2 appearance-none cursor-pointer transition-all ${getStatusColor(
                    order.status
                  )} ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Ngày tạo</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Cập nhật lần cuối</p>
                <p className="font-medium">{formatDate(order.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Sản phẩm đã đặt ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                >
                  {item.productId?.images?.[0] ? (
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name || 'Product'}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">
                      {item.productId?.name || 'Sản phẩm không tồn tại'}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Số lượng: <span className="font-medium">{item.quantity}</span></p>
                      <p>Đơn giá: <span className="font-medium">{formatCurrency(item.unitPrice)}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-1">Thành tiền</p>
                    <p className="font-semibold text-lg text-blue-600">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Địa chỉ giao hàng
            </h2>
            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">Người nhận:</span>
                <span className="text-gray-900">{order.shippingAddress.recipientName}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">Số điện thoại:</span>
                <span className="text-gray-900">{order.shippingAddress.phone}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 w-32">Địa chỉ:</span>
                <span className="text-gray-900">
                  {order.shippingAddress.street}, {order.shippingAddress.ward},{" "}
                  {order.shippingAddress.district}, {order.shippingAddress.city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin khách hàng
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {order.userId.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.userId.fullName}</p>
                  <p className="text-sm text-gray-600">{order.userId.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin thanh toán
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Phương thức:</span>
                <span className="text-gray-900">{order.paymentDetails.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Trạng thái:</span>
                {order.paymentDetails.paidAt ? (
                  <span className="text-green-600 font-medium">✓ Đã thanh toán</span>
                ) : (
                  <span className="text-yellow-600 font-medium">⏳ Chưa thanh toán</span>
                )}
              </div>
              {order.paymentDetails.paidAt && (
                <div className="pt-2 border-t">
                  <span className="font-medium text-gray-700">Ngày thanh toán:</span>
                  <p className="text-gray-900 mt-1">{formatDate(order.paymentDetails.paidAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Tổng kết đơn hàng
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">{formatCurrency(order.subtotalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span className="font-medium">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế</span>
                  <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                </div>
              )}
              {order.shippingAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">{formatCurrency(order.shippingAmount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold text-lg">Tổng cộng</span>
                <span className="font-bold text-xl text-blue-600">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;