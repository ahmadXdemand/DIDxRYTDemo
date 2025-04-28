import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
  shape?: 'default' | 'rounded' | 'circle';
  className?: string;
  children: React.ReactNode;
}

const Button = ({ 
  variant = 'solid',
  shape = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) => {
  // Base classes
  const baseClasses = 'flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none';
  
  // Variant classes
  const variantClasses = {
    solid: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
  };
  
  // Shape classes
  const shapeClasses = {
    default: 'rounded-md px-4 py-2',
    rounded: 'rounded-full px-4 py-2',
    circle: 'rounded-full p-2'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${shapeClasses[shape]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 