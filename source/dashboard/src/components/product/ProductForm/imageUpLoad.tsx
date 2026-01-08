import { X, UploadCloud } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ConfirmDialog } from "../../dialogs";

interface ImageUploadProps {
  images: (string | File)[];
  onChange: (images: (string | File)[]) => void;
  maxImages?: number;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  label,
  onChange,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // State cho Confirm Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDeleteIndex, setImageToDeleteIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const newPreviews = images.map((img) =>
      typeof img === "string" ? img : URL.createObjectURL(img)
    );
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((url, index) => {
        if (typeof images[index] !== "string") {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
      e.target.value = "";
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    onChange([...images, ...validFiles]);
  };

  // 1. Hàm mở dialog khi click nút xóa
  const handleDeleteClick = (index: number) => {
    setImageToDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  // 2. Hàm thực hiện xóa khi user xác nhận
  const handleConfirmDelete = () => {
    if (imageToDeleteIndex === null) return;

    const newImages = [...images];
    newImages.splice(imageToDeleteIndex, 1);
    onChange(newImages);

    // Reset state
    setIsDeleteDialogOpen(false);
    setImageToDeleteIndex(null);
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {label || "Hình ảnh"}
      </h3>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
          {previews.map((src, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
            >
              <img
                src={src}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                // Gọi hàm mở dialog thay vì xóa trực tiếp
                onClick={() => handleDeleteClick(index)}
                className="absolute top-2 right-2 bg-white p-1.5 rounded-full text-gray-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative w-full h-36 border-2 border-dashed rounded-lg transition-all duration-200 flex flex-col items-center justify-center cursor-pointer
          ${
            isDragOver
              ? "border-teal-500 bg-teal-50"
              : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
          onChange={handleFileSelect}
        />
        <div
          className={`p-3 rounded-full mb-3 ${
            isDragOver ? "bg-teal-100" : "bg-gray-100"
          }`}
        >
          <UploadCloud
            className={`w-6 h-6 ${
              isDragOver ? "text-teal-600" : "text-gray-500"
            }`}
          />
        </div>
        <p className="text-sm text-gray-700 text-center font-medium">
          <span className="text-teal-600 hover:underline">
            Click để tải ảnh
          </span>{" "}
          hoặc kéo thả vào đây
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PNG, JPG, WEBP, GIF (tối đa 10MB)
        </p>
      </div>

      {/* Dialog xác nhận xóa ảnh */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa hình ảnh?"
        message="Bạn có chắc chắn muốn xóa hình ảnh này không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
};

export default ImageUpload;
