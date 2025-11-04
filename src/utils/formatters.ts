import { format, parseISO } from 'date-fns';
import { DATE_FORMATS } from './constants';

/**
 * Format date for display
 */
export const formatDate = (date: Date | string | null | undefined, formatStr: string = DATE_FORMATS.DISPLAY): string => {
  try {
    if (!date) return 'Chưa có';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    // Check if date is valid
    if (!dateObj || isNaN(dateObj.getTime())) {
      return 'Chưa có';
    }
    
    return format(dateObj, formatStr);
  } catch (error) {
    // Silently return fallback instead of logging to reduce console noise
    return 'Chưa có';
  }
};

/**
 * Format date with time for display
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

/**
 * Format date for API
 */
export const formatDateForAPI = (date: Date | string): string => {
  return formatDate(date, DATE_FORMATS.API);
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format: 0xxx xxx xxx
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  // Format: +84 xxx xxx xxx
  if (cleaned.length === 11 && cleaned.startsWith('84')) {
    return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

