"use client";

import { addProductRating } from "@/api/product";
import { useAppSelector } from "@/lib/hooks";
import { Spinner } from "@/public/icons";
import clsx from "clsx";
import { Camera, Star, X } from "lucide-react"; // Import thêm icon Camera, X
import Link from "next/link";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { toast } from "react-toastify";

interface Props {
  productId: string;
  onReviewSuccess: () => void;
}

export default function ProductReviewForm({
  productId,
  onReviewSuccess,
}: Props) {
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [star, setStar] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]); // State lưu file ảnh
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // State lưu preview ảnh
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Giới hạn 3 ảnh
      if (images.length + selectedFiles.length > 3) {
        toast.warning("Bạn chỉ có thể tải lên tối đa 3 ảnh.");
        return;
      }

      setImages((prev) => [...prev, ...selectedFiles]);

      // Tạo URL preview
      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  // Xóa ảnh đã chọn
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      // Revoke URL cũ để tránh leak memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) return;
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setIsSubmitting(true);
    try {
      // Tạo FormData
      const formData = new FormData();
      formData.append("star", star.toString());
      formData.append("comment", comment);

      // Append từng file ảnh vào key 'images'
      images.forEach((file) => {
        formData.append("images", file);
      });

      await addProductRating(productId, formData);

      toast.success("Gửi đánh giá thành công!");

      // Reset form
      setComment("");
      setStar(5);
      setImages([]);
      setPreviewUrls([]);
      setIsFocused(false);

      onReviewSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gửi đánh giá thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-8 bg-gray-50 text-center">
        <span className="text-gray-600 ">
          Vui lòng{" "}
          <Link
            href="/auth/signin"
            className="text-blue-600 font-semibold hover:underline"
          >
            Đăng nhập
          </Link>{" "}
          để để lại bình luận.
        </span>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div
        className={clsx(
          "border rounded-xl bg-white transition-all duration-200 overflow-hidden",
          isFocused ? "border-gray-400 shadow-sm" : "border-gray-200"
        )}
      >
        <textarea
          className="w-full p-4 outline-none text-gray-700 resize-none min-h-[60px]"
          rows={isFocused ? 4 : 1}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={() => setIsFocused(true)}
          disabled={isSubmitting}
        />

        {/* Khu vực hiển thị ảnh Preview */}
        {previewUrls.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
              >
                <Image src={url} alt="preview" fill className="object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {isFocused && (
          <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-4">
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStar(s)}
                    className="focus:outline-none transition-transform active:scale-110"
                  >
                    <Star
                      size={20}
                      className={clsx(
                        s <= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Image Upload Button */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 hover:text-blue-600 transition flex items-center gap-1  font-medium"
                  title="Thêm ảnh"
                >
                  <Camera size={20} />
                  <span className="hidden sm:inline">Thêm ảnh</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsFocused(false)}
                className="px-4 py-2  font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !comment.trim()}
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2  font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Spinner size={16} />}
                Gửi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
