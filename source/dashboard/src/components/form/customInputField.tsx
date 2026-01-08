import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

type CustomInputFieldProps = {
  label: string;
  name: string;
  value: string;
  placeHolderText?: string;
  type?: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
};

const CustomInputField = ({
  label,
  name,
  value,
  type,
  placeHolderText,
  readOnly = false,
  onChange,
}: CustomInputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";

  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          name={name}
          type={inputType}
          readOnly={readOnly}
          placeholder={placeHolderText}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm border p-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {type?.localeCompare("password") === 0 && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomInputField;
