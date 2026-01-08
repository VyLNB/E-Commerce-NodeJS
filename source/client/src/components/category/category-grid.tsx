import React from "react";
import { CategoryCard } from "./index";
import laptopImage from "@/public/images/laptop-image.png";
import monitorImage from "@/public/images/monitor-image.png";
import componentImage from "@/public/images/component-image.png";
import macbookImage from "@/public/images/macbook-image.png";
import headsetImage from "@/public/images/headset-image.png";
import accessoriesImage from "@/public/images/accessories-image.png";

type Props = {};

export default function CategoryGrid({}: Props) {
  return (
    <section className="py-12 lg:py-24">
      <div className="container mx-auto px-4 lg:px-32">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-10 lg:mb-16">
          Danh mục sản phẩm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          <CategoryCard
            title="Laptop Gaming"
            description="Các mẫu laptop chính hãng theo nhu cầu"
            imageUrl={laptopImage}
            href="/products?category=laptop-gaming"
          />
          <CategoryCard
            title="Màn hình"
            description="Khám phá các màn hình chính hãng với độ phân giải cao"
            imageUrl={monitorImage}
            href="/products?category=man-hinh"
          />
          <CategoryCard
            title="Linh kiện điện tử"
            description="Thiết kế PC của bạn bằng những linh kiện chất lượng cao"
            imageUrl={componentImage}
            href="/products?category=linh-kien-dien-tu"
          />
          <CategoryCard
            title="Macbook"
            description="Các sản phẩm Macbook chính hãng và chất lượng cao đến từ nhà Apple"
            imageUrl={macbookImage}
            href="/products?category=macbook"
          />
          <CategoryCard
            title="Phụ kiện Gaming"
            description="Khám phá các sản phẩm chính hãng dành cho game thủ"
            imageUrl={headsetImage}
            href="/products?category=phu-kien-gaming"
          />
          <CategoryCard
            title="Phụ kiện văn phòng"
            description="Tô điểm cho phong cách làm việc bằng những phụ kiện đi kèm"
            imageUrl={accessoriesImage}
            href="/products?category=phu-kien-van-phong"
          />
        </div>
      </div>
    </section>
  );
}
