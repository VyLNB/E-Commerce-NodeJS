"use client";

import { Product } from "@/lib/types";
import { formatCurrency, getFlexibleImageUrl } from "@/lib/utils";
import Image from "next/image";
import { StarRating } from "../ui";

type Props = {
  product: Product;
  onAddToCartClick: (product: Product) => void;
};

export default function ProductCard({ product, onAddToCartClick }: Props) {
  const finalPrice =
    product.effectivePrice ?? product.displayPrice ?? product.price;

  return (
    <div className="group relative w-full overflow-hidden rounded-xl bg-white transition-shadow hover:shadow-lg hover:shadow-red-200 border border-gray-100">
      <div className="relative flex h-60 items-center justify-center overflow-hidden p-4 bg-gray-50/50">
        <a href={`/products/${product._id}`}>
          <Image
            src={getFlexibleImageUrl(product.images[0])}
            alt={product.name}
            width={200}
            height={200}
            className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105 mix-blend-multiply"
          />
        </a>
      </div>

      <div className="py-4 px-6">
        <a href={`/products/${product._id}`}>
          <h5
            className="line-clamp-2 text-lg font-medium text-gray-900 min-h-[3.5rem] hover:text-blue-600 transition-colors"
            title={product.name}
          >
            {product.name}
          </h5>
        </a>

        {/* [UPDATE] Phần hiển thị giá */}
        <div className="flex flex-col gap-1 py-2">
          <span className="text-2xl font-bold text-red-600">
            {formatCurrency(finalPrice)}
          </span>
          {/* Nếu giá hiển thị khác giá gốc (tức là có biến thể rẻ hơn/đắt hơn), có thể hiển thị thêm thông tin nếu muốn */}
          {/* Ví dụ: hiển thị giá gốc bị gạch đi nếu đây là giá khuyến mãi */}
        </div>

        <div className="flex items-center space-x-1">
          <StarRating rating={product.totalRating} />
          <span className="text-xs text-gray-400">
            ({product.reviews || 0})
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-12 translate-y-full items-center justify-center bg-gray-900 bg-opacity-90 transition-transform duration-300 ease-in-out group-hover:translate-y-0">
        <button
          onClick={() => onAddToCartClick(product)}
          className="h-full w-full cursor-pointer font-semibold text-white hover:bg-red-600 transition-colors"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
