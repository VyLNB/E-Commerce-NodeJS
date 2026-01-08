"use client";

import { StarRating } from "@/components/ui";
import { Rating } from "@/api/product";
import { useMemo } from "react";

type Props = {
  avgStar: number;
  totalRating: number;
  ratings: Rating[];
};

export default function ProductReviewSummary({
  avgStar,
  totalRating,
  ratings,
}: Props) {
  // Tính toán phân bổ sao (Distribution)
  const distribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (ratings.length > 0) {
      ratings.forEach((r) => {
        const s = Math.round(r.star) as 1 | 2 | 3 | 4 | 5;
        if (dist[s] !== undefined) dist[s]++;
      });
    }
    return dist;
  }, [ratings]);

  // Labels cho biểu đồ
  const labels: Record<number, string> = {
    5: "Xuất sắc",
    4: "Tốt",
    3: "Trung Bình",
    2: "Dưới Trung Bình",
    1: "Đánh giá thấp",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {/* Cột trái: Điểm số tổng quan */}
      <div className="md:col-span-1 flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-8">
        <span className="text-6xl font-bold text-gray-900 mb-2">
          {avgStar.toFixed(1)}
        </span>
        <div className="mb-2">
          <StarRating rating={avgStar} />
        </div>
        <p className="text-gray-500 ">of {totalRating} reviews</p>
      </div>

      {/* Cột phải: Biểu đồ thanh (Progress bars) */}
      <div className="md:col-span-2 flex flex-col justify-center space-y-3">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
          const percentage =
            ratings.length > 0 ? (count / ratings.length) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-4 ">
              <span className="w-24 font-medium text-gray-900">
                {labels[star]}
              </span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-gray-500">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
