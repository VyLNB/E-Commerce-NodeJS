import type { ChangeEvent } from "react";

interface TextAreaFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  className?: string;
  rows?: number;
  disabled?: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  rows = 4,
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full focus-within:bg-white text-sm px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
        required={required}
      />
    </div>
  );
};

export default TextAreaField;
