'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Edit2 } from 'lucide-react';

interface InlineEditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  placeholder?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function InlineEditableText({
  value,
  onSave,
  className = '',
  inputClassName = '',
  multiline = false,
  placeholder = 'Click to edit',
  autoSave = true,
  autoSaveDelay = 2000,
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);

    if (autoSave) {
      // Cancel previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule auto-save
      timeoutRef.current = setTimeout(async () => {
        if (newValue !== value) {
          setIsSaving(true);
          try {
            await onSave(newValue);
            setIsEditing(false);
          } catch (error) {
            console.error('Auto-save error:', error);
          } finally {
            setIsSaving(false);
          }
        }
      }, autoSaveDelay);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        className={`group relative cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors ${className}`}
        onClick={() => setIsEditing(true)}
      >
        <span className={editValue ? '' : 'text-gray-400 italic'}>
          {editValue || placeholder}
        </span>
        <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1/2 -translate-y-1/2" />
      </div>
    );
  }

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="flex items-start gap-2">
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`flex-1 px-2 py-1 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${inputClassName} ${
          multiline ? 'min-h-[80px] resize-y' : ''
        }`}
        disabled={isSaving}
      />
      {!autoSave && (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )}
      {isSaving && (
        <div className="text-xs text-gray-500 animate-pulse">Saving...</div>
      )}
    </div>
  );
}
