import { useState } from "react";
import CustomerInfo from "../../components/customerDetail/customInfoCard";
import OrdersTable from "../../components/customerDetail/orderTable";
import { updateUserStatus, type SingleUserResponse } from "../../api/user";
import type { UserItem } from "../../interface/usersInterface";

interface UserDetailPageProps {
  user: UserItem; // ĐỔI TỪ UserResponse SANG UserItem
  onBack?: () => void;
  onDelete?: (userID: string) => void;
  onStatusUpdated?: (updatedUser: UserItem) => void; // ĐỔI TỪ UserResponse SANG UserItem
}

const UserDetailPage = ({ user, onDelete, onStatusUpdated }: UserDetailPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  
  const isUserActive = currentUser.status === "active";
  const isSuspended = currentUser.status === "suspended";

  const getNextStatus = (): "active" | "suspended" => {
    return (isUserActive) ? "suspended" : "active";
  };

  const getButtonConfig = () => {
    if (isSuspended) {
      return {
        text: "Kích hoạt lại",
        className: "bg-blue-500 text-white hover:bg-blue-600"
      };
    }
    if (isUserActive) {
      return {
        text: "Vô hiệu hóa",
        className: "bg-yellow-500 text-white hover:bg-yellow-600"
      };
    }
    return {
      text: "Kích hoạt lại",
      className: "bg-green-500 text-white hover:bg-green-600"
    };
  };

  const handleToggleStatus = async () => {
    const newStatus = getNextStatus();
    setIsLoading(true);
    
    try {
      // API trả về SingleUserResponse
      const response: SingleUserResponse = await updateUserStatus(currentUser._id, newStatus);
      
      // Lấy data (UserItem) từ response
      setCurrentUser(response.data);
      
      if (onStatusUpdated) {
        onStatusUpdated(response.data);
      }
      
      const message = isSuspended 
        ? "Đã kích hoạt lại tài khoản từ trạng thái đình chỉ!"
        : `Đã ${newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"} tài khoản thành công!`;
      alert(message);
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (currentUser.status) {
      case "active":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Đang hoạt động</span>;
      case "inactive":
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Vô hiệu hóa</span>;
      case "suspended":
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">Bị đình chỉ</span>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Chi tiết khách hàng</h2>
          {getStatusBadge()}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleToggleStatus}
            className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              getButtonConfig().className
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : getButtonConfig().text}
          </button>

          <button
            onClick={() => onDelete && onDelete(currentUser._id)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
            disabled={!onDelete || isLoading}
          >
            Xóa khách hàng
          </button>
        </div>
      </div>

      {!isUserActive && (
        <div className={`mb-4 p-3 rounded-md ${
          isSuspended 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <p className={`text-sm ${isSuspended ? 'text-red-800' : 'text-yellow-800'}`}>
            {isSuspended 
              ? '🚫 Tài khoản này đã bị đình chỉ' 
              : '⚠️ Tài khoản này đã bị vô hiệu hóa'}
          </p>
        </div>
      )}

      <div className="p-6 space-y-8">
        <CustomerInfo user={currentUser} />

        <OrdersTable userId={currentUser._id} />

      </div>
    </div>
  );
};

export default UserDetailPage;