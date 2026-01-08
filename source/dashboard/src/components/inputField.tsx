import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = "",
  inputClassName = "",
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          px-4 py-3
          bg-gray-50
          border border-gray-200
          rounded-lg
          text-gray-900
          placeholder:text-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-teal-500
          focus:border-transparent
          disabled:bg-gray-100
          disabled:cursor-not-allowed
          transition-all
          duration-200
          ${error ? "border-red-500 focus:ring-red-500" : ""}
          ${inputClassName}
        `}
      />

      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default InputField;
