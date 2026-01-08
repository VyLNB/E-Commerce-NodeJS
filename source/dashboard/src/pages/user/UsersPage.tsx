import { useEffect, useState } from "react";
import SearchBox from "../../components/searchBox.tsx";
import { getUsers, deleteUser } from "../../api/user.ts";
import UserTable from "../../components/user/userTable.tsx";
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import type { UserItem, PaginationInfo } from "../../interface/usersInterface.ts";
// dùng khi mock api
// import { getUsersMock } from "../../api/mockAPI/mockUser.ts";

// Flag để chuyển đổi giữa mock và API thật
const USE_MOCK_API = false;

const UsersPage = () => {
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [displayUsers, setDisplayUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      let userList: UserItem[] = [];

      if (USE_MOCK_API) {
        console.log("Đang sử dụng Mock API để lấy danh sách users...");
        // const response = await getUsersMock();
        // userList = response.data ?? [];
      } else {
        console.log("Đang sử dụng API thật để lấy danh sách users...");
        const response = await getUsers();
        // Response có cấu trúc: { success, message, data: { users, meta }, timestamp }
        userList = response.data?.users || [];
        
        // Nếu API trả về pagination info, có thể sử dụng luôn
        if (response.data?.meta) {
          setPagination({
            page: response.data.meta.page,
            totalPages: response.data.meta.totalPages,
            total: response.data.meta.total,
            limit: response.data.meta.limit,
          });
        }
      }

      setAllUsers(userList);
      updateDisplayUsers(userList, searchTerm, pagination.page, pagination.limit);
      console.log("Lấy danh sách user thành công:", userList);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Lỗi khi tải danh sách người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm cập nhật dữ liệu hiển thị và pagination
  const updateDisplayUsers = (
    usersList: UserItem[],
    search: string,
    page: number,
    limit: number
  ) => {
    // Lọc theo search
    const filtered = search.trim() === ""
      ? usersList
      : usersList.filter(
          (user) =>
            user.fullName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        );

    // Tính toán pagination
    const totalUsers = filtered.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filtered.slice(startIndex, endIndex);

    setDisplayUsers(paginatedUsers);
    setPagination({
      page: page,
      totalPages,
      total: totalUsers,
      limit,
    });
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cập nhật khi search thay đổi
  useEffect(() => {
    updateDisplayUsers(allUsers, searchTerm, 1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        console.log("Xóa user:", userId);
        await deleteUser(userId);

        // Cập nhật danh sách sau khi xóa
        const updatedUsers = allUsers.filter((user) => user._id !== userId);
        setAllUsers(updatedUsers);
        updateDisplayUsers(updatedUsers, searchTerm, pagination.page, pagination.limit);
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        setError("Không thể xóa người dùng");
      }
    }
  };

  const handlePageChange = (event: PaginatorPageChangeEvent) => {
    const newPage = event.page + 1;
    const newLimit = event.rows;
    updateDisplayUsers(allUsers, searchTerm, newPage, newLimit);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="container mx-auto p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý khách hàng
          </h1>
          {USE_MOCK_API && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Demo Mode
            </span>
          )}
        </div>
        <SearchBox onSearch={handleSearch} defaultValue={searchTerm} />
      </div>

      <div className="flex-1 min-h-0">
        <UserTable
          users={displayUsers}
          pagination={pagination}
          loading={loading}
          error={error}
          onDeleteUser={handleDeleteUser}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default UsersPage;