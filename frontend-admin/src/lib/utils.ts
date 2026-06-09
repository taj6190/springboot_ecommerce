import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-BD', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-BD', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CONFIRMED:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PROCESSING: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    SHIPPED:    'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    DELIVERED:  'bg-green-500/20 text-green-400 border-green-500/30',
    CANCELLED:  'bg-red-500/20 text-red-400 border-red-500/30',
    RETURNED:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
    PUBLISHED:  'bg-green-500/20 text-green-400 border-green-500/30',
    DRAFT:      'bg-gray-500/20 text-gray-400 border-gray-500/30',
    ARCHIVED:   'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return map[status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}
