import { getProducts } from "@/api/product";
import ProductListing from "@/components/product/product-listing";
import { Product, PaginationSchema } from "@/lib/types";
import { getPageContext } from "@/lib/utils";

// 1. Cập nhật Type cho searchParams là Promise
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type Props = {
  searchParams: SearchParams;
};

// Hàm fetch data tách biệt
async function fetchProductsData(
  params: URLSearchParams
): Promise<{ products: Product[]; pagination: PaginationSchema }> {
  try {
    const response = await getProducts(params);
    if (response.success) {
      return response.data;
    }
    console.error("API Error:", response.message);
    return {
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        limit: 12,
      },
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        limit: 12,
      },
    };
  }
}

export default async function ProductsPage(props: Props) {
  // 2. Await searchParams trước khi sử dụng
  const searchParams = await props.searchParams;

  const apiParams = new URLSearchParams();

  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 12;
  const sortBy = (searchParams.sort_by as string) || "newest";

  apiParams.set("page", page.toString());
  apiParams.set("limit", limit.toString());
  apiParams.set("sort_by", sortBy);

  // Loop qua các searchParams động còn lại
  Object.entries(searchParams).forEach(([key, value]) => {
    // Bỏ qua các keys đã xử lý thủ công
    if (["page", "limit", "sort_by", "title"].includes(key)) return;

    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => apiParams.append(key, v));
      } else {
        // Xử lý đặc biệt cho filter giá
        if (
          key === "price" &&
          typeof value === "string" &&
          value.includes("-")
        ) {
          const [min, max] = value.split("-");
          if (min) apiParams.append("minPrice", min);
          if (max) apiParams.append("maxPrice", max);
        } else {
          apiParams.append(key, value as string);
        }
      }
    }
  });

  // 3. Fetch Data trên Server
  const { products, pagination } = await fetchProductsData(apiParams);

  // 4. Lấy Context (Title, Description) cho SEO
  const { title, description } = getPageContext(apiParams);

  // 5. Render Client Component
  return (
    <ProductListing
      products={products}
      pagination={pagination}
      pageTitle={title}
      pageDescription={description}
    />
  );
}
