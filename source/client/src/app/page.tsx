import { getProducts } from "@/api/product";
import { Banner1, Banner2 } from "@/components/banner";
import { CategoryGrid } from "@/components/category";
import { ProductSlider } from "@/components/product";
import { Product } from "@/lib/types";

export default async function Page() {
  // 1. New Arrivals
  const newestProductsPromise = getProducts(
    new URLSearchParams({
      sortBy: "newest",
      limit: "8",
      page: "1",
      isActive: "active",
    })
  );

  // 2. Budget Friendly
  const bestSellingProductsPromise = getProducts(
    new URLSearchParams({
      sortBy: "price_asc",
      limit: "8",
      isActive: "active",
    })
  );

  // 3. Laptop Gaming: Use Slug 'laptop-gaming'
  const laptopGamingProductsPromise = getProducts(
    new URLSearchParams({
      category: "laptop-gaming",
      limit: "8",
      isActive: "active",
    })
  );

  // 4. Monitors: Use Slug 'man-hinh-gaming'
  const monitorProductsPromise = getProducts(
    new URLSearchParams({
      category: "man-hinh-gaming",
      limit: "8",
      isActive: "active",
    })
  );

  // 5. Accessories: Use Slug 'phu-kien-van-phong'
  const accessoryProductsPromise = getProducts(
    new URLSearchParams({
      category: "phu-kien-van-phong",
      limit: "8",
      isActive: "active",
    })
  );

  const [
    newestResponse,
    bestSellingResponse,
    laptopGamingResponse,
    monitorResponse,
    accessoryResponse,
  ] = await Promise.all([
    newestProductsPromise,
    bestSellingProductsPromise,
    laptopGamingProductsPromise,
    monitorProductsPromise,
    accessoryProductsPromise,
  ]);

  const newestProducts: Product[] = newestResponse?.data?.products || [];
  const bestSellingProducts: Product[] =
    bestSellingResponse?.data?.products || [];
  const laptopGamingProducts: Product[] =
    laptopGamingResponse?.data?.products || [];
  const monitorProducts: Product[] = monitorResponse?.data?.products;
  const accessoryProducts: Product[] = accessoryResponse?.data?.products || [];

  return (
    <div>
      <Banner1 />
      <div className="bg-radial-tech">
        <ProductSlider
          key="newest-slider"
          title="Sản phẩm mới"
          initialProducts={newestProducts}
          viewAllLink="/products?sortBy=newest"
        />
        <CategoryGrid />
        <ProductSlider
          key="cheap-slider"
          title="Giá rẻ mỗi ngày"
          initialProducts={bestSellingProducts}
          viewAllLink="/products?sortBy=price_asc"
        />
      </div>
      <Banner2 />
      <div className="bg-radial-tech">
        <ProductSlider
          key={`laptop-gaming-${laptopGamingProducts.length}`}
          title="Laptop Gaming"
          initialProducts={laptopGamingProducts}
          viewAllLink="/products?category=laptop-gaming"
        />
        <ProductSlider
          key={`monitor-${monitorProducts.length}`}
          title="Màn hình chính hãng"
          initialProducts={monitorProducts}
          viewAllLink="/products?category=man-hinh-gaming"
        />
        <ProductSlider
          key={`accessories-${accessoryProducts.length}`}
          title="Phụ kiện văn phòng"
          initialProducts={accessoryProducts}
          viewAllLink="/products?category=phu-kien-van-phong"
        />
      </div>
    </div>
  );
}
