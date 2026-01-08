// src/hooks/use-product-params.ts

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useProductParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Tạo QueryString mới từ params hiện tại
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      // Reset về trang 1 khi filter thay đổi (trừ khi đổi page)
      if (name !== "page") {
        params.set("page", "1");
      }
      return params.toString();
    },
    [searchParams]
  );

  // Xử lý filter mảng (VD: chọn nhiều màu) - Gộp hoặc loại bỏ giá trị
  const toggleFilter = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = params.getAll(name);

      if (currentValues.includes(value)) {
        // Nếu đã tồn tại, xóa tất cả và thêm lại trừ giá trị cần xóa
        params.delete(name);
        currentValues
          .filter((v) => v !== value)
          .forEach((v) => params.append(name, v));
      } else {
        // Nếu chưa tồn tại, thêm vào
        params.append(name, value);
      }

      params.set("page", "1"); // Reset page
      return params.toString();
    },
    [searchParams]
  );

  // Hàm loại bỏ hoàn toàn một giá trị cụ thể từ param mảng
  const removeValueFromParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = params.getAll(name);

      if (currentValues.includes(value)) {
        params.delete(name);
        currentValues
          .filter((v) => v !== value)
          .forEach((v) => params.append(name, v));
        params.set("page", "1");
      }
      return params.toString();
    },
    [searchParams]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    // Giữ lại các keys cơ bản, xóa các keys filter động
    const keysToKeep = ["sortBy", "q", "title", "category"]; // Giữ category gốc

    Array.from(params.keys()).forEach((key) => {
      if (!keysToKeep.includes(key)) {
        params.delete(key);
      }
    });

    return params.toString();
  }, [searchParams]);

  const setParam = (name: string, value: string) => {
    router.push(`${pathname}?${createQueryString(name, value)}`, {
      scroll: false,
    });
  };

  const toggleParam = (name: string, value: string) => {
    router.push(`${pathname}?${toggleFilter(name, value)}`, { scroll: false });
  };

  // Hàm mới để loại bỏ một giá trị cụ thể (dùng trong ProductFilters)
  const removeParam = (name: string, value: string) => {
    router.push(`${pathname}?${removeValueFromParam(name, value)}`, {
      scroll: false,
    });
  };

  const removeAllFilters = () => {
    router.push(`${pathname}?${clearFilters()}`, { scroll: false });
  };

  const setPriceRangeAtomic = useCallback(
    (min: string | null, max: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      // 1. Luôn xóa các param giá cũ
      params.delete("minPrice");
      params.delete("maxPrice");

      // 2. Thiết lập giá trị mới (chỉ khi chúng không phải null hoặc rỗng)
      if (min) {
        params.set("minPrice", min);
      }
      if (max) {
        params.set("maxPrice", max);
      }

      // 3. Reset page và push URL mới (CHỈ MỘT LẦN)
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return {
    searchParams,
    setParam,
    toggleParam,
    removeParam,
    removeAllFilters,
    setPriceRangeAtomic,
  };
}
