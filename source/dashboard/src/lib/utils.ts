import type {
  ProductOption,
  ProductVariant,
} from "../interface/productInterface";

// Format the creation date
export const formatJoinDate = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `Joined ${diffDays} days ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Joined ${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `Joined ${years} year${years > 1 ? "s" : ""} ago`;
  }
};

// Hàm helper tạo Cartesian product
export const getCombinations = (
  options: ProductOption[]
): Record<string, string>[] => {
  if (options.length === 0) return [];

  let result: Record<string, string>[] = [{}];

  for (const option of options) {
    const { name, values } = option;
    if (values.length === 0) continue;

    const nextResult: Record<string, string>[] = [];
    for (const combination of result) {
      for (const value of values) {
        nextResult.push({ ...combination, [name]: value });
      }
    }
    result = nextResult;
  }
  // Lọc trường hợp tất cả thuộc tính đều có giá trị
  const validOptions = options.filter((opt) => opt.values.length > 0);
  if (result.length === 1 && Object.keys(result[0]).length === 0) return [];

  return result.filter((r) => Object.keys(r).length === validOptions.length);
};

// Hàm helper để "reverse-engineer" options từ variants
export const deriveOptionsFromVariants = (
  variants: ProductVariant[]
): ProductOption[] => {
  const optionMap = new Map<string, Set<string>>();

  for (const variant of variants) {
    // 1. Ưu tiên lấy từ attributes, sau đó là specifications
    let attributesToUse: Record<string, string> =
      variant.attributes || variant.specifications || {};

    // Kiểm tra xem Map có rỗng không
    const hasAttributes = Object.keys(attributesToUse).length > 0;

    // 2. Fallback: Nếu không có attributes/specifications nào chứa dữ liệu,
    // và variantName có giá trị, sử dụng variantName làm giá trị của một tùy chọn chung.
    if (!hasAttributes && variant.variantName) {
      attributesToUse = { "Tùy chọn": variant.variantName };
    }

    // 3. Lặp qua các thuộc tính đã xác định
    for (const [key, value] of Object.entries(attributesToUse)) {
      if (!optionMap.has(key)) {
        optionMap.set(key, new Set());
      }
      optionMap.get(key)!.add(value);
    }
  }

  return Array.from(optionMap.entries()).map(([name, valuesSet]) => ({
    name,
    values: Array.from(valuesSet),
  }));
};

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
  const category = params.get("category");
  const sortBy = params.get("sort_by");
  const customTitle = params.get("title");

  if (customTitle) {
    return {
      title: customTitle,
      description: `Khám phá các sản phẩm ${customTitle.toLowerCase()} mới nhất tại GearUp.`,
    };
  }

  if (category) {
    const formattedCategory = category
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      title: `Danh mục: ${formattedCategory}`,
      description: `Tất cả sản phẩm thuộc danh mục ${formattedCategory}.`,
    };
  }

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

  return {
    title: "Tất cả sản phẩm",
    description: "Khám phá toàn bộ sản phẩm có tại GearUp.",
  };
};

export const getFinalBaseUrl = () => {
  const baseUrl =
    typeof window === "undefined"
      ? import.meta.env.INTERNAL_API_BASE_URL // Dùng 'http://api:5000'
      : import.meta.env.NEXT_PUBLIC_API_BASE_URL; // Dùng 'http://localhost:5000'

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

// Hàm hỗ trợ sắp xếp mảng variant
export const getComparisonArray = (variants: ProductVariant[]) =>
  variants
    .map((v) => ({
      variantName: v.variantName,
      // Chỉ so sánh cấu trúc (tên/thông số kỹ thuật), không so sánh dữ liệu chỉnh sửa
      specifications: v.specifications,
    }))
    .sort((a, b) => a.variantName.localeCompare(b.variantName));

// Hàm tạo mới 1 temp variant
export const generateNewVariant = (count: number): ProductVariant => {
  return {
    _id: `temp-${Date.now()}-${count}`,
    sku: "",
    variantName: `Biến thể mới ${count}`,
    priceAdjustment: 0,
    stock: 0,
    images: [],
    attributes: {},
    specifications: {},
    status: "active",
  };
};
