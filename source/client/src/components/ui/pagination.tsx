import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-4 text-gray-900 py-8">
      {/* Nút lùi */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Các số trang */}
      <ul className="flex items-center justify-center gap-2">
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`py-1 px-3.5 rounded-lg cursor-pointer transition ${
              currentPage === number
                ? "bg-gray-900 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => onPageChange(number)}
          >
            {number}
          </li>
        ))}
      </ul>

      {/* Nút tiến */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
