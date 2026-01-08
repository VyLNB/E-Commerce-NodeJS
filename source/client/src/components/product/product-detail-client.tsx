"use client";

import { addToCartServer } from "@/api/cart";
import { ProductReviews, ProductSpecifications } from "@/components/product";
import { BreadCumbs, StarRating } from "@/components/ui";
import { useCartActions } from "@/hooks/use-cart-action";
import { setCart } from "@/lib/features/cart-slice";
import { useAppDispatch } from "@/lib/hooks";
import { Product, Variant } from "@/lib/types";
import { formatCurrency, getFlexibleImageUrl } from "@/lib/utils";
import clsx from "clsx";
import { MessageSquare, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

// Chỉ load code của Lightbox khi user click vào ảnh
const ProductThumbnailViewer = dynamic(
  () => import("@/components/dialogs/product-thumbnail-viewer"),
  {
    ssr: false,
  }
);

// 1. Đặt hằng số số lượng ảnh thu nhỏ tối đa
const MAX_VISIBLE_THUMBNAILS = 4;

type Props = {
  initialProduct: Product;
};

export default function ProductDetailPage({ initialProduct }: Props) {
  const { addToCart } = useCartActions();
  const searchParams = useSearchParams();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    const variantId = searchParams.get("variant");
    if (variantId && initialProduct.variants) {
      return initialProduct.variants.find((v) => v._id === variantId) || null;
    }
    return null;
  });

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // Thay đổi state để theo dõi index của ảnh, null = đóng
  const [viewImageIndex, setViewImageIndex] = useState<number | null>(null);

  const breadcrumbItems = useMemo(() => {
    if (!initialProduct) return [];

    return [
      { name: "Sản phẩm", href: "/products" },
      {
        name: initialProduct.category.name,
        href: `/products?category=${initialProduct.category.slug}`,
      },
      { name: initialProduct.name, href: `/products/${initialProduct._id}` },
    ];
  }, [initialProduct]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (!initialProduct || !selectedVariant) return; // Không add nếu chưa chọn variant

    try {
      const success = await addToCart(
        initialProduct,
        selectedVariant,
        quantity
      );
      if (success) {
        toast.success(
          `${initialProduct.name} (${selectedVariant.variantName}) đã được thêm vào giỏ hàng!`
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Thêm sản phẩm vào giỏ hàng thất bại.");
    }
  };

  // Tính toán ảnh nào hiển thị, ảnh nào ẩn
  const visibleThumbnails = useMemo(() => {
    if (!initialProduct?.images) return [];
    // Lấy 4 ảnh đầu tiên và xử lý URL
    return initialProduct.images
      .slice(0, MAX_VISIBLE_THUMBNAILS)
      .map(getFlexibleImageUrl);
  }, [initialProduct?.images]);

  const hiddenImagesCount = useMemo(() => {
    if (!initialProduct?.images) return 0;
    // Tính số ảnh còn lại
    return Math.max(0, initialProduct.images.length - MAX_VISIBLE_THUMBNAILS);
  }, [initialProduct?.images]);

  // Lấy danh sách TẤT CẢ ảnh (đã xử lý URL) để đưa vào Viewer
  const allImages = useMemo(() => {
    if (!initialProduct?.images) return [];
    return initialProduct.images.map(getFlexibleImageUrl);
  }, [initialProduct?.images]);

  // Tính toán giá hiển thị dựa trên variant được chọn
  const displayPrice = useMemo(() => {
    if (initialProduct) {
      if (selectedVariant) {
        return initialProduct.price + selectedVariant.priceAdjustment;
      }
      // Nếu không có variant nào, hiển thị giá cơ sở
      return initialProduct.price;
    }
    return 0;
  }, [initialProduct, selectedVariant]);

  // Ghi đè specs chung bằng specs của variant
  const mergedSpecs = useMemo(() => {
    if (initialProduct) {
      if (selectedVariant) {
        return {
          ...initialProduct.specifications,
          ...selectedVariant.specifications,
        };
      }
      return initialProduct.specifications;
    }
    return {};
  }, [initialProduct, selectedVariant]);

  // CẬP NHẬT ẢNH CHÍNH KHI CHỌN VARIANT
  useEffect(() => {
    if (
      selectedVariant &&
      selectedVariant.images &&
      selectedVariant.images.length > 0
    ) {
      // Cập nhật ảnh chính là ảnh đầu tiên của variant
      setSelectedImage(getFlexibleImageUrl(selectedVariant.images[0]));
    } else if (initialProduct?.images?.[0]) {
      // Nếu variant không có ảnh riêng, quay về ảnh đầu tiên của sản phẩm
      setSelectedImage(getFlexibleImageUrl(initialProduct.images[0]));
    }
  }, [selectedVariant, initialProduct]);

  if (!initialProduct) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Product not found.
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-32">
        {/* Breadcumbs */}
        <BreadCumbs items={breadcrumbItems} />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div className="flex flex-col-reverse items-start gap-4 md:flex-row">
            <div className="flex flex-row gap-2 md:flex-col">
              {/* Hiển thị các ảnh thu nhỏ nhìn thấy được */}
              {visibleThumbnails.map((imgUrl, index) => (
                <Fragment key={index}>
                  <button
                    onClick={() => setSelectedImage(imgUrl)}
                    className={clsx(
                      "rounded-lg border-2 p-1 transition-all",
                      selectedImage === imgUrl
                        ? "border-blue-500" // Ảnh đang được chọn
                        : "border-transparent hover:border-gray-300" // Ảnh không được chọn
                    )}
                  >
                    <Image
                      src={imgUrl}
                      alt="thumbnail"
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                  </button>
                </Fragment>
              ))}

              {/* Nút "+X" nếu còn ảnh ẩn */}
              {hiddenImagesCount > 0 && (
                <button
                  // Mở viewer tại ảnh ẩn đầu tiên (index = 4)
                  onClick={() => setViewImageIndex(MAX_VISIBLE_THUMBNAILS)}
                  className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-transparent bg-gray-100 p-1 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-200 transition-all"
                >
                  +{hiddenImagesCount}
                </button>
              )}
            </div>

            <div className="w-full flex items-center justify-center">
              <Image
                src={
                  selectedImage ||
                  getFlexibleImageUrl(
                    "https://lh3.googleusercontent.com/h_O4sofNdgwcechM6WEstoMiMwbgvcWT9dUDEcWYio3YDBHlREZTL7UvcCiTM7HWwiUd_V0Id-ceM5wZL9i2vd6nCHez6bhl=w230-rw"
                  )
                }
                alt="Main product"
                width={500}
                height={500}
                // Mở viewer tại ảnh đang chọn
                onClick={() =>
                  setViewImageIndex(allImages.indexOf(selectedImage))
                }
                className="cursor-pointer rounded-xl object-contain"
                priority
              />
            </div>
          </div>

          {/* Product Basic Info */}
          <div className="flex flex-col">
            <h1 className="font-semibold tracking-tight text-gray-900 lg:text-4xl">
              {initialProduct.name}
            </h1>

            <div className="mt-4 flex items-center gap-4">
              <p className="text-3xl font-medium text-red-500 ">
                {formatCurrency(displayPrice)}
              </p>
              {selectedVariant &&
                selectedVariant.priceAdjustment !== 0 &&
                selectedVariant.priceAdjustment !== initialProduct.price && (
                  <p className="text-xl text-gray-500 line-through">
                    {formatCurrency(initialProduct.price)}
                  </p>
                )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <StarRating rating={initialProduct.totalRating} />
              {initialProduct.reviews && (
                <a href="#reviews" className=" text-gray-700 hover:underline">
                  ({initialProduct.reviews} reviews)
                </a>
              )}
            </div>

            {/* VARIANTS */}
            {initialProduct.variants && initialProduct.variants.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Lựa chọn:
                  <span className="text-gray-600 ml-2">
                    {selectedVariant?.variantName}
                  </span>
                </h3>

                {/* Render các nút chọn variant */}
                <div className="flex flex-wrap gap-3">
                  {initialProduct.variants.map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0} // Vô hiệu hóa nếu hết hàng
                      className={clsx(
                        "rounded-lg border px-5 py-2 text-sm font-medium transition-colors duration-200",
                        {
                          // Style cho variant được chọn
                          "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500":
                            selectedVariant?._id === variant._id,

                          // Style cho variant không được chọn
                          "border-gray-300 bg-white text-gray-700 hover:bg-gray-50":
                            selectedVariant?._id !== variant._id,

                          // Style cho variant hết hàng
                          "opacity-50 cursor-not-allowed line-through":
                            variant.stock === 0,
                        }
                      )}
                    >
                      {variant.variantName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-8 mt-8">
              {/* Quantity */}
              <div className="col-span-1 flex items-center justify-between rounded border border-gray-200 px-2">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-600 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={20} />
                </button>
                <span className="w-full text-gray-700 border-transparent text-center h-10 py-2 ">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-600 transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={20} />
                </button>
              </div>
              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                // Chỉ được add khi đã chọn 1 variant
                // Variant đó phải còn hàng
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="cursor-pointer col-span-2 rounded-lg bg-gray-900 px-8 py-3 font-medium text-lg text-white hover:bg-gray-800 transition
               disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {!selectedVariant
                  ? "Vui lòng chọn phiên bản"
                  : selectedVariant.stock === 0
                  ? "Hết hàng"
                  : "Add to Cart"}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <Truck size={20} className="text-blue-500" />
                <p className=" font-medium text-gray-700">Free Delivery</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <ShieldCheck size={20} className="text-blue-500" />
                <p className=" font-medium text-gray-700">Secure Transaction</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <MessageSquare size={20} className="text-blue-500" />
                <p className=" font-medium text-gray-700">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-16">
          {/* Details */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Thông tin chi tiết
            </h2>
            <div className="prose prose-slate max-w-none text-gray-600">
              <p>{initialProduct.description}</p>
            </div>
          </section>
          {/* Specifications */}
          <ProductSpecifications product={initialProduct} specs={mergedSpecs} />

          <ProductReviews productId={initialProduct._id} />

          {/* Related Products */}
          {/* <section>
            ...
          </section> */}
        </div>
      </div>

      {/* Cập nhật props cho Viewer */}
      <ProductThumbnailViewer
        images={allImages}
        startIndex={viewImageIndex ?? 0}
        isOpen={viewImageIndex !== null}
        onClose={() => setViewImageIndex(null)}
      />
    </div>
  );
}
