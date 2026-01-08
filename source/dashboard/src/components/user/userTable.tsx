import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { Link } from "react-router-dom";
import DeleteBtn from "../deleteBtn";
import type { UserItem, PaginationInfo } from "../../interface/usersInterface";


interface UserTableProps {
  users: UserItem[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  onDeleteUser: (userId: string) => void;
  onPageChange: (event: PaginatorPageChangeEvent) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  pagination,
  loading,
  error,
  onDeleteUser,
  onPageChange,
}) => {
  // Template cho avatar và tên
  const nameBodyTemplate = (user: UserItem) => {
    return (
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0 overflow-hidden">
          {user.avatar ? (
            // Nếu CÓ avatar → hiển thị ảnh
            <img
              src={user.avatar}
              alt={user.fullName}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback nếu ảnh lỗi
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `
                  <span class="text-teal-600 font-semibold">
                    ${user.fullName.charAt(0).toUpperCase()}
                  </span>
                `;
              }}
            />
          ) : (
            // Nếu KHÔNG có avatar → hiển thị chữ cái đầu
            <span className="text-teal-600 font-semibold">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="ml-3">
          <Link
            to={`/admin/users/${user._id}`}
            state={{ user }}
            className="text-sm font-medium text-teal-600 hover:text-teal-800 hover:underline"
          >
            {user.fullName}
          </Link>
          <div className={`text-xs ${user.role === "admin" ? "text-orange-600 font-medium" : "text-gray-500"}`}>
            {user.role === "customer" ? "Khách hàng" : "Quản trị viên"}
          </div>
        </div>
      </div>
    );
  };

  // Template cho email
  const emailBodyTemplate = (user: UserItem) => {
    return (
      <div>
        <div className="text-sm text-gray-900">{user.email}</div>
        {user.email && (
          <div className="text-xs text-green-600">✓ Đã xác thực</div>
        )}
      </div>
    );
  };

  // Template cho điểm thưởng
  const loyaltyPointsBodyTemplate = (user: UserItem) => {
    return (
      <span className="text-sm font-medium text-teal-600">
        {user.loyaltyPoints.toLocaleString()} điểm
      </span>
    );
  };

  // Template cho trạng thái
  const statusBodyTemplate = (user: UserItem) => {
    return (
      <Tag
        value={user.status == 'active' ? "Hoạt động" : "Không hoạt động"}
        severity={getSeverity(user)}
      />
    );
  };

  const getSeverity = (user: UserItem) => {
    switch (user.status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "suspended":
        return "danger";
      default:
        return null;
    }
  };

  // Template cho action buttons
  const actionBodyTemplate = (user: UserItem) => {
    return (
      <div className="flex justify-center">
        <DeleteBtn
          onDelete={() => onDeleteUser(user._id)}
          disabled={user.role === "admin"}
        />
      </div>
    );
  };

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
        Danh sách khách hàng
      </span>
    </div>
  );

  const first = pagination
    ? (pagination.page - 1) * pagination.limit
    : 0;
  const totalRecords = pagination?.total || 0;
  const rows = pagination?.limit || 10;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <DataTable
        value={users}
        header={header}
        tableStyle={{ minWidth: "60rem" }}
        scrollable
        scrollHeight="flex"
        className="flex-1 min-h-0 text-sm"
        showGridlines={false}
        stripedRows
        removableSort
        dataKey="_id"
        emptyMessage="Không tìm thấy khách hàng nào."
      >
        <Column
          header="Tên"
          body={nameBodyTemplate}
          style={{ minWidth: "250px" }}
          frozen
          className="font-medium"
        />
        <Column
          header="Email"
          body={emailBodyTemplate}
          field="email"
          style={{ minWidth: "200px" }}
          sortable
        />
        <Column
          header="Điểm thưởng"
          field="loyaltyPoints"
          body={loyaltyPointsBodyTemplate}
          style={{ minWidth: "150px" }}
          sortable
        />
        <Column
          header="Trạng thái"
          field="status"
          body={statusBodyTemplate}
          style={{ minWidth: "120px" }}
          sortable
        />
        <Column
          header="Hành động"
          body={actionBodyTemplate}
          style={{ minWidth: "120px" }}
          className="text-center"
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
        currentPageReportTemplate="{first} - {last} của {totalRecords} khách hàng"
      />
    </div>
  );
};

export default UserTable;