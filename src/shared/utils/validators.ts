export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isStrongEnoughPassword = (value: string): boolean =>
  value.trim().length >= 8;
