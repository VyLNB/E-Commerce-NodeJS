import type { PaginatorPageChangeEvent } from 'primereact/paginator';
import type { CouponItem, PaginationInfo } from '../../interface/discountInterface';
import type React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'primereact/tag';

interface DiscountTableProps {
    discounts: CouponItem[];
    pagination: PaginationInfo | null;
    loading: boolean;
    error: string | null;
    onPageChange: (event: PaginatorPageChangeEvent) => void;
}

const DiscountTable: React.FC<DiscountTableProps> = ({
    discounts,
    pagination,
    loading,
    error,
    onPageChange,
}) => {
    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2 py-3 px-4">
        <span className="text-xl text-gray-800 font-bold">
            Danh sách mã giảm giá
        </span>
        </div>
    );

    const codeBodyTemplate = (discount: CouponItem) => {
        const navigate = useNavigate(); // Thêm hook này vào component
        
        const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            // Truyền discount data qua state
            navigate(`/admin/discounts/${discount._id}`, {
                state: { discount }
            });
        };
        
        return (
            <button
                onClick={handleClick}
                className="font-medium text-teal-600 hover:text-teal-800 hover:underline"
            >
                {discount?.code}
            </button>
        );
    };
    const nameBodyTemplate = (discount: CouponItem) => {
        return (
            <div className="font-medium">
                {discount?.name}
            </div>
        );
    };

    const dateBodyTemplate = (discount: CouponItem) => {
        if (!discount.createdAt) return "-";

        const parts = discount.createdAt.split(" "); // "13:26:54 23/10/2025"
        const date = parts[1]; // "23/10/2025"

        return <span>{date}</span>;
    };

    const getSeverity = (discount: CouponItem) => {
    switch (discount.isActive) {
        case true:
        return "success";
        case false:
        return "warning";
        default:
        return null;
    }
    };

    const statusBodyTemplate = (discount: CouponItem) => {
    return (
        <Tag
        value={discount.isActive ? "Hoạt động" : "Không hoạt động"}
        severity={getSeverity(discount)}
        />
    );
    };

    const usageTemplate = (discount: CouponItem) => {
        return (
            <span className="font-medium">
                {discount.usedCount} / {discount.usageLimitTotal === 0 ? "∞" : discount.usageLimitTotal}
            </span>
        );
    };

    const discountValueTemplate = (discount: CouponItem) => {
        if (discount.type === "percentage") {
            return <span>{discount.discountValue}%</span>;
        }

        if (discount.type === "fixed_amount") {
            return <span>{formatCurrency(discount.discountValue)}</span>;
        }

        // fallback nếu backend thêm type mới
        return <span>{discount.discountValue}</span>;
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
        ? (pagination.page - 1) * pagination.limit
        : 0;

    const totalRecords = pagination?.total || 0;

    const rows = pagination?.limit || 10;

    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DataTable
            value={discounts}
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
                field="code"
                header="Mã code"
                body={codeBodyTemplate}
                style={{ minWidth: "100px" }}
                frozen
                className="font-medium"
            />
            <Column
                header="Tên code"
                field="name"
                body={nameBodyTemplate}
                style={{ minWidth: "100px" }}
            />
            <Column
                header="Giá trị giảm"
                field="discountValue"
                body={discountValueTemplate}
                style={{ minWidth: "150px" }}
                sortable
            />
            <Column
                header="Tổng số lần"
                field="usageLimitTotal"
                body={usageTemplate}
                style={{ minWidth: "150px" }}
                sortable
            />
            <Column
                field="usedCount"
                header="Đã sử dụng"
                body={usageTemplate}
                sortable
                style={{ minWidth: "150px" }}
            />
            <Column
                field="createdAt"
                header="Ngày tạo"
                body={dateBodyTemplate}
                sortable
                style={{ minWidth: "120px" }}
            />
            <Column
                field="isActive"
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

export default DiscountTable;