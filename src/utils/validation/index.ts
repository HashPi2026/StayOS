export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPin = (pin: string, expectedLength = 4): boolean => {
  if (!pin) return false;
  const pinRegex = new RegExp(`^\\d{${expectedLength}}$`);
  return pinRegex.test(pin.trim());
};

export const isNonEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};
