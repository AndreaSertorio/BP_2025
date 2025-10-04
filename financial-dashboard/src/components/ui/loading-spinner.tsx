import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function LoadingCard({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        {description && <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>}
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-4/6"></div>
      </div>
    </div>
  );
}

export function LoadingChart({ height = 300 }: { height?: number }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
      <div 
        className="bg-gray-100 rounded animate-pulse flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <LoadingSpinner size="lg" text="Loading chart..." />
      </div>
    </div>
  );
}
