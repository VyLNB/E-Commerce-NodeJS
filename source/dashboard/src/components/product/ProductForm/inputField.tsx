import type { ChangeEvent } from "react";

type InputTypes =
  | "text"
  | "number"
  | "email"
  | "password"
  | "tel"
  | "url"
  | "datetime-local"
  | "date"
  | "time";

interface InputFieldProps {
  name?: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: InputTypes;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-xs font-medium text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full focus:bg-white text-sm px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        required={required}
      />
    </div>
  );
};

export default InputField;
