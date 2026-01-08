import { Trash } from 'lucide-react';

interface DeleteBtnProps {
    onDelete?: () => void | Promise<void>;
    disabled?: boolean;
    className?: string;
}

const deleteBtn = ({ onDelete, disabled = false, className = '' }: DeleteBtnProps) => {
    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (disabled || !onDelete) return;
        
        try {
            await onDelete();
        } catch (error) {
            console.error('Lỗi khi xóa:', error);
        }
    };

    return (
        <div className={`inline-flex items-center justify-center h-full ${className}`}>
            <button 
                onClick={handleClick}
                disabled={disabled}
                className={`
                    ${disabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-500 hover:text-red-700'
                    }
                    transition-colors duration-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-red-500
                    focus:ring-opacity-50
                    rounded
                    p-1
                `}
                title={disabled ? 'Không thể xóa' : 'Xóa'}
            >
                <Trash className="w-5 h-5" />
            </button>
        </div>
    );
};

export default deleteBtn;