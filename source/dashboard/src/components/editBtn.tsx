import React from 'react';
import type { ProductItem } from '../interface/productInterface';
import { FaEdit } from 'react-icons/fa';

interface DetailButtonProps {
  product: ProductItem;
  onClick?: (product: ProductItem) => void; // Hàm xử lý khi click
  className?: string; // Class tùy chỉnh
}

const EditButton: React.FC<DetailButtonProps> = ({ product, onClick, className = '' }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  return (
    <div className={`inline-flex items-center justify-center h-full ${className}`}>
      <button 
        onClick={handleClick}
        className={`
            transition-colors duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-red-500
            focus:ring-opacity-50
            rounded
            p-1
        `}
        title='Sửa'
      >
        <FaEdit className="w-5 h-5" />
      </button>
    </div>
  );
};

export default EditButton;