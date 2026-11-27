"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  id: string;
  name: string;
}

interface ComboboxProps {
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function Combobox({
  id,
  ariaLabel,
  ariaLabelledBy,
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === value);

  const filteredOptions =
    query === ""
      ? options
      : options.filter((opt) =>
          opt.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleSelect = (selectedId: string) => {
    onChange(selectedId);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full text-left bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue/60 focus:bg-white/10 transition-all duration-200 flex justify-between items-center ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className={selectedOption ? "text-white" : "text-white/70"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-white/60 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-[#1a1f2e] border border-white/15 rounded-xl shadow-2xl overflow-hidden origin-top transition-opacity duration-150"
        >
          <div className="p-2 border-b border-white/10">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari..."
              aria-label={placeholder}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder-white/55 text-sm focus:outline-none focus:border-blue/50"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-56 overflow-auto py-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-white/65 text-center">
                Tidak ditemukan.
              </li>
            ) : (
              filteredOptions.map((opt) => (
                <li key={opt.id} role="option" aria-selected={value === opt.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer hover:bg-white/10 transition-colors ${
                      value === opt.id
                        ? "bg-blue/25 text-blue-300 font-semibold"
                        : "text-white/85"
                    }`}
                  >
                    {opt.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
