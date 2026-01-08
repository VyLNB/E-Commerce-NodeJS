interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`
                inline-flex items-center justify-center gap-1
                px-3 py-2 rounded-md
                bg-teal-500 hover:bg-teal-600 
                text-white font-medium text-xs
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                shadow-sm hover:shadow-md
                h-10
                ${className}
            `}
    >
      {children}
    </button>
  );
};

export default Button;
