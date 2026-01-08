// src/components/product/ProductForm/optionTitle.tsx

import { Edit, Save, X } from "lucide-react";
import { useState } from "react";

type Props = {
  title: string;
  tags: string[];
  isEditable?: boolean;
  onTitleChange?: (newTitle: string) => void;
};

const OptionTitle = ({
  title,
  tags,
  isEditable = false,
  onTitleChange,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleSave = () => {
    if (newTitle.trim() && newTitle !== title && onTitleChange) {
      onTitleChange(newTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewTitle(title);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-2 text-sm items-start py-2 border-b border-gray-100 last:border-b-0">
      {/* Cột Tên Tùy Chọn */}
      <div className="flex items-center gap-2 pr-4">
        {isEditing ? (
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="font-medium text-base p-1 border border-teal-300 rounded focus:ring-teal-500 w-full"
          />
        ) : (
          <h4 className="font-medium text-base flex items-center gap-2">
            {title}
            {isEditable && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
                title="Đổi tên tùy chọn"
              >
                <Edit size={16} />
              </button>
            )}
          </h4>
        )}
      </div>

      {/* Cột Giá trị Tags */}
      <div className="flex flex-wrap gap-2 pt-1">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="inline-block text-xs py-1.5 px-3 rounded-full bg-gray-100 text-gray-700 font-medium"
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptionTitle;
