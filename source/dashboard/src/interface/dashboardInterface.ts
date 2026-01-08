// Interface cho Dashboard Statistics
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  image?: string;
}

export interface CustomerGrowth {
  month: string;
  newCustomers: number;
  totalCustomers: number;
}

export interface DashboardData {
  stats: DashboardStats;
  ordersByStatus: OrderStatusCount[];
  revenueByMonth: RevenueByMonth[];
  topProducts: TopProduct[];
  customerGrowth: CustomerGrowth[];
  recentOrders: any[]; // Sử dụng Order interface từ orderInterface
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
  timestamp: string;
}