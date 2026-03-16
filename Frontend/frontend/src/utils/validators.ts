/**
 * Password strength type definition
 */
export interface PasswordStrength {
  strength: number;
  label: string;
}

/**
 * Username validation result type
 */
export interface UsernameValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Password validation result type
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username (Backend kuralları: SignupDto)
 * - Min 3, Max 30 karakter
 * - Sadece: harf, rakam, - ve _
 * - Boşluk ve özel karakterler yasak
 */
export const validateUsername = (username: string): UsernameValidation => {
  // Boş kontrol
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: 'Kullanıcı adı boş olamaz' };
  }

  // Minimum uzunluk kontrolü
  if (username.length < 3) {
    return { isValid: false, error: 'Kullanıcı adı en az 3 karakter olmalıdır' };
  }

  // Maximum uzunluk kontrolü
  if (username.length > 30) {
    return { isValid: false, error: 'Kullanıcı adı en fazla 30 karakter olabilir' };
  }

  // Karakter kontrolü (sadece harf, rakam, -, _)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { 
      isValid: false, 
      error: 'Kullanıcı adı sadece harf, rakam, - ve _ içerebilir' 
    };
  }

  return { isValid: true };
};

/**
 * Validate password (Backend kuralları: SignupDto)
 * - Min 8, Max 128 karakter
 * - En az 1 büyük harf
 * - En az 1 rakam
 * - En az 1 özel karakter
 */
export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];

  // Boş kontrol
  if (!password || password.trim().length === 0) {
    errors.push('Şifre boş olamaz');
    return { isValid: false, errors };
  }

  // Minimum uzunluk kontrolü (Backend: min 8)
  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }

  // Maximum uzunluk kontrolü (Backend: max 128)
  if (password.length > 128) {
    errors.push('Şifre çok uzun (max 128 karakter)');
  }

  // Büyük harf kontrolü (Backend regex: (?=.*[A-Z]))
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('En az bir büyük harf içermelidir');
  }

  // Rakam kontrolü (Backend regex: (?=.*[0-9]))
  if (!/(?=.*[0-9])/.test(password)) {
    errors.push('En az bir rakam içermelidir');
  }

  // Özel karakter kontrolü (Backend regex: (?=.*[^A-Za-z0-9]))
  if (!/(?=.*[^A-Za-z0-9])/.test(password)) {
    errors.push('En az bir özel karakter içermelidir (!@#$%^&* vb.)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate password strength (Updated for backend rules)
 * Returns strength level (0-5) and label
 */
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { strength: 0, label: '' };
  }

  let strength = 0;

  // Length checks (Backend min: 8)
  if (password.length >= 8) strength++;  // Minimum requirement
  if (password.length >= 12) strength++; // Good length

  // Character variety checks (Backend requirements)
  if (/(?=.*[A-Z])/.test(password)) strength++; // Uppercase
  if (/(?=.*[0-9])/.test(password)) strength++; // Number
  if (/(?=.*[^A-Za-z0-9])/.test(password)) strength++; // Special char

  const labels: { [key: number]: string } = {
    0: '',
    1: 'Çok Zayıf',
    2: 'Zayıf',
    3: 'Orta',
    4: 'Güçlü',
    5: 'Çok Güçlü'
  };

  return {
    strength,
    label: labels[strength] || ''
  };
};

/**
 * Check if passwords match
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};

/**
 * Validate email with length check (Backend: max 255)
 */
export const validateEmailWithLength = (email: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'E-posta adresi boş olamaz' };
  }

  if (email.length > 255) {
    return { isValid: false, error: 'E-posta adresi çok uzun (max 255 karakter)' };
  }

  if (!validateEmail(email)) {
    return { isValid: false, error: 'Geçerli bir e-posta adresi giriniz' };
  }

  return { isValid: true };
};


/**
 * Validate login identifier (email or username)
 */
export const validateIdentifier = (identifier: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!identifier || identifier.trim().length === 0) {
    return { isValid: false, error: 'E-posta veya kullanıcı adı boş olamaz' };
  }

  if (identifier.length > 255) {
    return { isValid: false, error: 'Çok uzun (max 255 karakter)' };
  }

  return { isValid: true };
};