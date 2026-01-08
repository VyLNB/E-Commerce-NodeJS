"use client";
import { Product } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react"; // Import useId
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductCard } from ".";
import { VariantSelectionDialog } from "../dialogs";

type Props = {
  title: string;
  initialProducts: Product[];
  viewAllLink: string;
};

export default function ProductSlider({
  title,
  viewAllLink,
  initialProducts,
}: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Generate a unique ID for this slider instance to prevent selector conflicts
  const uniqueId = useId().replace(/:/g, "");
  const prevClass = `swiper-prev-${uniqueId}`;
  const nextClass = `swiper-next-${uniqueId}`;

  // If no products, render empty state (or return null to hide section)
  if (!initialProducts || initialProducts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg">
        <p>Chưa có sản phẩm cho danh mục này</p>
      </div>
    );
  }

  return (
    <section className="py-12 lg:py-24">
      <div className="container mx-auto px-4 xl:px-32 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end space-x-8 mb-6 lg:mb-0">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {title}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                className={`${prevClass} flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900 transition-colors cursor-pointer z-10`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className={`${nextClass} flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900 transition-colors cursor-pointer z-10`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-[300px]">
          <Swiper
            // Add a key based on product length to force re-render when data arrives
            key={`swiper-${uniqueId}-${initialProducts.length}`}
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            observer={true} // IMPORTANT: checks for DOM changes
            observeParents={true} // IMPORTANT: checks for parent container changes
            navigation={{
              prevEl: `.${prevClass}`,
              nextEl: `.${nextClass}`,
            }}
            className="!pb-12"
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 24 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
          >
            {initialProducts.map((product) => (
              <SwiperSlide key={product._id}>
                <ProductCard
                  product={product}
                  onAddToCartClick={setSelectedProduct}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="flex justify-center items-center">
          <Link
            href={viewAllLink}
            className="border border-gray-900 px-8 py-3 rounded-lg text-base font-medium text-gray-900 hover:border-red-500 hover:text-red-500 transition-colors whitespace-nowrap"
          >
            Xem tất cả
          </Link>
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
