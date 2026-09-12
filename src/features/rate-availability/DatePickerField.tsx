import React, { useRef } from 'react';
import { formatISODate, formatDisplayDate, parseDateInput } from './dateUtils';

interface DatePickerFieldProps {
  label: string;
  value: Date;
  onChange: (newDate: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  icon?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  icon = 'calendar_today',
  className = '',
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (disabled) return;
    try {
      if (inputRef.current && 'showPicker' in HTMLInputElement.prototype) {
        inputRef.current.showPicker();
      } else {
        inputRef.current?.focus();
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const parsed = parseDateInput(e.target.value);
    if (!isNaN(parsed.getTime())) {
      onChange(parsed);
    }
  };

  const isoValue = formatISODate(value);
  const displayValue = formatDisplayDate(value);

  return (
    <div
      onClick={handleContainerClick}
      className={`relative flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer select-none group ${className} ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      title="Click to open calendar date picker"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[12px] text-slate-500 font-medium">{label}</span>
        <span className="font-mono text-[13px] font-semibold text-slate-800 tracking-tight">
          {displayValue}
        </span>
      </div>

      <div className="flex items-center text-slate-400 group-hover:text-[#0058be] transition-colors ml-2">
        <span className="material-symbols-outlined text-[17px]">{icon}</span>
      </div>

      {/* Hidden native date input that provides the actual OS/browser calendar picker */}
      <input
        ref={inputRef}
        type="date"
        value={isoValue}
        min={minDate ? formatISODate(minDate) : undefined}
        max={maxDate ? formatISODate(maxDate) : undefined}
        onChange={handleDateChange}
        disabled={disabled}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full pointer-events-none"
        tabIndex={-1}
        aria-label={label}
      />
    </div>
  );
};
