import type { BrandItem, PaginationInfo } from "../../interface/brandInterface";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";
import { Tag } from "primereact/tag";
import { getFlexibleImageUrl } from "../../lib/utils";

interface BrandTableProps {
  brands: BrandItem[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  onPageChange: (event: PaginatorPageChangeEvent) => void;
}

const BrandTable: React.FC<BrandTableProps> = ({
  brands,
  pagination,
  loading,
  error,
  onPageChange,
}) => {
  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2 py-3 px-4">
      <span className="text-xl text-gray-800 font-bold">
        Danh sách thương hiệu sản phẩm
      </span>
    </div>
  );

  const nameBodyTemplate = (brand: BrandItem) => {
    return (
      <Link
        to={`/admin/brands/${brand?._id}`}
        className="font-medium text-teal-600 hover:text-teal-800 hover:underline"
      >
        {brand?.name}
      </Link>
    );
  };

  const imageBodyTemplate = (brand: BrandItem) => {
    if (!brand.logoUrl || brand.logoUrl.length === 0) {
      // Placeholder khi không có ảnh
      return (
        <div className="w-12 h-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
          No Img
        </div>
      );
    }
    return (
      <img
        src={getFlexibleImageUrl(brand.logoUrl)}
        alt={brand.name}
        className="w-12 h-12 object-cover rounded border border-gray-200"
      />
    );
  };

  const getSeverity = (brand: BrandItem) => {
    switch (brand.isActive) {
      case true:
        return "success";
      case false:
        return "warning";
      default:
        return null;
    }
  };

  const statusBodyTemplate = (brand: BrandItem) => {
    return (
      <Tag
        value={brand.isActive ? "Hoạt động" : "Không hoạt động"}
        severity={getSeverity(brand)}
      />
    );
  };

  const descriptionBodyTemplate = (brand: BrandItem) => {
    return (
      <div className="max-w-xs truncate" title={brand.description}>
        {brand.description || "Không có mô tả"}
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

  const first = pagination
    ? (pagination.currentPage - 1) * pagination.limit
    : 0;
  const totalRecords = pagination?.totalItems || 0;
  const rows = pagination?.limit || 10;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <DataTable
        value={brands}
        header={header}
        tableStyle={{ minWidth: "80rem" }}
        scrollable
        scrollHeight="flex"
        className="flex-1 min-h-0 text-sm"
        showGridlines={false}
        stripedRows
        removableSort
        dataKey="_id"
        emptyMessage="Không tìm thấy sản phẩm nào."
      >
        <Column
          field="name"
          header="Thương hiệu"
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
        currentPageReportTemplate="{first} - {last} của {totalRecords} thương hiệu"
      />
    </div>
  );
};

export default BrandTable;
