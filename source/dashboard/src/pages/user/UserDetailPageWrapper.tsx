import { useParams, useLocation, useNavigate } from "react-router-dom";
import UserDetailPage from "./UserDetailPage";
import { useState, useEffect } from "react";
import { getUserById, deleteUser } from "../../api/user";
import { getUserByIdMock, deleteUserMock } from "../../api/mockAPI/mockUser";
import type { UserItem } from "../../interface/usersInterface";

// Flag để chuyển đổi giữa mock và API thật
const USE_MOCK_API = false;

const UserDetailPageWrapper = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserItem | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const userFromState = location.state?.user as UserItem | undefined;

    useEffect(() => {
        // Nếu đã có user từ state thì không cần fetch
        if (userFromState) {
            setUser(userFromState);
            return;
        }

        // Nếu không có id thì return
        if (!id) {
            setError("ID người dùng không hợp lệ");
            return;
        }

        // Fetch user data từ API
        const fetchUserDetail = async () => {
            try {
                setLoading(true);
                setError(null);

                let userData: UserItem;

                if (USE_MOCK_API) {
                    console.log("Đang lấy chi tiết user từ Mock API...");
                    const response = await getUserByIdMock(id);
                    userData = response.data!;
                } else {
                    console.log("Đang lấy chi tiết user từ API thật...");
                    const response = await getUserById(id);
                    userData = response.data; // response.data là UserItem
                }

                setUser(userData);
                console.log("Lấy chi tiết user thành công:", userData);

            } catch (err) {
                console.error("Lỗi khi lấy chi tiết user:", err);
                setError(err instanceof Error ? err.message : "Không thể tải thông tin người dùng");
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetail();
    }, [id, userFromState]);

    const handleBack = () => {
        navigate('/admin/users');
    };

    const handleDeleteUser = async () => {
        if (!user) return;
        
        if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${user.fullName}"?`)) {
            try {
               setLoading(true);
                
                if (USE_MOCK_API) {
                    console.log("Đang xóa user bằng Mock API:", user._id);
                    await deleteUserMock(user._id);
                    console.log("Xóa user thành công (mock)");
                } else {
                    console.log("Đang xóa user bằng API thật:", user._id);
                    await deleteUser(user._id);
                }

                alert("Xóa khách hàng thành công!");
                navigate('/admin/users');
            } catch (error) {
                console.error("Lỗi khi xóa người dùng:", error);
                alert("Không thể xóa người dùng");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleStatusUpdated = (updatedUser: UserItem) => {
        setUser(updatedUser);
    };

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
                    <h2 className="text-xl font-bold mb-2 text-red-600">Có lỗi xảy ra</h2>
                    <p className="text-red-700 mb-4">{error}</p>
                    <div className="space-x-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Thử lại
                        </button>
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Quay lại danh sách
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // User not found
    if (!user) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center py-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-600">Không tìm thấy người dùng</h2>
                    <p className="text-gray-500 mb-4">Người dùng với ID {id} không tồn tại.</p>
                    <button 
                        onClick={handleBack}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <UserDetailPage 
            user={user} 
            onBack={handleBack}
            onDelete={handleDeleteUser}
            onStatusUpdated={handleStatusUpdated}
        />
    );
};

export default UserDetailPageWrapper;