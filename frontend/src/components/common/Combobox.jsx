import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

export function Combobox({ options, value, onChange, placeholder, label, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery(''); // Reset query on close to show selected value again
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredOptions = query === ''
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()) ||
        (option.subtitle && option.subtitle.toLowerCase().includes(query.toLowerCase()))
      );

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={wrapperRef}>
      {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${disabled ? 'bg-slate-50 cursor-not-allowed' : ''}`}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          value={isOpen ? query : (selectedOption?.label || '')}
          disabled={disabled}
        />
        <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
        >
            <ChevronsUpDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </button>
      </div>

      {isOpen && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
          {filteredOptions.length === 0 && query !== '' ? (
            <li className="relative cursor-default select-none px-4 py-2 text-slate-500">
              No results found.
            </li>
          ) : (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                className={`relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                  option.value === value ? 'bg-primary/5 text-primary' : 'text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setQuery('');
                  setIsOpen(false);
                }}
              >
                <span className={`block truncate ${option.value === value ? 'font-medium' : 'font-normal'}`}>
                  {option.label}
                </span>
                {option.subtitle && (
                    <span className={`block truncate text-xs ${option.value === value ? 'text-primary/70' : 'text-slate-500'}`}>
                    {option.subtitle}
                    </span>
                )}
                {option.value === value ? (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

