"use client";

import { useProductParams } from "@/hooks/use-product-params";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Minus, Plus, Filter } from "lucide-react";

type FilterOption = {
  id: string;
  name: string;
  options: { value: string; label: string }[];
};

type Props = {
  filters: FilterOption[];
  activeFilterCount: number;
};

export default function ProductFilters({ filters, activeFilterCount }: Props) {
  const { searchParams, toggleParam, removeAllFilters, setPriceRangeAtomic } =
    useProductParams();

  // Special Price Ranges
  const priceRanges = [
    { label: "Dưới 1 triệu", min: "0", max: "1000000" },
    { label: "1 triệu - 5 triệu", min: "1000000", max: "5000000" },
    { label: "5 triệu - 10 triệu", min: "5000000", max: "10000000" },
    { label: "Trên 10 triệu", min: "10000000", max: "" },
  ];

  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const handlePriceChange = (min: string, max: string) => {
    const isCurrentlyActive =
      currentMinPrice === min &&
      (max === "" ? !currentMaxPrice : currentMaxPrice === max);

    if (isCurrentlyActive) {
      setPriceRangeAtomic(null, null);
    } else {
      const newMin = min || null;
      const newMax = max || null;
      setPriceRangeAtomic(newMin, newMax);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <Filter size={20} />
          <span>Bộ lọc</span>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={removeAllFilters}
            className="text-sm text-red-500 hover:underline"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* PRICE FILTER - HARDCODED (Special Case) */}
      <Disclosure
        as="div"
        defaultOpen={true}
        className="border-b border-gray-200 pb-6"
      >
        {({ open }) => (
          <>
            <h3 className="-my-3 flow-root">
              <DisclosureButton className="flex w-full items-center justify-between py-3 text-sm text-gray-400 hover:text-gray-500">
                <span className="font-medium text-gray-900">Khoảng giá</span>
                <span className="ml-6 flex items-center">
                  {open ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </span>
              </DisclosureButton>
            </h3>
            <DisclosurePanel className="pt-4">
              <div className="space-y-3">
                {priceRanges.map((range) => {
                  const isActive =
                    currentMinPrice === range.min &&
                    (range.max === ""
                      ? !currentMaxPrice
                      : currentMaxPrice === range.max);

                  return (
                    <label
                      key={range.label}
                      className={`flex items-center cursor-pointer p-2 rounded-lg transition ${
                        isActive
                          ? "bg-indigo-50 border border-indigo-300 text-indigo-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="price-range"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        checked={isActive}
                        onChange={() => handlePriceChange(range.min, range.max)}
                      />
                      <span className="ml-3 text-sm">{range.label}</span>
                    </label>
                  );
                })}
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* DYNAMIC FILTERS (Color, RAM, SSD, etc.) */}
      {filters
        .filter((f) => f.id !== "price") // Remove old price filter if it sneaks in
        .map((section) => (
          <Disclosure
            as="div"
            key={section.id}
            defaultOpen={true}
            className="border-b border-gray-200 pb-6"
          >
            {({ open }) => (
              <>
                <h3 className="-my-3 flow-root">
                  <DisclosureButton className="flex w-full items-center justify-between py-3 text-sm text-gray-400 hover:text-gray-500">
                    <span className="font-medium text-gray-900 capitalize">
                      {section.name}
                    </span>
                    <span className="ml-6 flex items-center">
                      {open ? (
                        <Minus className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </span>
                  </DisclosureButton>
                </h3>
                <DisclosurePanel className="pt-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {section.options.map((option) => {
                      const checked = searchParams
                        .getAll(section.id)
                        .includes(option.value);

                      return (
                        <div key={option.value} className="flex items-center">
                          <input
                            id={`filter-${section.id}-${option.value}`}
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              toggleParam(section.id, option.value);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`filter-${section.id}-${option.value}`}
                            className="ml-3 text-sm text-gray-600 cursor-pointer hover:text-gray-900"
                          >
                            {option.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </DisclosurePanel>
              </>
            )}
          </Disclosure>
        ))}
    </div>
  );
}
