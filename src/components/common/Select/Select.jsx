import React, { forwardRef } from 'react';
export const Select = forwardRef(({ label, error, options, children, className = '', id, ...props }, ref) => {
    return (<div className="w-full">
        {label && (<label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-[#44474e] mb-1.5">
            {label}
            {props.required && <span className="text-[#ba1a1a] ml-1">*</span>}
          </label>)}
        <div className="relative">
          <select ref={ref} id={id} className={`w-full bg-[#f2f4f6] text-[#191c1e] text-sm rounded-lg px-3.5 py-2.5 outline-none border transition-colors appearance-none pr-9 cursor-pointer ${error
            ? 'border-[#ba1a1a] focus:border-[#ba1a1a]'
            : 'border-transparent focus:border-[#000000] focus:bg-white'} ${className}`} {...props}>
            {options
            ? options.map((opt) => (<option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>))
            : children}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#75859d] text-[18px] pointer-events-none">
            expand_more
          </span>
        </div>
        {error && <p className="mt-1 text-xs text-[#ba1a1a]">{error}</p>}
      </div>);
});
Select.displayName = 'Select';
