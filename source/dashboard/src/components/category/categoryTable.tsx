import type {
  CategoryItem,
  PaginationInfo,
} from "../../interface/categoryInterface";
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { Link } from "react-router-dom";
import { getFlexibleImageUrl } from "../../lib/utils";

interface CategoryTableProps {
  categories: CategoryItem[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  onPageChange: (event: PaginatorPageChangeEvent) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  pagination,
  loading,
  error,
  onPageChange,
}) => {
  const imageBodyTemplate = (category: CategoryItem) => {
    if (!category.imageUrl || category.imageUrl.length === 0) {
      // Placeholder khi không có ảnh
      return (
        <div className="w-12 h-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
          No Img
        </div>
      );
    }
    return (
      <img
        src={getFlexibleImageUrl(category.imageUrl)}
        alt={category.name}
        className="w-12 h-12 object-cover rounded border border-gray-200"
      />
    );
  };

  const getSeverity = (category: CategoryItem) => {
    switch (category.isActive) {
      case true:
        return "success";
      case false:
        return "warning";
      default:
        return null;
    }
  };

  const statusBodyTemplate = (category: CategoryItem) => {
    return (
      <Tag
        value={category.isActive ? "Hoạt động" : "Không hoạt động"}
        severity={getSeverity(category)}
      />
    );
  };

  const nameBodyTemplate = (category: CategoryItem) => {
    return (
      <Link
        to={`/admin/categories/${category?._id}`}
        className="font-medium text-teal-600 hover:text-teal-800 hover:underline"
      >
        {category?.name}
      </Link>
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
        Danh sách danh mục sản phẩm
      </span>
    </div>
  );

  // tìm kiếm danh mục cha từ API trả về
  const parentCategoryTemplate = (category: CategoryItem) => {
    if (!category.parentCategoryId) {
      return (
        <span className="text-gray-400 italic">Không có danh mục cha</span>
      );
    }

    const parent = categories.find((c) => c._id === category.parentCategoryId);

    return <span>{parent ? parent.name : "Không xác định"}</span>;
  };

  const descriptionBodyTemplate = (category: CategoryItem) => {
    return (
      <div className="max-w-xs truncate" title={category.description}>
        {category.description || "Không có mô tả"}
      </div>
    );
  };

  const first = pagination
    ? (pagination.currentPage - 1) * pagination.limit
    : 0;
  const totalRecords = pagination?.totalItems || 0;
  const rows = pagination?.limit || 10;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <DataTable
        value={categories}
        header={header}
        tableStyle={{ minWidth: "80rem" }}
        scrollable
        scrollHeight="flex"
        className="flex-1 min-h-0 text-sm"
        showGridlines={false}
        stripedRows
        removableSort
        dataKey="_id"
        emptyMessage="Không tìm thấy danh mục nào."
      >
        <Column
          field="name"
          header="Danh mục"
          body={nameBodyTemplate}
          style={{ minWidth: "250px" }}
          frozen
          className="font-medium"
        />
        <Column
          header="Hình ảnh"
          body={imageBodyTemplate}
          style={{ minWidth: "100px" }}
        />
        <Column
          field="price"
          header="Danh mục cha"
          // sortable
          body={parentCategoryTemplate}
          style={{ minWidth: "150px" }}
        />
        <Column
          field="description"
          header="Mô tả"
          body={descriptionBodyTemplate}
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="isActive"
          header="Trạng thái"
          body={statusBodyTemplate}
          style={{ minWidth: "120px" }}
          sortable
          dataType="boolean"
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
        currentPageReportTemplate="{first} - {last} của {totalRecords} danh mục"
      />
    </div>
  );
};

export default CategoryTable;
