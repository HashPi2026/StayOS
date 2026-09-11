import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: string;
  endIcon?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, startIcon, endIcon, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-[#44474e] mb-1.5">
            {label}
            {props.required && <span className="text-[#ba1a1a] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <span className="material-symbols-outlined absolute left-3 text-[#75859d] text-[18px] pointer-events-none">
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={`w-full bg-[#f2f4f6] text-[#191c1e] text-sm rounded-lg px-3.5 py-2.5 outline-none border transition-colors ${
              startIcon ? 'pl-9' : ''
            } ${endIcon ? 'pr-9' : ''} ${
              error
                ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]'
                : 'border-transparent focus:border-[#000000] focus:bg-white'
            } ${className}`}
            {...props}
          />
          {endIcon && (
            <span className="material-symbols-outlined absolute right-3 text-[#75859d] text-[18px] pointer-events-none">
              {endIcon}
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-[#ba1a1a]">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#75859d]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
