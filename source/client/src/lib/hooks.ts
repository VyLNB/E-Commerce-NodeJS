import { useState, useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, RootState, AppStore } from "./store";
import { getFlexibleImageUrl } from "./utils";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export const useAppSelector = useSelector.withTypes<RootState>();

export const useAppStore = useStore.withTypes<AppStore>();

export function useImageFallback(src: string | null, fallbackSrc: string) {
  // Xử lý URL ngay tại đây
  const resolvedSrc = getFlexibleImageUrl(src);
  const resolvedFallback = getFlexibleImageUrl(fallbackSrc); // Xử lý cả ảnh fallback

  const [imgSrc, setImgSrc] = useState(resolvedSrc);

  useEffect(() => {
    // Cập nhật lại state NẾU src prop thay đổi
    setImgSrc(getFlexibleImageUrl(src));
  }, [src]);

  // Nếu ảnh bị lỗi (404, v.v.), dùng fallback
  const onError = () => setImgSrc(resolvedFallback);

  return { imgSrc, onError };
}
