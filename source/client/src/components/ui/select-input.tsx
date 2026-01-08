// SelectInput.tsx

"use client";

import { Fragment } from "react";
import {
  Field,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import clsx from "clsx";

// Icon Chevron mặc định
const ChevronUpDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5 text-gray-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
    />
  </svg>
);

// Icon Check khi một item được chọn
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z"
      clipRule="evenodd"
    />
  </svg>
);

interface SelectInputProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  displayValue: (item: T) => string;
  label?: string;
  placeholder?: string;
}

export default function SelectInput<T>({
  label,
  options,
  placeholder = "Vui lòng chọn",
  value,
  onChange,
  displayValue,
}: SelectInputProps<T>) {
  return (
    <Field>
      {/* 1. Nhãn (Label) cho input */}
      {label && (
        <Label className="block text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}

      <Listbox value={value} onChange={onChange}>
        <div className={clsx("relative", label && "mt-2")}>
          {/* 2. Nút bấm, đây chính là ô input giả của chúng ta */}
          <ListboxButton className="relative w-full cursor-default rounded-md border px-4 py-3 text-left text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500  border-gray-300">
            <span className="block truncate">
              {/* 3. Hiển thị giá trị đã chọn hoặc placeholder */}
              {value ? displayValue(value) : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon />
            </span>
          </ListboxButton>

          <Transition
            as={Fragment}
            enter="transition ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none ">
              {options.map((option, index) => (
                <ListboxOption
                  key={index}
                  className={`relative cursor-default select-none px-4 py-2 hover:text-red-500 transition text-gray-900`}
                  value={option}
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${
                        selected ? "text-red-500" : "font-normal"
                      }`}
                    >
                      {displayValue(option)}
                    </span>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </Field>
  );
}
