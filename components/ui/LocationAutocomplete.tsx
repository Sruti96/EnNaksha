"use client";

import { useEffect, useRef, useState } from "react";

type Prediction = { description: string; placeId: string };

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder,
  className,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleInput = (text: string) => {
    onChange(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(text)}`);
        const data = await res.json();
        const results: Prediction[] = data.predictions || [];
        setPredictions(results);
        setOpen(results.length > 0);
      } catch {
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => predictions.length > 0 && setOpen(true)}
        className={className}
        autoComplete="off"
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-inter text-xs text-muted animate-pulse">…</span>
      )}
      {open && predictions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-ivory border border-sand rounded-lg shadow-lg max-h-56 overflow-auto">
          {predictions.map((p) => (
            <li key={p.placeId}>
              <button
                type="button"
                onClick={() => {
                  onChange(p.description);
                  setPredictions([]);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-inter text-sm text-charcoal hover:bg-sand/60"
              >
                {p.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
