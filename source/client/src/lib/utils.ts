import { Product } from "./types";

export const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

type AddressProps = {
  street: string | "";
  city: string | "";
  ward: string | "";
  district: string | "";
};

export const getFullAddress = ({
  street,
  city,
  ward,
  district,
}: AddressProps) => {
  return `${street}, ${ward}, ${district}, ${city}`;
};

export const getPageContext = (params: URLSearchParams) => {
  const categoryParam = params.get("category");
  const sortBy = params.get("sort_by");
  const customTitle = params.get("title");
  const searchQuery = params.get("q");

  // 1. Prioritize custom title passed via params
  if (customTitle) {
    return {
      title: customTitle,
      description: `Khám phá các sản phẩm ${customTitle.toLowerCase()} mới nhất tại GearUp.`,
    };
  }

  // 2. Check for Search Query
  if (searchQuery) {
    return {
      title: `Kết quả tìm kiếm cho "${searchQuery}"`,
      description: `Tìm thấy các sản phẩm phù hợp với từ khóa "${searchQuery}".`,
    };
  }

  // 3. Check for Category
  if (categoryParam) {
    // Lấy slug đầu tiên để hiển thị trên tiêu đề
    const firstCategorySlug = categoryParam.split(",")[0];
    const formattedCategory = firstCategorySlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      title: `Danh mục: ${formattedCategory}`,
      description: `Tất cả sản phẩm thuộc danh mục ${formattedCategory}.`,
    };
  }

  // 4. Check for Sort options
  if (sortBy === "newest") {
    return {
      title: "Sản phẩm mới",
      description: "Những sản phẩm vừa được ra mắt tại GearUp.",
    };
  }

  if (sortBy === "best-selling") {
    return {
      title: "Sản phẩm bán chạy",
      description: "Những sản phẩm được ưa chuộng nhất tại GearUp.",
    };
  }

  // Default
  return {
    title: "Tất cả sản phẩm",
    description: "Khám phá toàn bộ sản phẩm có tại GearUp.",
  };
};

export const getFinalBaseUrl = () => {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.INTERNAL_API_BASE_URL // Dùng 'http://api:5000'
      : process.env.NEXT_PUBLIC_API_BASE_URL; // Dùng 'http://localhost:5000'

  return baseUrl || "http://localhost:5000";
};

export const getFlexibleImageUrl = (pathOrUrl?: string | null): string => {
  const FALLBACK_IMAGE_PATH = "/images/user-placeholder.png";

  if (!pathOrUrl) {
    // Case 1: src là null, trả về fallback CỦA CLIENT
    return FALLBACK_IMAGE_PATH;
  }

  // Case 2: URL tuyệt đối (Google, Liara, v.v.)
  if (pathOrUrl.startsWith("http")) {
    return pathOrUrl;
  }

  // Case 3: Đường dẫn nội bộ của Client (fallback, logo, v.v.)
  if (pathOrUrl.startsWith("/")) {
    return pathOrUrl;
  }

  // Case 4: Đường dẫn tương đối từ Server (vd: "publics/avatars/abc.jpg")
  const baseUrl = getFinalBaseUrl(); // Ví dụ: http://localhost:5000

  return `${baseUrl}/${pathOrUrl}`;
};

export const generateDynamicFilters = (products: Product[]) => {
  const filterMap: Record<string, Set<string>> = {};

  products.forEach((product) => {
    if ((product as any).attributes) {
      Object.entries((product as any).attributes).forEach(([key, value]) => {
        if (!filterMap[key]) filterMap[key] = new Set();
        if (typeof value === "string") filterMap[key].add(value);
      });
    }

    if (product.specifications) {
      Object.entries(product.specifications).forEach(([key, value]) => {
        if (!filterMap[key]) filterMap[key] = new Set();
        if (typeof value === "string") filterMap[key].add(value);
      });
    }

    product.variants.forEach((variant) => {
      if (variant.attributes) {
        Object.entries(variant.attributes).forEach(([key, value]) => {
          if (!filterMap[key]) filterMap[key] = new Set();
          if (typeof value === "string") filterMap[key].add(value);
        });
      }
    });
  });

  const newFilters = Object.entries(filterMap).map(([key, values]) => ({
    id: key,
    name: key,
    options: Array.from(values)
      .sort()
      .map((value) => ({
        value: value,
        label: value,
      })),
  }));


  return newFilters.sort((a, b) => a.name.localeCompare(b.name));
};
