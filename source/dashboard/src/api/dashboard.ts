import type { DashboardData, DashboardStats, OrderStatusCount, RevenueByMonth, TopProduct } from "../interface/dashboardInterface";
import { getOrders } from "./orders";
import { getUsers } from "./user";
import type { CustomerGrowth } from "../interface/dashboardInterface";

// Nếu backend chưa có API dashboard tổng hợp, ta sẽ tự xử lý từ API orders và users
export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Lấy tất cả orders và users
    const [ordersResponse, usersResponse] = await Promise.all([
      getOrders({ limit: 1000 }), // Lấy nhiều orders để tính toán
      getUsers({ limit: 1000 })
    ]);

    const orders = ordersResponse.data.orders;
    const users = usersResponse.data.users;

    // Tính toán statistics
    const stats = calculateStats(orders, users);
    const ordersByStatus = calculateOrdersByStatus(orders);
    const revenueByMonth = calculateRevenueByMonth(orders);
    const topProducts = calculateTopProducts(orders);
    const customerGrowth = calculateCustomerGrowth(users);
    const recentOrders = orders.slice(0, 10); // 10 đơn hàng gần nhất

    return {
      stats,
      ordersByStatus,
      revenueByMonth,
      topProducts,
      customerGrowth,
      recentOrders
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

// Helper functions để tính toán metrics
function calculateStats(orders: any[], users: any[]): DashboardStats {
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = users.filter(u => u.role === "customer").length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    averageOrderValue
  };
}

function calculateOrdersByStatus(orders: any[]): OrderStatusCount[] {
  const statusMap = new Map<string, number>();
  
  orders.forEach(order => {
    const status = order.status || "Unknown";
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const total = orders.length;
  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  }));
}

function calculateRevenueByMonth(orders: any[]): RevenueByMonth[] {
  const monthMap = new Map<string, { revenue: number; orders: number }>();

  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const current = monthMap.get(monthKey) || { revenue: 0, orders: 0 };
    current.revenue += order.totalAmount || 0;
    current.orders += 1;
    monthMap.set(monthKey, current);
  });

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Lấy 12 tháng gần nhất
}

function calculateTopProducts(orders: any[]): TopProduct[] {
  const productMap = new Map<string, { name: string; quantity: number; revenue: number; image?: string }>();

  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const productId = item.productId?._id || item.productId;
      const productName = item.productId?.name || "Unknown Product";
      const productImage = item.productId?.images?.[0];
      
      const current = productMap.get(productId) || { name: productName, quantity: 0, revenue: 0, image: productImage };
      current.quantity += item.quantity || 0;
      current.revenue += item.totalPrice || 0;
      productMap.set(productId, current);
    });
  });

  return Array.from(productMap.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      totalQuantity: data.quantity,
      totalRevenue: data.revenue,
      image: data.image
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10); // Top 10 sản phẩm
}

function calculateCustomerGrowth(users: any[]): CustomerGrowth[] {
  const customers = users.filter(u => u.role === "customer");
  const monthMap = new Map<string, number>();

  customers.forEach(user => {
    // Parse createdAt format "11:27:15 23/9/2025"
    const dateStr = user.createdAt;
    if (dateStr) {
      const parts = dateStr.split(' ');
      if (parts.length === 2) {
        const [day, month, year] = parts[1].split('/');
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
      }
    }
  });

  const sortedMonths = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]));

  let totalCustomers = 0;
  return sortedMonths.map(([month, newCustomers]) => {
    totalCustomers += newCustomers;
    return {
      month,
      newCustomers,
      totalCustomers
    };
  }).slice(-12); // 12 tháng gần nhất
}

