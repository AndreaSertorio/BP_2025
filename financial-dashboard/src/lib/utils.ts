import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number): string => {
  // Usa formattazione consistente per evitare errori di hydration
  if (typeof window === 'undefined') {
    // Server-side: formato semplice senza separatori
    return `${Math.round(value)} €`;
  }
  // Client-side: formato localizzato
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function formatNumber(value: number, decimals: number = 0): string {
  if (typeof window === 'undefined') {
    return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  }
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  // Ensure consistent formatting between server and client
  const percentage = value * 100;
  
  // Use simple formatting to avoid hydration mismatches
  if (typeof window === 'undefined') {
    // Server-side: use simple toFixed
    return `${percentage.toFixed(decimals)}%`;
  }
  
  // Client-side: use same simple format
  return `${percentage.toFixed(decimals)}%`;
}

export function formatMillions(value: number, decimals: number = 1): string {
  if (typeof window === 'undefined') {
    // Server-side: formato semplice
    return `${value.toFixed(decimals)}M€`;
  }
  // Client-side: formato localizzato
  return `${formatNumber(value, decimals)}M€`;
}

export function formatThousands(value: number, decimals: number = 0): string {
  if (typeof window === 'undefined') {
    return `${(value / 1000).toFixed(decimals)}k€`;
  }
  return `${formatNumber(value / 1000, decimals)}k€`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
