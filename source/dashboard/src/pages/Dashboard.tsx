import { useState, useEffect } from 'react';
import { Users, Ban, CheckCircle, TrendingUp, ShoppingCart, DollarSign, Package, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getUsers } from '../api/user';
import { getDashboardData } from '../api/dashboard';
import type { UserItem } from '../interface/usersInterface';
import type { DashboardData } from '../interface/dashboardInterface';

const Dashboard = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartPeriod, setChartPeriod] = useState('day');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Màu sắc cho biểu đồ
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const STATUS_COLORS: { [key: string]: string } = {
    'pending': '#f59e0b',
    'processing': '#3b82f6',
    'shipped': '#8b5cf6',
    'delivered': '#10b981',
    'cancelled': '#ef4444',
    'returned': '#6b7280'
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Đang lấy dữ liệu...");
      
      // Lấy dữ liệu users
      const usersResponse = await getUsers();
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data.users);
      }

      // Lấy dữ liệu dashboard (orders)
      const dashData = await getDashboardData();
      setDashboardData(dashData);

      console.log("Lấy dữ liệu thành công");
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Lỗi khi tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Parse date từ format "HH:MM:SS DD/M/YYYY"
  const parseDate = (dateInput: Date | string) => {
    if (dateInput instanceof Date) {
      return dateInput;
    }
    
    try {
      const parts = dateInput.split(' ');
      if (parts.length === 2) {
        const datePart = parts[1];
        const [day, month, year] = datePart.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
    } catch (e) {
      console.error('Error parsing date:', dateInput, e);
    }
    
    return new Date(dateInput);
  };

  // Tạo dữ liệu cho biểu đồ khách hàng
  const getCustomerChartData = () => {
    const now = new Date();
    let data = [];

    if (chartPeriod === 'day') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
        
        const count = users.filter(user => {
          const userDate = parseDate(user.createdAt);
          return userDate.getDate() === date.getDate() &&
                 userDate.getMonth() === date.getMonth() &&
                 userDate.getFullYear() === date.getFullYear();
        }).length;

        data.push({ name: dateStr, customers: count });
      }
    } else if (chartPeriod === 'month') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        const monthStr = `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
        
        const count = users.filter(user => {
          const userDate = parseDate(user.createdAt);
          return userDate.getMonth() === date.getMonth() &&
                 userDate.getFullYear() === date.getFullYear();
        }).length;

        data.push({ name: monthStr, customers: count });
      }
    } else if (chartPeriod === 'year') {
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        
        const count = users.filter(user => {
          const userDate = parseDate(user.createdAt);
          return userDate.getFullYear() === year;
        }).length;

        data.push({ name: year.toString(), customers: count });
      }
    }

    return data;
  };

  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format số
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            const entryName = String(entry.name || entry.dataKey || '');
            const lowerName = entryName.toLowerCase();

            const isCurrency =
              lowerName.includes('doanh thu') ||
              lowerName.includes('revenue') ||
              entry.dataKey === 'revenue';

            const formattedValue = isCurrency
              ? formatCurrency(entry.value)
              : formatNumber(entry.value);

            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entryName}: {formattedValue}
              </p>
            );
          })}

        </div>
      );
    }
    return null;
  };

  const customerChartData = getCustomerChartData();
  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Lỗi tải dữ liệu</p>
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BIỂU ĐỒ TỔNG QUAN</h1>
          <p className="text-gray-600">Theo dõi và quản lý thông tin kinh doanh</p>
        </div>

        {/* Stats Cards Khách hàng */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thống Kê Khách Hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng Khách Hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đang Hoạt Động</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bị Khóa</p>
                  <p className="text-2xl font-bold text-red-600">{userStats.suspended}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ Khách hàng mới */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Khách Hàng Mới</h2>
                <p className="text-sm text-gray-500">Theo dõi xu hướng tăng trưởng</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setChartPeriod('day')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ngày
              </button>
              <button
                onClick={() => setChartPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tháng
              </button>
              <button
                onClick={() => setChartPeriod('year')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartPeriod === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Năm
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            {chartPeriod === 'day' ? (
              <LineChart data={customerChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Khách hàng mới"
                />
              </LineChart>
            ) : (
              <BarChart data={customerChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="customers" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]}
                  name="Khách hàng mới"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Phần Đơn Hàng - Mới thêm */}
        {dashboardData && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thống Kê Đơn Hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 mb-1">Tổng Doanh Thu</p>
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData.stats.totalRevenue)}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 mb-1">Tổng Đơn Hàng</p>
                      <p className="text-2xl font-bold">{formatNumber(dashboardData.stats.totalOrders)}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 mb-1">Giá Trị TB/Đơn</p>
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData.stats.averageOrderValue)}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 mb-1">Đơn Gần Đây</p>
                      <p className="text-2xl font-bold">{dashboardData.recentOrders.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biểu đồ Doanh thu & Trạng thái đơn hàng */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Doanh thu theo tháng */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Doanh Thu Theo Tháng</h2>
                    <p className="text-sm text-gray-500">12 tháng gần nhất</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      fill="#3b82f6" 
                      radius={[8, 8, 0, 0]}
                      name="Doanh thu (VNĐ)"
                    />
                    <Bar 
                      dataKey="orders" 
                      fill="#10b981" 
                      radius={[8, 8, 0, 0]}
                      name="Số đơn hàng"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Trạng thái đơn hàng */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Trạng Thái Đơn</h2>
                    <p className="text-sm text-gray-500">Phân bổ hiện tại</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={dashboardData.ordersByStatus.map(item => ({ ...item, [item.status]: item.count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ value }) => {
                        const total = dashboardData.ordersByStatus.reduce((sum, item) => sum + item.count, 0);
                        const percentage = ((value / total) * 100).toFixed(0);
                        return `${percentage}%`;
                      }}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {dashboardData.ordersByStatus.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.status.toLowerCase()] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {dashboardData.ordersByStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: STATUS_COLORS[item.status.toLowerCase()] || COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-gray-700 capitalize">{item.status}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top sản phẩm bán chạy */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Top Sản Phẩm Bán Chạy</h2>
                  <p className="text-sm text-gray-500">10 sản phẩm hàng đầu</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sản phẩm</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Số lượng</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.topProducts.map((product, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.productName}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">{product.productName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-700">
                          {formatNumber(product.totalQuantity)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(product.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;