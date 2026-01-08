"use client";

import React, { InputHTMLAttributes, useState } from "react";
import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface CustomInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  register?: UseFormRegister<any>;
  errors?: FieldErrors<FieldValues>;
  helperText?: string;
  className?: string;
  validation?: {
    required?: string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
  };
}

export default function CustomInputField({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  helperText,
  className = "",
  disabled = false,
  validation,
  ...rest
}: CustomInputFieldProps) {
  const error = errors?.[name];

  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";

  const inputClasses = `
    w-full 
    rounded-lg 
    border 
    p-3
    text-gray-700
    placeholder-gray-400 
    focus:outline-none 
    focus:ring-2 
    transition 
    duration-150
    ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
    ${
      error
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/50"
    }
  `;

  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          type={inputType}
          placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
          disabled={disabled}
          {...(register ? register(name, validation) : {})}
          {...rest}
          className={inputClasses + (isPasswordField ? " pr-10" : "")}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff size={24} className="text-gray-400" aria-hidden="true" />
            ) : (
              <Eye size={24} className="text-gray-400" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message as string}</p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
