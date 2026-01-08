import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import type {
  ProductItem,
  PaginationInfo,
} from "../../interface/productInterface";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { Link } from "react-router-dom";
import { getFlexibleImageUrl } from "../../lib/utils";

interface ProductTableProps {
  products: ProductItem[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  onPageChange: (event: PaginatorPageChangeEvent) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  pagination,
  loading,
  error,
  onPageChange,
}) => {
  const imageBodyTemplate = (product: ProductItem) => {
    if (!product.images || product.images.length === 0) {
      // Placeholder khi không có ảnh
      return (
        <div className="w-12 h-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
          No Img
        </div>
      );
    }
    return (
      <img
        src={getFlexibleImageUrl(product.images[0])}
        alt={product.name}
        className="w-12 h-12 object-cover rounded border border-gray-200"
      />
    );
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0 ₫";
    }
    return value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const priceBodyTemplate = (product: ProductItem) => {
    return <span className="font-medium">{formatCurrency(product.price)}</span>;
  };

  // Hiển thị tồn kho với cảnh báo màu sắc
  const stockBodyTemplate = (product: ProductItem) => {
    const stock = product.totalStock || 0;
    let textColor = "text-gray-900";
    if (stock === 0) textColor = "text-red-600 font-semibold";
    else if (stock < 10) textColor = "text-orange-500 font-medium";

    return <span className={textColor}>{stock}</span>;
  };

  const categoryBodyTemplate = (product: ProductItem) => {
    // Xử lý trường hợp tên field có thể khác nhau do dữ liệu cũ/mới
    return product?.category?.name || "---";
  };

  const brandBodyTemplate = (product: ProductItem) => {
    return product?.brand.name || "---";
  };

  const statusBodyTemplate = (product: ProductItem) => {
    return (
      <Tag
        value={product.status == "active" ? "Hoạt động" : "Không hoạt động"}
        severity={getSeverity(product)}
      />
    );
  };

  const nameBodyTemplate = (product: ProductItem) => {
    return (
      <Link
        to={`/admin/products/${product?._id}`}
        className="font-medium text-teal-600 hover:text-teal-800 hover:underline"
      >
        {product?.name}
      </Link>
    );
  };

  const getSeverity = (product: ProductItem) => {
    switch (product.status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      default:
        return null;
    }
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
        Danh sách sản phẩm
      </span>
    </div>
  );

  const first = pagination
    ? (pagination.currentPage - 1) * pagination.limit
    : 0;
  const totalRecords = pagination?.totalProducts || 0;
  const rows = pagination?.limit || 10;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <DataTable
        value={products}
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
          header="Sản phẩm"
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
          header="Danh mục"
          field="category"
          body={categoryBodyTemplate}
          style={{ minWidth: "150px" }}
          sortable
        />
        <Column
          header="Thương hiệu"
          field="brand"
          body={brandBodyTemplate}
          style={{ minWidth: "150px" }}
          sortable
        />
        <Column
          field="price"
          header="Giá bán"
          body={priceBodyTemplate}
          sortable
          style={{ minWidth: "150px" }}
        />
        <Column
          field="stock"
          header="Tồn kho"
          body={stockBodyTemplate}
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="status"
          header="Trạng thái"
          body={statusBodyTemplate}
          style={{ minWidth: "120px" }}
          sortable
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
        currentPageReportTemplate="{first} - {last} của {totalRecords} sản phẩm"
      />
    </div>
  );
};

export default ProductTable;
