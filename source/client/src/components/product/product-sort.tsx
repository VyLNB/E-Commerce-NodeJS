"use client";

import { Dropdown } from "@/components/layout";
import { useProductParams } from "@/hooks/use-product-params";
import { ChevronDown } from "lucide-react";

const sortCriterias = [
  { name: "Mới nhất", value: "newest" },
  { name: "Rating cao nhất", value: "rating_desc" },
  { name: "Mua nhiều nhất", value: "popular" },
  { name: "Giá: Thấp đến Cao", value: "price_asc" },
  { name: "Giá: Cao đến Thấp", value: "price_desc" },
];

export default function ProductSort() {
  const { setParam, searchParams } = useProductParams();
  const currentSort = searchParams.get("sortBy") || "newest";

  const currentSortLabel =
    sortCriterias.find((c) => c.value === currentSort)?.name || "Sắp xếp";

  const dropdownItems = sortCriterias.map((item) => ({
    name: item.name,
    onClick: () => setParam("sortBy", item.value),
  }));

  return (
    <div className="flex items-center justify-end">
      <Dropdown
        label={currentSortLabel}
        RightIcon={<ChevronDown size={20} />}
        items={dropdownItems}
        btnClassNames="cursor-pointer border border-gray-300 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 transition min-w-[180px] justify-between"
      />
    </div>
  );
}
