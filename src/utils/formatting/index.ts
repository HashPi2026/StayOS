export const formatCurrency = (
  amount: number,
  currency = 'USD',
  symbol = '$'
): string => {
  if (isNaN(amount)) return `${symbol}0.00`;
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (
  dateInput: string | Date | undefined,
  locale = 'en-US'
): string => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPercentage = (value: number, decimals = 1): string => {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};
