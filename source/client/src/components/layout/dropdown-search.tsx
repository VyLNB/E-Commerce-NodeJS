// DropdownSearch.tsx
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { Search } from "lucide-react";
import React from "react";

interface DropdownSearchProps {
  placeholder: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  suggestions: string[];
  onSuggestionSelect: (suggestion: string) => void;
  onSearchSubmit: () => void;
}

export default function DropdownSearch({
  placeholder,
  searchTerm,
  onSearchChange,
  suggestions,
  onSuggestionSelect,
  onSearchSubmit,
}: DropdownSearchProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };
  return (
    <Menu as="div" className="relative text-left">
      <MenuButton
        className="p-2 text-gray-600 hover:text-red-500 transition"
        aria-label="Mở thanh tìm kiếm"
      >
        <Search size={24} />
      </MenuButton>

      <MenuItems
        transition
        className="absolute z-20 mt-2 w-screen right-0 translate-x-1/2 sm:right-0 sm:translate-x-0 origin-top-right rounded-lg bg-white p-2 shadow-lg -outline-offset-1 outline-black/50 transition 
                   data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder}
            className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 transition focus:ring-red-300 bg-gray-100 placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {suggestions.length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto border-t border-gray-200 pt-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition"
                onClick={() => onSuggestionSelect(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </MenuItems>
    </Menu>
  );
}
