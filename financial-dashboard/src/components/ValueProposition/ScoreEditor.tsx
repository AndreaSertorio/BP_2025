'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface ScoreEditorProps {
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  label?: string;
  disabled?: boolean;
  showNumeric?: boolean;
  variant?: 'stars' | 'fire' | 'numeric';
}

export function ScoreEditor({
  value,
  onChange,
  label,
  disabled = false,
  showNumeric = false,
  variant = 'stars',
}: ScoreEditorProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const getStarIcon = (index: number) => {
    const currentValue = hoverValue !== null ? hoverValue : value;
    const isFilled = index <= currentValue;
    
    if (variant === 'fire') {
      return (
        <span 
          className={`text-xl transition-all cursor-pointer ${
            isFilled ? 'opacity-100 scale-110' : 'opacity-30 scale-100'
          }`}
        >
          🔥
        </span>
      );
    }
    
    if (variant === 'numeric') {
      return (
        <button
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            isFilled 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-white border-gray-300 text-gray-600'
          }`}
          disabled={disabled}
        >
          {index}
        </button>
      );
    }

    return (
      <Star
        className={`h-5 w-5 transition-all cursor-pointer ${
          isFilled ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-gray-300'
        }`}
      />
    );
  };

  const handleClick = (newValue: number) => {
    if (!disabled && newValue >= 1 && newValue <= 5) {
      onChange(newValue as 1 | 2 | 3 | 4 | 5);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <div 
        className="flex gap-1"
        onMouseLeave={() => setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((index) => (
          <button
            key={index}
            type="button"
            className="focus:outline-none hover:scale-110 transition-transform"
            onMouseEnter={() => !disabled && setHoverValue(index)}
            onClick={() => handleClick(index)}
            disabled={disabled}
          >
            {getStarIcon(index)}
          </button>
        ))}
      </div>
      {showNumeric && (
        <span className="text-sm font-semibold text-gray-700 ml-1">
          {value}/5
        </span>
      )}
    </div>
  );
}

interface SeverityEditorProps {
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  label?: string;
  disabled?: boolean;
}

export function SeverityEditor({
  value,
  onChange,
  label,
  disabled = false,
}: SeverityEditorProps) {
  return (
    <ScoreEditor
      value={value}
      onChange={onChange}
      label={label}
      disabled={disabled}
      variant="fire"
      showNumeric={true}
    />
  );
}
