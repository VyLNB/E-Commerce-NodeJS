"use client";

import { Tab, TabGroup, TabList } from "@headlessui/react";
import clsx from "clsx";
import { Calendar, Hash, Package, Search, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency, getFlexibleImageUrl } from "@/lib/utils";
import { getMyOrders, Order } from "@/api/order";
import { toast } from "react-toastify";
import { Spinner } from "@/public/icons";

const orderStatuses = [
  "All",
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrdersPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Fetching page 1 with a larger limit to support client-side filtering for now
        const data = await getMyOrders(1, 50);
        setOrders(data.orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Không thể tải danh sách đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const selectedStatus = orderStatuses[selectedIndex];

    return orders.filter((order) => {
      // 1. Filter by status (Client-side)
      // Note: "All" matches everything. Otherwise, exact match on status string.
      const statusMatch =
        selectedStatus === "All" || order.status === selectedStatus;

      // 2. Filter by search term (Order Number or Product Name)
      const searchMatch =
        searchTerm.trim() === "" ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.productId?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return statusMatch && searchMatch;
    });
  }, [selectedIndex, searchTerm, orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Processing":
      case "Confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default: // Pending
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <section className="">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Danh sách đơn hàng
        </h1>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
          <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <TabList className="flex flex-wrap border-b border-gray-200 -mb-px">
              {orderStatuses.map((status) => (
                <Tab
                  key={status}
                  className={({ selected }) =>
                    clsx(
                      "py-2 px-4 font-medium border-b-2 outline-none transition text-sm sm:text-base",
                      selected
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                    )
                  }
                >
                  {status}
                </Tab>
              ))}
            </TabList>
          </TabGroup>

          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-800">
                        Order{" "}
                        <span className="text-blue-600">
                          #{order.orderNumber}
                        </span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="mx-1">|</span>
                      <User className="h-4 w-4" />
                      <span>{order.shippingAddress?.recipientName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    {/* Payment Status (Simplified) */}
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Package size={16} />
                      {order.paymentDetails.method}
                    </span>
                  </div>
                </div>

                {/* Products */}
                <div className="p-4">
                  <div className="space-y-6 divide-y divide-gray-100">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order._id}-item-${index}`}
                        className="flex items-start gap-4 pt-4 first:pt-0"
                      >
                        <div className="flex-shrink-0 border border-gray-200 rounded-md overflow-hidden">
                          <Image
                            width={80}
                            height={80}
                            src={getFlexibleImageUrl(
                              item.productId?.images?.[0]
                            )}
                            alt={item.productId?.name || "Product Image"}
                            className="object-cover h-20 w-20"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold text-gray-800 line-clamp-1">
                            {item.productId?.name}
                          </p>
                          {/* Note: Server currently doesn't return variant name in populated items, 
                              so we might only show quantity/price or need backend adjustment */}
                          <p className="text-sm text-gray-500 mt-1">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            {formatCurrency(item.totalPrice)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.unitPrice)} / ea
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-gray-800">
                      Total:{" "}
                      <span className="text-blue-600">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </p>
                  </div>
                  {/* Action Buttons based on status could go here */}
                  {order.status === "Delivered" && (
                    <button className="px-4 py-2 text-sm border border-gray-300 font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 transition">
                      Return Item
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <Package className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">Không tìm thấy đơn hàng nào.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
