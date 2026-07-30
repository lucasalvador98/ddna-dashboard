'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface AutocompleteFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onBlur?: () => void;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  error,
  onBlur,
}: AutocompleteFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Sync external value changes (e.g., when loading existing record)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (!options.includes(v)) {
      onChange('');
    }
  };

  const handleSelect = (opt: string) => {
    setInputValue(opt);
    onChange(opt);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (filteredOptions.length === 1 && inputValue) {
          handleSelect(filteredOptions[0]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        onBlur?.();
      }
    }, 200);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => { if (!isOpen) setIsOpen(true); }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || `Escribir ${label.toLowerCase()}`}
        required={required}
        autoComplete="off"
        className={clsx(
          'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent',
          error ? 'border-red-400' : 'border-slate-300'
        )}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
          ) : (
            filteredOptions.map((opt, i) => (
              <button
                key={opt}
                type="button"
                onMouseDown={e => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={clsx(
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  highlightedIndex === i
                    ? 'bg-[var(--ddna-blue)]/10 text-[var(--ddna-blue)] font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
