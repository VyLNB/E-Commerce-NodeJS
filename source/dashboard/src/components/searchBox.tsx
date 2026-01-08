import React, { useState, useEffect } from "react";
import { Search } from 'lucide-react'; // hoặc dùng icon khác

interface SearchBoxProps {
    onSearch?: (searchTerm: string) => void;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
    debounceMs?: number;
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
    onSearch, 
    placeholder = "", 
    className = "", 
    defaultValue = "",
    debounceMs = 300 
}) => {
    const [searchTerm, setSearchTerm] = useState(defaultValue);

    useEffect(() => {
        if (!onSearch) return;

        const timeoutId = setTimeout(() => {
            onSearch(searchTerm);
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, onSearch, debounceMs]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleClear = () => {
        setSearchTerm("");
    };

    return (
        <div className={`relative flex-1 max-w-md ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="
                    block w-full pl-10 pr-10 py-2 h-10 border border-gray-300 
                    rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none 
                    focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 
                    sm:text-sm"
            />
            
            {/* Clear button */}
            {searchTerm && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchBox;