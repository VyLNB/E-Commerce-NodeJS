"use client";

import { getProductRatings, Rating } from "@/api/product";
import { StarRating } from "@/components/ui";
import { useImageFallback } from "@/lib/hooks";
import { getFlexibleImageUrl } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import ProductReviewForm from "./product-review-form";
import ProductReviewSummary from "./product-review-summary";
import { useReviewSocket } from "@/hooks/use-review-socket";
import { vi } from "date-fns/locale";

type Props = {
  productId: string;
};

export default function ProductReviews({ productId }: Props) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState({
    avgStar: 0,
    totalRating: 0,
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0); // Tổng số lượng ratings từ DB
  const [loading, setLoading] = useState(true);
  const LIMIT = 5; // Số lượng review mỗi lần load

  const socket = useReviewSocket(productId);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductRatings(productId, page, LIMIT);
      setRatings(data.ratings);
      setStats({
        avgStar: data.avgStar,
        totalRating: data.totalRating,
      });
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (!socket) return;

    // Server emit sự kiện "reviewUpdate" từ broadcastReviewUpdate
    socket.on("reviewUpdate", (data: any) => {
      console.log("Realtime Review Update:", data);

      // Cập nhật thống kê (Sao trung bình, Tổng số đánh giá)
      if (data.avgStar !== undefined && data.totalRating !== undefined) {
        setStats({
          avgStar: data.avgStar,
          totalRating: data.totalRating,
        });
        setTotal(data.totalRating);
      }

      // Nếu có rating mới hoặc update rating
      if (data.rating) {
        setRatings((prevRatings) => {
          // Kiểm tra xem rating này đã có trong list chưa (trường hợp update)
          const existingIndex = prevRatings.findIndex(
            (r) => r._id === data.rating._id
          );

          if (existingIndex >= 0) {
            // Update: Thay thế rating cũ
            const newRatings = [...prevRatings];
            newRatings[existingIndex] = data.rating;
            return newRatings;
          } else {
            // Create: Thêm mới vào đầu danh sách
            // Chỉ thêm nếu đang ở trang 1 để tránh làm rối danh sách các trang sau
            if (page === 1) {
              return [data.rating, ...prevRatings].slice(0, LIMIT);
            }
            return prevRatings;
          }
        });
      }

      // Trường hợp Xóa (Server hiện tại gửi { message: "Rating removed", ... })
      // Do server chưa gửi ID bị xóa, ta tạm thời chỉ cập nhật Stats.
      // Nếu muốn danh sách chính xác tuyệt đối khi xóa, ta có thể gọi lại fetchReviews().
      if (data.message === "Rating removed") {
        fetchReviews();
      }
    });

    return () => {
      socket.off("reviewUpdate");
    };
  }, [socket, page, fetchReviews]);

  // Tính totalPages
  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <section id="reviews" className="scroll-mt-24 py-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Reviews</h2>

      {/* 1. Summary Section */}
      <ProductReviewSummary
        avgStar={stats.avgStar}
        totalRating={stats.totalRating}
        ratings={ratings}
      />

      {/* 2. Review Form */}
      <ProductReviewForm productId={productId} onReviewSuccess={fetchReviews} />

      {/* 3. Review List */}
      <div className="space-y-8">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : ratings.length > 0 ? (
          ratings.map((review) => (
            <ReviewItem key={review._id} review={review} />
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl">
            <p className="text-gray-500">
              Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
            </p>
          </div>
        )}
      </div>

      {/* 4. Pagination / View More */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          {/* Button View More giống trong thiết kế */}
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2  font-medium text-gray-700"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <p className="px-4 py-2 text-gray-600  font-medium flex items-center">
              Page {page} of {totalPages}
            </p>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2  font-medium text-gray-700"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ReviewItem({ review }: { review: Rating }) {
  const { imgSrc, onError } = useImageFallback(
    review.postedBy?.avatar,
    "/images/user-placeholder.png"
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-6 border-b border-gray-100 last:border-0">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Image
          src={imgSrc}
          alt={review.postedBy?.fullName || "User"}
          width={48}
          height={48}
          className="rounded-full object-cover w-12 h-12 border border-gray-200"
          onError={onError}
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-gray-900 text-base">
              {review.postedBy?.fullName || "Người dùng ẩn danh"}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.star} />
            </div>
          </div>
          <p className="text-gray-400">
            {review.createdAt
              ? format(new Date(review.createdAt), "HH:mm - dd/MM/yyyy", {
                  locale: vi,
                })
              : "Vừa xong"}
          </p>
        </div>

        {/* Comment Text */}
        <p className="text-gray-600 leading-relaxed mb-3">{review.comment}</p>

        {/*  Hiển thị ảnh Review */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mt-2">
            {review.images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition"
              >
                <Image
                  src={getFlexibleImageUrl(img)}
                  alt={`review-img-${idx}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
