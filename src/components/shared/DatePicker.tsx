'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { format, parse } from 'date-fns';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * DatePicker component that accepts DD-MM-YYYY format
 * Converts to/from HTML5 date input format (YYYY-MM-DD)
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  placeholder = 'DD-MM-YYYY',
  helperText,
  minDate,
  maxDate,
}) => {
  // Convert DD-MM-YYYY to YYYY-MM-DD for HTML input
  const htmlDateValue = value
    ? (() => {
        try {
          const parsed = parse(value, 'dd-MM-yyyy', new Date());
          return format(parsed, 'yyyy-MM-dd');
        } catch {
          return '';
        }
      })()
    : '';

  // Convert YYYY-MM-DD to DD-MM-YYYY for display
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const htmlDate = e.target.value;
    if (htmlDate) {
      try {
        const parsed = parse(htmlDate, 'yyyy-MM-dd', new Date());
        const formatted = format(parsed, 'dd-MM-yyyy');
        onChange(formatted);
      } catch {
        onChange('');
      }
    } else {
      onChange('');
    }
  };

  const minDateAttr = minDate ? format(minDate, 'yyyy-MM-dd') : undefined;
  const maxDateAttr = maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-black text-[#111] mb-2">
          {label}
          {required && <span className="text-[#d71927] ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none">
          <Calendar size={18} />
        </div>
        <input
          type="date"
          value={htmlDateValue}
          onChange={handleChange}
          disabled={disabled}
          min={minDateAttr}
          max={maxDateAttr}
          className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 bg-white text-[#111] text-sm font-medium outline-none transition placeholder:text-black/35
            ${error ? 'border-[#d71927] focus:ring-4 focus:ring-[#d71927]/10' : 'border-black/10 focus:border-[#d71927] focus:ring-4 focus:ring-[#d71927]/10'}
            ${disabled ? 'bg-[#f8f8f8] text-black/50 cursor-not-allowed' : 'hover:border-black/20'}`}
          aria-label={label}
        />
      </div>

      {error && <p className="mt-2 text-sm font-semibold text-[#d71927]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-black/50">{helperText}</p>}
    </div>
  );
};
