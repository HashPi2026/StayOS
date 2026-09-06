import React from 'react';
export const Badge = ({ children, variant = 'neutral', size = 'md', className = '', dot = false, }) => {
    const sizeStyles = {
        sm: 'text-[11px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
    }[size];
    const variantStyles = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    }[variant];
    const dotColors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
        info: 'bg-blue-500',
        neutral: 'bg-gray-400',
    }[variant];
    return (<span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeStyles} ${variantStyles} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`}/>}
      {children}
    </span>);
};
