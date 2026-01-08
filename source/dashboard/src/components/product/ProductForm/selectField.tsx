import { useState } from "react";
import { CheckIcon, ChevronDown } from "lucide-react";
import clsx from "clsx";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  addNewText?: string;
  onAddNew?: () => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  addNewText,
  onAddNew,
  className = "",
  // Nhan props moi
  isOpen: controlledIsOpen,
  onToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Xác định xem đang dùng chế độ nào (Controlled hay Uncontrolled)
  const isControlled = controlledIsOpen !== undefined && onToggle !== undefined;

  // Quyết định xem có hiển thị dropdown không dựa trên chế độ
  const showDropdown = isControlled ? controlledIsOpen : internalIsOpen;

  // Hàm xử lý khi click vào nút mở dropdown
  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  // Hàm xử lý đóng dropdown (dùng khi chọn item)
  const handleClose = () => {
    if (isControlled && onToggle && controlledIsOpen) {
      onToggle(); // Nếu đang mở thì toggle để đóng
    } else {
      setInternalIsOpen(false);
    }
  };

  return (
    <div className={`w-full relative ${className}`}>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          className="w-full text-sm px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex items-center justify-between"
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || placeholder}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              showDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-auto">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onChange(option);
                  handleClose(); // Đóng sau khi chọn
                }}
                className={clsx(
                  "w-full flex items-center justify-between text-sm px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150",
                  {
                    "text-gray-700": value.localeCompare(option) !== 0,
                    "text-teal-500": value.localeCompare(option) === 0,
                  }
                )}
              >
                {option}
                {value.localeCompare(option) === 0 && <CheckIcon size={18} />}
              </button>
            ))}
            {addNewText && onAddNew && (
              <button
                type="button"
                onClick={() => {
                  onAddNew();
                  handleClose(); // Đóng sau khi bấm add new
                }}
                className="text-sm w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 text-blue-600 border-t border-gray-100 font-medium"
              >
                + {addNewText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectField;
