/**
 * Password strength type definition
 */
type PasswordStrength = {
  strength: number;
  label: string;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calculate password strength
 * Returns strength level (0-5) and label
 */
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { strength: 0, label: '' };
  }

  let strength = 0;

  // Length check
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  const labels: { [key: number]: string } = {
    0: '',
    1: 'Zayıf',
    2: 'Orta',
    3: 'İyi',
    4: 'Güçlü',
    5: 'Çok Güçlü'
  };

  return {
    strength,
    label: labels[strength] || ''
  };
};

/**
 * Validate password requirements
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Şifre en az 6 karakter olmalıdır');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('En az bir küçük harf içermelidir');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('En az bir büyük harf içermelidir');
  }

  if (!/\d/.test(password)) {
    errors.push('En az bir rakam içermelidir');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate name format
 */
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

/**
 * Check if passwords match
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};
