"use client";

import { useState } from "react";
import { Product, PaginationSchema } from "@/lib/types";
import { Pagination } from "@/components/ui";
import { ProductCard } from "@/components/product";
import { VariantSelectionDialog } from "../dialogs";
import ProductSort from "./product-sort";
import { Filter, X } from "lucide-react";
import { generateDynamicFilters } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductFilters from "./product-filters";

type Props = {
  products: Product[];
  pagination: PaginationSchema;
  pageTitle: string;
  pageDescription: string;
};

export default function ProductListing({
  products,
  pagination,
  pageTitle,
  pageDescription,
}: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  console.log(products);

  // Tạo filters từ danh sách sản phẩm
  const filters = generateDynamicFilters(products);

  // Đếm số lượng filter đang active (trừ các params hệ thống)
  const activeFilterCount = Array.from(searchParams.keys()).filter(
    (key) =>
      !["page", "limit", "sort_by", "q", "title", "category"].includes(key)
  ).length;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const activeCategoryName = pageTitle.startsWith("Danh mục:")
    ? pageTitle.replace("Danh mục: ", "")
    : null;

  return (
    <section className="bg-white text-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="bg-gray-50 py-12 mb-8">
        <div className="container mx-auto px-4 lg:px-32 text-center">
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{pageDescription}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-32 pb-16">
        {/* Base Filter Indicator */}
        {activeCategoryName && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-700 border border-blue-200">
            <Filter size={20} />
            <span className="font-semibold">Đang xem danh mục:</span>
            <span>{activeCategoryName}</span>
            <Link
              href="/products"
              className="ml-auto flex items-center gap-1 text-sm font-medium hover:underline text-blue-800 transition"
            >
              <X size={16} /> Xóa lọc danh mục
            </Link>
          </div>
        )}

        {/* Toolbar Mobile & Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <button
            className="md:hidden w-full flex items-center justify-center gap-2 border border-gray-300 p-2 rounded-lg"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <Filter size={20} />
            {activeFilterCount > 0
              ? `Bộ lọc (${activeFilterCount})`
              : "Lọc sản phẩm"}
          </button>

          <div className="w-full md:w-auto ml-auto">
            <ProductSort />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24">
            <ProductFilters
              filters={filters}
              activeFilterCount={activeFilterCount}
            />
          </aside>

          {/* Mobile Filter Drawer (Simplified) */}
          {isMobileFilterOpen && (
            <div className="lg:hidden mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <ProductFilters
                filters={filters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          )}

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCartClick={setSelectedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">
                  Không tìm thấy sản phẩm nào phù hợp.
                </p>
                <button
                  onClick={() => router.push(window.location.pathname)}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-12">
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <VariantSelectionDialog
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
